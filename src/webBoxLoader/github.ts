import type { FileItem } from '../types/fileSystem.ts';
import {
  BaseLoader,
  type ProgressCallback,
  type GithubParams,
} from './types.ts';

export default class GithubLoader extends BaseLoader {
  readonly name = 'GitHub Loader';
  readonly params: GithubParams;
  readonly onProgress: ProgressCallback;

  constructor(params: GithubParams, onProgress: ProgressCallback) {
    super();
    this.params = params;
    this.onProgress = onProgress;
  }

  protected async performLoad(): Promise<FileItem> {
    /*
    const json = await this.fetch_json(this.params.url, 0, 2);
    for (let i=0;i<1000;i++){
    this.onProgress({message:'test', percent: i/3});
    await new Promise(r => setTimeout(r, 10));
    }
    this.onProgress({message:'test', percent: 50});
    await new Promise(r => setTimeout(r, 2000));*/
    return { id: '123', name: 'ex.json', type: 'file', content: '' };
  }
}
