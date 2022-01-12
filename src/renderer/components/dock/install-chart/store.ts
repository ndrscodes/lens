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

import { action, autorun, makeObservable } from "mobx";
import { TabId, TabKind } from "../store";
import { DockTabStorageLayer, DockTabStore, DockTabStoreDependencies } from "../dock-tab/store";
import { getChartDetails, getChartValues } from "../../../../common/k8s-api/endpoints/helm-chart.api";
import { Notifications } from "../../notifications";

export interface IChartInstallData {
  name: string;
  repo: string;
  version: string;
  values?: string;
  releaseName?: string;
  description?: string;
  namespace?: string;
  lastVersion?: boolean;
}

interface Dependencies extends DockTabStoreDependencies {
  chartVersionManager: DockTabStorageLayer<string[]>;
}

export interface InstallChartManager extends DockTabStorageLayer<IChartInstallData> {
  loadValues: (tabId: TabId) => Promise<void>;
}

export class InstallChartStore extends DockTabStore<IChartInstallData> implements InstallChartManager {
  constructor(protected readonly dependencies: Dependencies) {
    super({
      storageKey: "install_charts",
    }, dependencies);
    makeObservable(this);
    autorun(() => {
      const { selectedTab, isOpen } = this.dependencies.dockStore;

      if (selectedTab?.kind === TabKind.INSTALL_CHART && isOpen) {
        this.loadData(selectedTab.id)
          .catch(err => Notifications.error(String(err)));
      }
    }, { delay: 250 });
  }

  @action
  protected async loadData(tabId: string) {
    const promises = [];

    if (!this.getData(tabId).values) {
      promises.push(this.loadValues(tabId));
    }

    if (!this.dependencies.chartVersionManager.getData(tabId)) {
      promises.push(this.loadVersions(tabId));
    }

    await Promise.all(promises);
  }

  @action
  protected async loadVersions(tabId: TabId) {
    const { repo, name, version } = this.getData(tabId);

    this.dependencies.chartVersionManager.clearData(tabId); // reset
    const charts = await getChartDetails(repo, name, { version });
    const versions = charts.versions.map(chartVersion => chartVersion.version);

    this.dependencies.chartVersionManager.setData(tabId, versions);
  }

  @action
  async loadValues(tabId: TabId): Promise<void> {
    for (let i = 0; i < 4; i += 1) {
      const data = this.getData(tabId);
      const { repo, name, version } = data;
      const values = await getChartValues(repo, name, version);

      if (values) {
        this.setData(tabId, { ...data, values });
      }
    }
  }
}
