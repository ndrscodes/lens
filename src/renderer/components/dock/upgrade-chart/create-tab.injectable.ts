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

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-release.api";
import { bind } from "../../../utils";
import { type DockTabCreateSpecific, TabKind, DockStore } from "../store";
import dockStoreInjectable from "../store.injectable";
import type { UpgradeChartStore } from "./store";
import upgradeChartStoreInjectable from "./store.injectable";

interface Dependencies {
  upgradeChartStore: UpgradeChartStore;
  dockStore: DockStore;
}

function createUpgradeChartTab({ upgradeChartStore, dockStore }: Dependencies, release: HelmRelease, tabParams: DockTabCreateSpecific = {}) {
  let tab = upgradeChartStore.getTabByRelease(release.getName());

  if (tab) {
    dockStore.open();
    dockStore.selectTab(tab.id);
  }

  if (!tab) {
    tab = dockStore.createTab({
      title: `Helm Upgrade: ${release.getName()}`,
      ...tabParams,
      kind: TabKind.UPGRADE_CHART,
    }, false);

    upgradeChartStore.setData(tab.id, {
      releaseName: release.getName(),
      releaseNamespace: release.getNs(),
    });
  }

  return tab;
}

const newUpgradeChartTabInjectable = getInjectable({
  instantiate: (di) => bind(createUpgradeChartTab, null, {
    dockStore: di.inject(dockStoreInjectable),
    upgradeChartStore: di.inject(upgradeChartStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default newUpgradeChartTabInjectable;
