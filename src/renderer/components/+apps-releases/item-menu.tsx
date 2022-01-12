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

import React from "react";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-release.api";
import { cssNames, noop } from "../../utils";
import type { ReleaseStore } from "./store";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import newUpgradeChartTabInjectable from "../dock/upgrade-chart/create-tab.injectable";
import { observer } from "mobx-react";
import releaseStoreInjectable from "./store.injectable";

export interface HelmReleaseMenuProps extends MenuActionsProps {
  release: HelmRelease | null | undefined;
  hideDetails?: () => void;
}

interface Dependencies {
  newUpgradeChartTab: (release: HelmRelease) => void;
  releaseStore: ReleaseStore;
  openRollbackReleaseDialog: (release: HelmRelease) => void;
}

const NonInjectedHelmReleaseMenu = observer(({
  newUpgradeChartTab,
  release,
  hideDetails = noop,
  releaseStore,
  openRollbackReleaseDialog,
  toolbar,
  className,
  ...menuProps
}: Dependencies & HelmReleaseMenuProps) => {
  if (!release) {
    return null;
  }

  const remove = () => releaseStore.remove(release);
  const upgrade = () => {
    newUpgradeChartTab(release);
    hideDetails();
  };
  const rollback = () => openRollbackReleaseDialog(release);

  return (
    <MenuActions
      {...menuProps}
      className={cssNames("HelmReleaseMenu", className)}
      removeAction={remove}
      removeConfirmationMessage={() => <p>Remove Helm Release <b>{release.name}</b>?</p>}
    >
      {release.getRevision() > 1 && (
        <MenuItem onClick={rollback}>
          <Icon material="history" interactive={toolbar} tooltip="Rollback"/>
          <span className="title">Rollback</span>
        </MenuItem>
      )}
      <MenuItem onClick={upgrade}>
        <Icon material="refresh" interactive={toolbar} tooltip="Upgrade"/>
        <span className="title">Upgrade</span>
      </MenuItem>
    </MenuActions>
  );
});

export const HelmReleaseMenu = withInjectables<Dependencies, HelmReleaseMenuProps>(NonInjectedHelmReleaseMenu, {
  getProps: (di, props) => ({
    newUpgradeChartTab: di.inject(newUpgradeChartTabInjectable),
    releaseStore: di.inject(releaseStoreInjectable),
    openRollbackReleaseDialog: di.inject(openReleaseRollbackDialogInjectable),
    ...props,
  }),
});
