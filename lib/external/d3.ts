import { DOMParser } from "npm:linkedom@0.15.1";

export * as d3 from "npm:d3@7.8.2";
export * as d3types from "https://cdn.skypack.dev/-/d3@v7.8.2-xzCqOnvGzQkNaPfc30G2/dist=es2019,mode=types/index";
export * as d3geo from "npm:d3-geo-projection@4"

if (globalThis.document === undefined) {
  globalThis.document = new DOMParser().parseFromString(
    `<!DOCTYPE html><html lang="en"><body></body></html>`,
    "text/html",
  );
}
