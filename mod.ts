import Site from 'lume/core/site.ts';
import { dirname, join } from 'std/path/mod.ts';
import { assets, components } from './config.ts';

interface Options {
  assetPath?: string;
  componentNamespace?: string;
}

const namespaceToPath = (namespace: string) =>
  join(...namespace.split('.').filter((x) => x));

export default function (options?: Options) {
  const baseUrl = new URL(import.meta.url);
  baseUrl.pathname = dirname(baseUrl.pathname);

  const assetPath = options?.assetPath?.trim().replace(/\/+$/, '') || '/assets';
  const componentNamespace = namespaceToPath(
    options?.componentNamespace || 'oi.charts'
  );

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

    for (const component of components) {
      const localComponentPath = getLocalPath(
        component,
        join('_components', componentNamespace)
      );
      const remoteComponentPath = getRemotePath(component, 'components');
      site.remoteFile(localComponentPath, remoteComponentPath);
    }
  };
}
