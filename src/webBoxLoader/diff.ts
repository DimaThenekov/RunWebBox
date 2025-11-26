interface DraftChangeObject<T> {
  added: boolean;
  removed: boolean;
  count: number;
  previousComponent?: DraftChangeObject<T>;
  value?: T[];
}

interface ChangeObject<T> {
  added: boolean;
  removed: boolean;
  count: number;
  value: T[];
}

interface Path<T> {
  oldPos: number;
  lastComponent: DraftChangeObject<T> | undefined;
}

interface AllDiffOptions {
  maxEditLength?: number;
  timeout?: number;
}
export default class Diff<
  TokenT = number,
  ValueT = Iterable<TokenT>,
  InputValueT = ValueT,
> {
  public diffWithOptionsObj(
    oldTokens: TokenT[],
    newTokens: TokenT[],
    options: AllDiffOptions
  ): ChangeObject<TokenT>[] | undefined {
    const done = (value: ChangeObject<TokenT>[]) => {
      value = this.postProcess(value, options);

      return value;
    };

    const newLen = newTokens.length,
      oldLen = oldTokens.length;
    let editLength = 1;
    let maxEditLength = newLen + oldLen;
    if (options.maxEditLength != null) {
      maxEditLength = Math.min(maxEditLength, options.maxEditLength);
    }
    const maxExecutionTime = options.timeout ?? Infinity;
    const abortAfterTimestamp = Date.now() + maxExecutionTime;

    const bestPath: (Path<TokenT> | undefined)[] = [
      { oldPos: -1, lastComponent: undefined },
    ];

    let newPos = this.extractCommon(bestPath[0]!, newTokens, oldTokens, 0);
    if (bestPath[0]!.oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
      return done(
        this.buildValues(bestPath[0]!.lastComponent, newTokens, oldTokens)
      );
    }
    let minDiagonalToConsider = -Infinity,
      maxDiagonalToConsider = Infinity;

    const execEditLength = () => {
      for (
        let diagonalPath = Math.max(minDiagonalToConsider, -editLength);
        diagonalPath <= Math.min(maxDiagonalToConsider, editLength);
        diagonalPath += 2
      ) {
        let basePath;
        const removePath = bestPath[diagonalPath - 1],
          addPath = bestPath[diagonalPath + 1];
        if (removePath) {
          bestPath[diagonalPath - 1] = undefined;
        }

        let canAdd = false;
        if (addPath) {
          const addPathNewPos = addPath.oldPos - diagonalPath;
          canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
        }

        const canRemove = removePath && removePath.oldPos + 1 < oldLen;
        if (!canAdd && !canRemove) {
          bestPath[diagonalPath] = undefined;
          continue;
        }
        if (!canRemove || (canAdd && removePath.oldPos < addPath!.oldPos)) {
          basePath = this.addToPath(addPath!, true, false, 0);
        } else {
          basePath = this.addToPath(removePath, false, true, 1);
        }

        newPos = this.extractCommon(
          basePath,
          newTokens,
          oldTokens,
          diagonalPath
        );

        if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
          return (
            done(
              this.buildValues(basePath.lastComponent, newTokens, oldTokens)
            ) || true
          );
        } else {
          bestPath[diagonalPath] = basePath;
          if (basePath.oldPos + 1 >= oldLen) {
            maxDiagonalToConsider = Math.min(
              maxDiagonalToConsider,
              diagonalPath - 1
            );
          }
          if (newPos + 1 >= newLen) {
            minDiagonalToConsider = Math.max(
              minDiagonalToConsider,
              diagonalPath + 1
            );
          }
        }
      }

      editLength++;
    };

    while (editLength <= maxEditLength && Date.now() <= abortAfterTimestamp) {
      const ret = execEditLength();
      if (ret) {
        return ret as ChangeObject<TokenT>[];
      }
    }
  }

  private addToPath<TokenT>(
    path: Path<TokenT>,
    added: boolean,
    removed: boolean,
    oldPosInc: number
  ): Path<TokenT> {
    const last = path.lastComponent;
    if (last && last.added === added && last.removed === removed) {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: {
          count: last.count + 1,
          added: added,
          removed: removed,
          previousComponent: last.previousComponent,
        },
      };
    } else {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: {
          count: 1,
          added: added,
          removed: removed,
          previousComponent: last,
        },
      };
    }
  }

  private extractCommon(
    basePath: Path<TokenT>,
    newTokens: TokenT[],
    oldTokens: TokenT[],
    diagonalPath: number
  ): number {
    const newLen = newTokens.length,
      oldLen = oldTokens.length;
    let oldPos = basePath.oldPos,
      newPos = oldPos - diagonalPath,
      commonCount = 0;

    while (
      newPos + 1 < newLen &&
      oldPos + 1 < oldLen &&
      this.equals(oldTokens[oldPos + 1], newTokens[newPos + 1])
    ) {
      newPos++;
      oldPos++;
      commonCount++;
    }

    if (commonCount) {
      basePath.lastComponent = {
        count: commonCount,
        previousComponent: basePath.lastComponent,
        added: false,
        removed: false,
      };
    }

    basePath.oldPos = oldPos;
    return newPos;
  }

  equals(left: TokenT, right: TokenT): boolean {
    return left === right;
  }

  removeEmpty(array: TokenT[]): TokenT[] {
    const ret: TokenT[] = [];
    for (let i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  castInput(value: InputValueT, _options: AllDiffOptions): ValueT {
    return value as unknown as ValueT;
  }

  postProcess(
    changeObjects: ChangeObject<TokenT>[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: AllDiffOptions
  ): ChangeObject<TokenT>[] {
    return changeObjects;
  }

  get useLongestToken(): boolean {
    return false;
  }

  private buildValues(
    lastComponent: DraftChangeObject<TokenT> | undefined,
    newTokens: TokenT[],
    oldTokens: TokenT[]
  ): ChangeObject<TokenT>[] {
    // First we convert our linked list of components in reverse order to an
    // array in the right order:
    const components: DraftChangeObject<TokenT>[] = [];
    let nextComponent;
    while (lastComponent) {
      components.push(lastComponent);
      nextComponent = lastComponent.previousComponent;
      delete lastComponent.previousComponent;
      lastComponent = nextComponent;
    }
    components.reverse();

    const componentLen = components.length;
    let componentPos = 0,
      newPos = 0,
      oldPos = 0;

    for (; componentPos < componentLen; componentPos++) {
      const component = components[componentPos];
      if (!component.removed) {
        if (!component.added && this.useLongestToken) {
          let value = newTokens.slice(newPos, newPos + component.count);
          value = value.map(function (value, i) {
            const oldValue = oldTokens[oldPos + i];
            return (oldValue as string).length > (value as string).length
              ? oldValue
              : value;
          });

          component.value = value;
        } else {
          component.value = newTokens.slice(newPos, newPos + component.count);
        }
        newPos += component.count;

        // Common case
        if (!component.added) {
          oldPos += component.count;
        }
      } else {
        component.value = oldTokens.slice(oldPos, oldPos + component.count);
        oldPos += component.count;
      }
    }

    return components as ChangeObject<TokenT>[];
  }
}

function encodeNumber(value: number): number[] {
  const bytes = [];
  while (value > 0x7f) {
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  bytes.push(value);
  return bytes;
}

function decodeNumber(
  data: number[],
  offset: number
): { value: number; offset: number } {
  let value = 0;
  let shift = 0;
  let byte;
  do {
    byte = data[offset++];
    value |= (byte & 0x7f) << shift;
    shift += 7;
  } while (byte & 0x80);
  return { value, offset };
}

export function getDiff(
  src: number[],
  modify: number[],
  compressor = (x: number[]) => x
): number[] | undefined {
  const diff = new Diff().diffWithOptionsObj(src, modify, {
    timeout: 500,
    maxEditLength: 1000,
  });
  if (!diff) return undefined;
  const result = [];

  for (const chunk of diff) {
    if (chunk.added) {
      result.push(...encodeNumber((chunk.count - 1) * 3 + 1));
      result.push(...compressor(chunk.value));
    } else if (chunk.removed) {
      result.push(...encodeNumber((chunk.count - 1) * 3 + 2));
    } else {
      result.push(...encodeNumber((chunk.count - 1) * 3));
    }
  }

  return result;
}

export function applyDiff(
  src: number[],
  diff: number[],
  decompressor = (x: number[]) => x
): number[] {
  const result = [];
  let srcIndex = 0;
  let diffIndex = 0;

  while (diffIndex < diff.length) {
    const { value: value, offset } = decodeNumber(diff, diffIndex);
    const type = value % 3;
    const count = Math.floor(value / 3) + 1;
    diffIndex = offset;
    let compressedData;

    switch (type) {
      case 0:
        for (let i = 0; i < count; i++) {
          if (srcIndex < src.length) {
            result.push(src[srcIndex++]);
          }
        }
        break;

      case 1:
        compressedData = diff.slice(diffIndex, diffIndex + count);
        diffIndex += count;
        result.push(...decompressor(compressedData));
        break;

      case 2:
        srcIndex += count;
        break;
    }
  }

  while (srcIndex < src.length) {
    result.push(src[srcIndex++]);
  }

  return result;
}
