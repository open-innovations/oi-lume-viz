import Site from "lume/core/site.ts";
import { dirname } from "./deps.ts";
import { afterEach, beforeEach, describe, it } from "std/testing/bdd.ts";
import {
  assertSpyCallArg,
  assertSpyCalls,
  Stub,
  stub,
} from "std/testing/mock.ts";
// TODO mock this call out
import { assets, components } from "./config.ts";

import theModule from "./mod.ts";

const baseUrl = dirname(import.meta.url);

describe("module", () => {
  let fakeSite: Site;
  let stubs: Stub[];

  beforeEach(() => {
    fakeSite = new Site();
    stubs = [stub(fakeSite, "remoteFile"), stub(fakeSite, "copy")];
  });

  afterEach(() => {
    stubs.forEach((s) => s.restore());
  });

  it("should load remote files", () => {
    theModule()(fakeSite);

    const calls = assets.length + components.length;

    assertSpyCalls(<Stub> fakeSite.remoteFile, calls);
    assertSpyCallArg(<Stub> fakeSite.remoteFile, 0, 0, `/assets/${assets[0]}`);
    assertSpyCallArg(
      <Stub> fakeSite.remoteFile,
      0,
      1,
      `${baseUrl}/assets/${assets[0]}`,
    );
  });

  it("should copy each file separately", () => {
    theModule()(fakeSite);

    const calls = assets.length;

    assertSpyCalls(<Stub> fakeSite.copy, calls);
    assertSpyCallArg(<Stub> fakeSite.copy, 0, 0, `/assets/${assets[0]}`);
  });

  it("should allow asset path to be set", () => {
    theModule({
      assetPath: "/fakePath",
    })(fakeSite);

    assertSpyCallArg(
      <Stub> fakeSite.remoteFile,
      0,
      0,
      `/fakePath/${assets[0]}`,
    );
    assertSpyCallArg(
      <Stub> fakeSite.remoteFile,
      0,
      1,
      `${baseUrl}/assets/${assets[0]}`,
    );
    assertSpyCallArg(<Stub> fakeSite.copy, 0, 0, `/fakePath/${assets[0]}`);
  });

  it("should allow remove trailing slashes from the asset path to be set", () => {
    theModule({
      assetPath: "/fakePath////",
    })(fakeSite);

    assertSpyCallArg(
      <Stub> fakeSite.remoteFile,
      0,
      0,
      `/fakePath/${assets[0]}`,
    );
    assertSpyCallArg(<Stub> fakeSite.copy, 0, 0, `/fakePath/${assets[0]}`);
  });

  it("should default the component namespace to `oi`", () => {
    theModule()(fakeSite);
    // This is a bit fragile
    assertSpyCallArg(
      <Stub> fakeSite.remoteFile,
      assets.length,
      0,
      `_components/oi/${components[0]}`,
    );
  });

  it("should allow the component namespace to be overriden `oi.components`", () => {
    theModule({
      componentNamespace: "oi.components",
    })(fakeSite);
    // This is a bit fragile
    assertSpyCallArg(
      <Stub> fakeSite.remoteFile,
      assets.length,
      0,
      `_components/oi/components/${components[0]}`,
    );
  });
});
