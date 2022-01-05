/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { computeDefaultShortName } from "../helpers";

describe("catalog helper tests", () => {
  describe("computeDefaultShortName", () => {
    it.each([
      ["a", "a"],
      ["", "??"],
      [1, "??"],
      [true, "??"],
      ["ab", "ab"],
      ["abc", "ab"],
      ["abcde", "ab"],
      ["ab-cd", "ac"],
      ["ab-cd la", "al"],
      ["ab-cd la_1", "al"],
      ["ab-cd la 1_3", "al1"],
      ["ab-cd la 1_3 lk", "al1"],
      ["ab-cd la 1_3 lk aj", "al1"],
      ["😀 a", "😀a"],
      ["😀😎 a", "😀a"],
      ["🇫🇮 Finland", "🇫🇮F"],
      ["إعجم", "إع"],
    ])("should compute from %p into %p", (input: any, output: string) => {
      expect(computeDefaultShortName(input)).toBe(output);
    });
  });
});
