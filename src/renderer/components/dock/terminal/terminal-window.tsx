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

import "./terminal-window.scss";

import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { cssNames, disposer } from "../../../utils";
import type { Terminal } from "./terminal";
import type { TerminalStore } from "./store";
import { ThemeStore } from "../../../theme.store";
import { TabKind, TabId, DockStore } from "../store";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "../store.injectable";
import terminalStoreInjectable from "./store.injectable";

interface Dependencies {
  dockStore: DockStore;
  terminalStore: TerminalStore;
}

const NonInjectedTerminalWindow = observer(({ dockStore, terminalStore }: Dependencies) => {
  const element = useRef<HTMLDivElement>();
  const [terminal, setTerminal] = useState<Terminal | null>(null);

  const activate = (tabId: TabId) => {
    terminal?.detach(); // detach previous

    const newTerminal = terminalStore.getTerminal(tabId);

    setTerminal(newTerminal);
    newTerminal.attachTo(element.current);
  };

  useEffect(() => disposer(
    dockStore.onTabChange(({ tabId }) => activate(tabId), {
      tabKind: TabKind.TERMINAL,
      fireImmediately: true,
    }),

    // refresh terminal available space (cols/rows) when <Dock/> resized
    dockStore.onResize(() => terminal?.fitLazy(), {
      fireImmediately: true,
    }),
  ), []);

  return (
    <div
      className={cssNames("TerminalWindow", ThemeStore.getInstance().activeTheme.type)}
      ref={element}
    />
  );
});

export const TerminalWindow = withInjectables<Dependencies>(NonInjectedTerminalWindow, {
  getProps: (di, props) => ({
    dockStore: di.inject(dockStoreInjectable),
    terminalStore: di.inject(terminalStoreInjectable),
    ...props,
  }),
});
