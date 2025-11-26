import { DOMParser } from "npm:linkedom@0.15.1";

export * as d3 from "npm:d3@7.9.0";

if (globalThis.document === undefined) {
  globalThis.document = new DOMParser().parseFromString(
    `<!DOCTYPE html><html lang="en"><body></body></html>`,
    "text/html",
  );
}
