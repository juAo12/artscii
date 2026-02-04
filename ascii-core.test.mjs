import assert from "node:assert/strict";
import { computeTargetSize, imageDataToAscii } from "./ascii-core.js";

{
  const s = computeTargetSize(100, 100, 80);
  assert.equal(s.w, 80);
  assert.ok(s.h > 0);
}

{
  const w = 2;
  const h = 2;
  const data = new Uint8ClampedArray([
    0, 0, 0, 255,
    255, 255, 255, 255,
    255, 0, 0, 255,
    0, 0, 255, 255,
  ]);
  const ascii = imageDataToAscii({ width: w, height: h, data }, w);
  assert.equal(ascii.split("\n").length, 2);
  assert.equal(ascii.split("\n")[0].length, 2);
}

console.log("ok");

