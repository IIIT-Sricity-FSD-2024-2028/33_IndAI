import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url),
  {
    parseCsv,
    writeCsv,
  } = require("../back-end/dist/modules/institutes/csv.js");
test("CSV handles BOM, CRLF, quoted commas, escaped quotes and multiline cells", () => {
  const r = parseCsv(
    '\ufeffname,note\r\n"Jessie, Reddy","Line 1\nLine ""2"""\r\n',
  );
  assert.deepEqual(r, [{ name: "Jessie, Reddy", note: 'Line 1\nLine "2"' }]);
});
test("CSV rejects duplicate headers, mismatched columns, unclosed quotes and oversized batches", () => {
  for (const text of [
    "a,a\nx,y",
    "a,b\nx",
    'a,b\n"x,y',
    "a\n" + Array(501).fill("x").join("\n"),
  ])
    assert.throws(() => parseCsv(text));
});
test("CSV export quotes fields and neutralizes spreadsheet formula prefixes", () => {
  const out = writeCsv([["=1+1", 'Jessie "Reddy"']]);
  assert.equal(out, '"\'=1+1","Jessie ""Reddy"""');
});
