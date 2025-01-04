// biome-ignore lint/correctness/noUndeclaredDependencies : biome can't see mocha in this module's package.json?
import { reporters } from "mocha";

// The JetBrains/TeamCity/mocha reporter looks specifically for a
// loadable import/require from "./lib/reporters/base.js".  In mocha,
// this module exports the Base Reporter class which all Reporter
// classes are supposed to inherit from.
//
// Instead of locking their reporter to a specific version of mocha,
// and risk it running into conflict with the installed and running
// version, they try to load and use this Base.
// We don't want to run into the same problem, so we just re-export
// the peer-mocha's Base from the same import/require location.
//
// But ... at least for JetBrains, they also rely on some old
// CommonJS features like `require.main`, so we need to signal to
// the loader (likely node, but maybe tsx or something else) that
// it needs to provide a CJS context for this module.  That's
// done by the `{ type: "commonjs" }` package.json two directories up.

export default reporters.Base;
