let assetPrefix = '/assets';

export function getAssetPath(asset: string) {
  return assetPrefix + asset;
}

export function setAssetPrefix(prefix: string) {
  assetPrefix = prefix;
}