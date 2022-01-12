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
import type { HelmChart } from "../../../../common/k8s-api/endpoints/helm-chart.api";
import { bind } from "../../../utils";
import type { DockTabStorageLayer } from "../dock-tab/store";
import { type DockTabCreateSpecific, TabKind, DockTabCreator } from "../store";
import dockStoreInjectable from "../store.injectable";
import type { IChartInstallData } from "./store";
import installChartManagerInjectable from "./store.injectable";

interface Dependencies {
  dockManager: DockTabCreator;
  installChartManager: DockTabStorageLayer<IChartInstallData>;
}

function createInstallChartTab({ dockManager, installChartManager }: Dependencies, chart: HelmChart, tabParams: DockTabCreateSpecific = {}) {
  const { name, repo, version } = chart;
  const tab = dockManager.createTab({
    title: `Helm Install: ${repo}/${name}`,
    ...tabParams,
    kind: TabKind.INSTALL_CHART,
  }, false);

  installChartManager.setData(tab.id, {
    name,
    repo,
    version,
    namespace: "default",
    releaseName: "",
    description: "",
  });

  return tab;
}

const newInstallChartTabInjectable = getInjectable({
  instantiate: (di) => bind(createInstallChartTab, null, {
    dockManager: di.inject(dockStoreInjectable),
    installChartManager: di.inject(installChartManagerInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default newInstallChartTabInjectable;
