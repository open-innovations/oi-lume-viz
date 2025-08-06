import Site from "lume/core/site.ts";
import { dirname } from './deps.ts';
import { assets, components } from "./config.ts";
import { setAssetPrefix } from "./lib/util/paths.ts";
import { setDefaultColours } from "./lib/colour/colours.ts";
import { setDefaultFonts } from "./lib/font/fonts.ts";
import { setDefaultMap } from "./lib/tiles/layers.ts";

/**
 * Options interface specifying available options to the module
 */
interface Options {
  assetPath?: string;
  componentNamespace?: string;
  colour?: {
    background?: string;
	names?: Record<string, string>;
    scales?: Record<string, string>;
  };
}

/**
 * Joins an array of strings into a path
 */
const pathjoin = (...array: string[]) => array.join("/");

/**
 * Converts a namespace to a filessystem path
 *
 * Takes a dotted namespace string and converts into a file path string.
 * This reverses the logic applied
 *
 * e.g. `oi.charts` will become 'oi/charts' assuming the OS file separator is `/`,
 * which the `pathjoin` function knows.
 *
 * @param namespace
 * @returns string
 */
const namespaceToPath = (namespace: string) =>
  pathjoin(...namespace.split(".").filter((x) => x));

/**
 * This is the module load function. It takes a set of options and does lots of things...
 *
 * This is called by `site.use(...)` in a Lume `_config.js` or `_config.ts`.
 *
 * TODO document all the things it does here.
 *
 * @param options
 * @returns
 */
export default function (options?: Options) {
  // Work out where this file is imported from (it'll be local path or url) and create a new URL
  const baseUrl = new URL(import.meta.url);
  console.log(import.meta.url, baseUrl);

  // Strip the filename from the baseUrl path - giving the import root of this module
  baseUrl.pathname = dirname(baseUrl.pathname);

  // Option processing
  // Get the asset path from options (which might not exist) and tidy up. Set to `/assets` if not provided.
  const assetPath = options?.assetPath?.trim().replace(/\/+$/, "") || "/assets";
  // Get the file path for the component namespace (or `oi.charts` if not provided).
  const componentNamespace = namespaceToPath(
    options?.componentNamespace || "oi",
  );

  // Set the default colour options
  if(options?.colour) setDefaultColours(options.colour);

  // Set the default font options
  if(options?.font) setDefaultFonts(options.font);

  // Set the default map options
  if(options?.map) setDefaultMap(options.map);

  // Update the assetPrefix to allow for correct referencing of dependencies
  setAssetPrefix(assetPath);

  /**
   * Function to return url for remote file to load from this repo
   *
   * @param prefix
   * @param name
   * @returns
   */
  function getRemotePath(prefix: string, name: string) {
    const assetUrl = new URL(baseUrl.toString());
    console.log({
      prefix, name, assetPath
    });
    assetUrl.hash = "";
    assetUrl.pathname = [baseUrl.pathname, prefix, name].join("/");
    return assetUrl.toString();
  }

  /**
   * Return a function to be called by Lume when using this module.
   */
  return (site: Site) => {

    // Helper function to allow flexible use of Lume 3 or Lume 2.
    const addToSite = (...params) => {
      // Try to use the site.add function added as part of Lume 3
      try {
        site.add(...params);
      } catch(error: unknown) {
        // If that fails as a result of a TypeError
        if (error instanceof TypeError) {
          // Use site.copy instead
          site.copy(...params);
          return;
        }
        throw error;
      };
    }

    // Iterate over the list of `assets` imported from `config.ts` in this module.
    // This is an array of path strings for assets to load.
    // These files will be copied over verbatim to the built site
    for (const asset of assets) {
      // Set the local and remote path for this asset
      // `localAssetPath` is where the file will reside in the built site
      const localAssetPath = pathjoin(
        assetPath,
        asset,
      );
      // `remoteAssetPath` is the source location for the file
      const remoteAssetPath = getRemotePath(
        "assets",
        asset,
      );
      // Register the asset as a remoteFile in the Lume site using this module.
      site.remoteFile(localAssetPath, remoteAssetPath);
      // Just copy that file over intact
      addToSite(localAssetPath);
    }

    // Iterate over the list of `components` imported from `config.ts` in this module.
    // This is an array of path strings for components to register.
    // These files will be available as components when building the site
    for (const component of components) {
      // Local component path - where the component will be in the site build context
      // Places in the component namespace so components can be accessed as `comp.oi.charts.<name>`
      const localComponentPath = pathjoin(
        "_components",
        componentNamespace,
        component,
      );
      // Remote component path - source of the component in this module
      const remoteComponentPath = getRemotePath(
        "components",
        component,
      );
      // Register the component file
      site.remoteFile(localComponentPath, remoteComponentPath);
    }
  };
}
