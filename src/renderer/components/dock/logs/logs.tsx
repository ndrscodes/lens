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

import React, { useEffect, useRef, useState } from "react";
import { reaction } from "mobx";
import { observer } from "mobx-react";

import type { LogSearchStore } from "../log-search/store";
import { cssNames } from "../../../utils";
import type { DockTabData } from "../dock/store";
import { InfoPanel } from "../info-panel/info-panel";
import { LogResourceSelector } from "./log-resource-selector";
import { LogList } from "./log-list";
import type { LogsStore } from "./store";
import { LogSearch } from "../log-search/log-search";
import { LogControls } from "./log-controls";
import type { LogTabStore } from "../log-tab/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import logSearchStoreInjectable from "../log-search/store.injectable";
import logTabStoreInjectable from "../log-tab/store.injectable";
import logsStoreInjectable from "./store.injectable";

export interface LogsProps {
  className?: string
  tab: DockTabData
}

interface Dependencies {
  logSearchStore: LogSearchStore;
  logTabStore: LogTabStore;
  logsStore: LogsStore;
}

const NonInjectedLogs = observer(({ className, tab, logTabStore, logSearchStore, logsStore }: Dependencies & LogsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const logListElement = useRef<React.ElementRef<typeof LogList>>();

  const load = async () => {
    setIsLoading(true);
    await logsStore.load(tab.id);
    setIsLoading(false);
  };
  const reload = async () => {
    logsStore.clearLogs(tab.id);
    await load();
  };
  const toOverlay = () => {
    const { activeOverlayLine } = logSearchStore;

    if (!logListElement.current || activeOverlayLine === undefined) return;
    // Scroll vertically
    logListElement.current.scrollToItem(activeOverlayLine, "center");
    // Scroll horizontally in timeout since virtual list need some time to prepare its contents
    setTimeout(() => {
      const overlay = document.querySelector(".PodLogs .list span.active");

      if (!overlay) return;
      overlay.scrollIntoViewIfNeeded();
    }, 100);
  };

  useEffect(() => reaction(
    () => tab.id,
    reload,
    { fireImmediately: true },
  ), []);

  const logs = logsStore.logs;
  const data = logTabStore.getData(tab.id);
  const resourceSelector = data
    ? (
      <InfoPanel
        tabId={tab.id}
        showSubmitClose={false}
        showButtons={false}
        showStatusPanel={false}
        controls={(
          <div className="flex gaps">
            <LogResourceSelector
              tabId={tab.id}
              tabData={data}
              save={newData => logTabStore.setData(tab.id, { ...data, ...newData })}
              reload={reload}
            />
            <LogSearch
              onSearch={toOverlay}
              logs={data.showTimestamps ? logsStore.logs : logsStore.logsWithoutTimestamps}
              toPrevOverlay={toOverlay}
              toNextOverlay={toOverlay}
            />
          </div>
        )}
      />
    )
    : null;

  return (
    <div className={cssNames("PodLogs flex column", className)}>
      {resourceSelector}
      <LogList
        logs={logs}
        id={tab.id}
        isLoading={isLoading}
        load={load}
        ref={logListElement}
      />
      <LogControls
        logs={logs}
        tabData={data}
        save={newData => logTabStore.setData(tab.id, { ...data, ...newData })}
        reload={reload}
      />
    </div>
  );
});

export const Logs = withInjectables<Dependencies, LogsProps>(NonInjectedLogs, {
  getProps: (di, props) => ({
    logSearchStore: di.inject(logSearchStoreInjectable),
    logTabStore: di.inject(logTabStoreInjectable),
    logsStore: di.inject(logsStoreInjectable),
    ...props,
  }),
});
