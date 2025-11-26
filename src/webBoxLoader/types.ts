import type { FileItem } from '../types/fileSystem';

export interface LoadProgress {
  percent: number;
  message: string;
}

export type ProgressCallback = (progress: LoadProgress) => void;

// Стратегии загрузки
export interface FileLoader {
  readonly name: string;
  load(onProgress?: ProgressCallback): Promise<FileItem>;
}

// Параметры для разных стратегий
export interface GithubParams {
  type: 'github';
  url: string;
}

export interface DirectParams {
  type: 'data';
  data: string;
}

export interface ZipUrlParams {
  type: 'zip_url';
  url: string;
}

export type LoaderParams = GithubParams | DirectParams | ZipUrlParams;

export abstract class BaseLoader implements FileLoader {
  abstract readonly name: string;
  abstract readonly onProgress: ProgressCallback;

  async load(): Promise<FileItem> {
    this.onProgress({ message: 'Loading...', percent: 0 });
    return await this.performLoad(this.onProgress);
  }

  async fetch_json(
    url: string,
    file_number: number,
    number_of_files: number
  ): Promise<object> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : undefined;
    const start_load = +new Date();

    let loaded = 0;
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const chunks: Uint8Array[] = [];
    let last_update = +new Date();
    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        if (value) {
          chunks.push(value);
          loaded += value.length;
          if (last_update < +new Date() - 50) {
            const percent = total
              ? (100 * loaded) / total
              : 100 - 100 / (1 + (+new Date() - start_load) / 10);
            console.log(percent);
            this.onProgress({
              message: 'Loading ' + url,
              percent:
                (file_number / number_of_files) * 100 +
                percent / number_of_files,
            });
            last_update = +new Date();
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    this.onProgress({
      message: 'Loading done!',
      percent: ((file_number + 1) / number_of_files) * 100,
    });

    await new Promise(r => setTimeout(r, 1));

    const combined = new Uint8Array(loaded);
    let position = 0;
    for (const chunk of chunks) {
      combined.set(chunk, position);
      position += chunk.length;
    }

    const text = new TextDecoder().decode(combined);
    return JSON.parse(text);
  }

  protected abstract performLoad(
    onProgress?: ProgressCallback
  ): Promise<FileItem>;
}
