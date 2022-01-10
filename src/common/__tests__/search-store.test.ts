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

import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { LogSearchStore } from "../../renderer/components/dock/log-search/store";
import logSearchStoreInjectable from "../../renderer/components/dock/log-search/store.injectable";
import type { DockStore } from "../../renderer/components/dock/store";
import dockStoreInjectable from "../../renderer/components/dock/store.injectable";
import { getDiForUnitTesting } from "../getDiForUnitTesting";

jest.mock("electron", () => ({
  app: {
    getPath: () => "/foo",
  },
}));

const logs = [
  "1:M 30 Oct 2020 16:17:41.553 # Connection with replica 172.17.0.12:6379 lost",
  "1:M 30 Oct 2020 16:17:41.623 * Replica 172.17.0.12:6379 asks for synchronization",
  "1:M 30 Oct 2020 16:17:41.623 * Starting Partial resynchronization request from 172.17.0.12:6379 accepted. Sending 0 bytes of backlog starting from offset 14407.",
];

describe("search store tests", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let logSearchStore: LogSearchStore;

  beforeEach(() => {
    di = getDiForUnitTesting();

    di.override(dockStoreInjectable, () => {
      return {} as DockStore;
    });
    logSearchStore = di.inject(logSearchStoreInjectable);
  });

  it("does nothing with empty search query", () => {
    logSearchStore.onSearch([], "");
    expect(logSearchStore.occurrences).toEqual([]);
  });

  it("doesn't break if no text provided", () => {
    logSearchStore.onSearch(null, "replica");
    expect(logSearchStore.occurrences).toEqual([]);

    logSearchStore.onSearch([], "replica");
    expect(logSearchStore.occurrences).toEqual([]);
  });

  it("find 3 occurrences across 3 lines", () => {
    logSearchStore.onSearch(logs, "172");
    expect(logSearchStore.occurrences).toEqual([0, 1, 2]);
  });

  it("find occurrences within 1 line (case-insensitive)", () => {
    logSearchStore.onSearch(logs, "Starting");
    expect(logSearchStore.occurrences).toEqual([2, 2]);
  });

  it("sets overlay index equal to first occurrence", () => {
    logSearchStore.onSearch(logs, "Replica");
    expect(logSearchStore.activeOverlayIndex).toBe(0);
  });

  it("set overlay index to next occurrence", () => {
    logSearchStore.onSearch(logs, "172");
    logSearchStore.setNextOverlayActive();
    expect(logSearchStore.activeOverlayIndex).toBe(1);
  });

  it("sets overlay to last occurrence", () => {
    logSearchStore.onSearch(logs, "172");
    logSearchStore.setPrevOverlayActive();
    expect(logSearchStore.activeOverlayIndex).toBe(2);
  });

  it("gets line index where overlay is located", () => {
    logSearchStore.onSearch(logs, "synchronization");
    expect(logSearchStore.activeOverlayLine).toBe(1);
  });

  it("escapes string for using in regex", () => {
    const regex = LogSearchStore.escapeRegex("some.interesting-query\\#?()[]");

    expect(regex).toBe("some\\.interesting\\-query\\\\\\#\\?\\(\\)\\[\\]");
  });

  it("gets active find number", () => {
    logSearchStore.onSearch(logs, "172");
    logSearchStore.setNextOverlayActive();
    expect(logSearchStore.activeFind).toBe(2);
  });

  it("gets total finds number", () => {
    logSearchStore.onSearch(logs, "Starting");
    expect(logSearchStore.totalFinds).toBe(2);
  });
});
