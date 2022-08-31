import Site from 'lume/core/site.ts';
import { assets } from './config.ts';
import { dirname, join } from 'std/path/mod.ts';

interface Options {
  assetPath?: string;
}

export default function (options?: Options) {
  const baseUrl = new URL(import.meta.url);
  baseUrl.pathname = dirname(baseUrl.pathname);

  const assetPath = options?.assetPath?.trim().replace(/\/+$/, '') || '/assets';

  function getLocalPath(name: string, prefix: string) {
    return join(prefix, name);
  }

  function getRemotePath(name: string, prefix: string) {
    const assetUrl = new URL(baseUrl.toString());
    assetUrl.pathname = [baseUrl.pathname, prefix, name].join('/');
    return assetUrl.toString();
  }

  return (site: Site) => {
    for (const asset of assets) {
      const localAssetPath = getLocalPath(asset, assetPath);
      const remoteAssetPath = getRemotePath(asset, 'assets');
      site.remoteFile(localAssetPath, remoteAssetPath);
      site.copy(localAssetPath);
    }
  };
}
