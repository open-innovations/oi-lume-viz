import Site from 'lume/core/site.ts';
import { dirname } from "std/path/mod.ts";
import { assets } from './config.ts';

interface Options {
  assetPath?: string;
}

export default function (options?: Options) {
  const baseUrl = new URL(import.meta.url);
  baseUrl.pathname = dirname(baseUrl.pathname);

  const assetPath = options?.assetPath?.trim().replace(/\/+$/, '') || '/assets';

  function getLocalAssetPath(local: string): string {
    return `${assetPath}/${local}`;
  }

  function getRemoteAssetPath(local: string): string {
    const assetUrl = new URL(baseUrl.toString());
    assetUrl.pathname = `${baseUrl.pathname}/assets/${local}`;
    return assetUrl.toString();
  }
  
  return (site: Site) => {
    for (const asset of assets) {
      const localAssetPath = getLocalAssetPath(asset);
      const remoteAssetPath = getRemoteAssetPath(asset);
      site.remoteFile(localAssetPath, remoteAssetPath);
      site.copy(localAssetPath);
    }
  }
}