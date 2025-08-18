import type { ScopeInfo, SourceMapJson } from "../../../src/scopes.js";
/**
 * Encodes the `ScopeInfo` into a source map JSON object.
 *
 * If `inputSourceMap` is provided, `encode` will augment the "names" array and
 * overwrite the "scopes" field, before returning the provided `inputSourceMap` again.
 */ export declare function encode(scopesInfo: ScopeInfo, inputSourceMap?: SourceMapJson): SourceMapJson;
//# sourceMappingURL=encode.d.ts.map