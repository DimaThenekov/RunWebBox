import type { ProgressCallback } from './types';
import GithubLoader from './github';
import type { WebBoxConfig } from '../types/webBoxConfig';
import { exportWebBox } from './normalize';
import type { FileItem } from '../types/fileSystem';

export async function loadWebBox(
  url: URL,
  onProgress: ProgressCallback
): Promise<WebBoxConfig> {
  try {
    const fs = await parseUrl(url, onProgress);
    const conf = exportWebBox(fs);
    //if (url.searchParams.has('diff')) {
    //}

    return conf;
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    onProgress({ message: `Error: ${errorMessage}`, percent: 100 });
    return exportWebBox({ id: '', name: '', type: 'folder' });
  }
}

async function parseUrl(
  url: URL,
  onProgress: ProgressCallback
): Promise<FileItem> {
  let conf: FileItem | null = null;
  // GitHub loader
  if (url.searchParams.has('github')) {
    conf = await new GithubLoader(
      {
        type: 'github',
        url: url.searchParams.get('github')!,
      },
      onProgress
    ).load();
  }

  if (!conf) {
    throw new Error('');
  }

  return conf;
}
