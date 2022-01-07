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
import { observer } from "mobx-react";
import React, { useState } from "react";
import { isMac } from "../../../../common/vars";
import { cssNames, isMiddleClick, prevDefault } from "../../../utils";
import { Icon } from "../../icon";
import { Menu, MenuItem } from "../../menu";
import { Tab, TabProps } from "../../tabs";
import type { DockStore, DockTabData } from "../dock/store";
import dockStoreInjectable from "../dock/store.injectable";
import "./dock-tab.scss";

export interface DockTabProps extends TabProps<DockTabData> {
  moreActions?: React.ReactNode;
}

interface Dependencies {
  dockStore: DockStore;
}

const NonInjectedDockTab = observer(({ dockStore, value: tab, className, moreActions, ...tabProps }: Dependencies & DockTabProps) => {
  const [menuIsVisible, setMenuIsVisible] = useState(false);

  const close = () => dockStore.closeTab(tab.id);

  const { title, pinned } = tab;
  const closeAllDisabled = dockStore.tabs.length === 1;
  const closeOtherDisabled = dockStore.tabs.length === 1;
  const closeRightDisabled = dockStore.getTabIndex(tab.id) === dockStore.tabs.length - 1;

  return (
    <>
      <Tab
        {...tabProps}
        value={tab}
        id={`tab-${tab.id}`}
        className={cssNames("DockTab", className, { pinned })}
        onContextMenu={() => setMenuIsVisible(true)}
        label={
          <div className="flex gaps align-center" onAuxClick={isMiddleClick(prevDefault(close))}>
            <span className="title" title={title}>{title}</span>
            {moreActions}
            {!pinned && (
              <Icon
                small material="close"
                tooltip={`Close ${isMac ? "⌘+W" : "Ctrl+W"}`}
                onClick={prevDefault(close)}
              />
            )}
          </div>
        }
      />
      <Menu
        usePortal
        htmlFor={`tab-${tab.id}`}
        className="DockTabMenu"
        isOpen={menuIsVisible}
        open={() => setMenuIsVisible(true)}
        close={() => setMenuIsVisible(false)}
        toggleEvent="contextmenu"
      >
        <MenuItem onClick={close}>
            Close
        </MenuItem>
        <MenuItem onClick={() => dockStore.closeAllTabs()} disabled={closeAllDisabled}>
            Close all tabs
        </MenuItem>
        <MenuItem onClick={() => dockStore.closeOtherTabs(tab.id)} disabled={closeOtherDisabled}>
            Close other tabs
        </MenuItem>
        <MenuItem onClick={() => dockStore.closeTabsToTheRight(tab.id)} disabled={closeRightDisabled}>
            Close tabs to the right
        </MenuItem>
      </Menu>
    </>
  );
});

export const DockTab = withInjectables<Dependencies, DockTabProps>(NonInjectedDockTab, {
  getProps: (di, props) => ({
    dockStore: di.inject(dockStoreInjectable),
    ...props,
  }),
});
