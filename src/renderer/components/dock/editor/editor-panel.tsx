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

import { withInjectables } from "@ogre-tools/injectable-react";
import throttle from "lodash/throttle";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useRef } from "react";
import { cssNames, disposer } from "../../../utils";
import { MonacoEditor, MonacoEditorProps } from "../../monaco-editor";
import type { DockStore, TabId } from "../dock/store";
import dockStoreInjectable from "../dock/store.injectable";
import styles from "./editor-panel.module.scss";

export interface EditorPanelProps {
  tabId: TabId;
  value: string;
  className?: string;
  /**
   * If `true` then the editor will be focused on mounting
   *
   * @default true
   */
  autoFocus?: boolean;
  onChange: MonacoEditorProps["onChange"];
  onError?: MonacoEditorProps["onError"];
}

interface Dependencies {
  dockStore: DockStore;
}

const NonInjectedEditorPanel = observer(({
  dockStore,
  tabId,
  value,
  onChange,
  onError,
  autoFocus = true,
  className,
}: Dependencies & EditorPanelProps) => {
  const editor = useRef<MonacoEditor>();

  useEffect(() => disposer(
    // keep focus on editor's area when <Dock/> just opened
    reaction(
      () => dockStore.isOpen,
      isOpen => {
        if (isOpen) {
          editor.current?.focus();
        }
      },
      {
        fireImmediately: true,
      },
    ),

    // focus to editor on dock's resize or turning into fullscreen mode
    dockStore.onResize(throttle(() => editor.current?.focus(), 250)),
  ), []);

  if (!tabId) {
    return null;
  }

  return (
    <MonacoEditor
      autoFocus={autoFocus}
      id={tabId}
      value={value}
      className={cssNames(styles.EditorPanel, className)}
      onChange={onChange}
      onError={onError}
      ref={editor}
    />
  );
});

export const EditorPanel = withInjectables<Dependencies, EditorPanelProps>(NonInjectedEditorPanel, {
  getProps: (di, props) => ({
    dockStore: di.inject(dockStoreInjectable),
    ...props,
  }),
});
