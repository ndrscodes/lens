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

import "./upgrade-chart.scss";

import React, { useEffect, useState } from "react";
import { computed, observable, reaction } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../../utils";
import type { DockTabData } from "../dock/store";
import { InfoPanel } from "../info-panel/info-panel";
import { Spinner } from "../../spinner";
import { releaseStore } from "../../+apps-releases/release.store";
import { Badge } from "../../badge";
import { EditorPanel } from "../editor/editor-panel";
import { helmChartStore, IChartVersion } from "../../+apps-helm-charts/helm-chart.store";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { Select, SelectOption } from "../../select";
import type { UpgradeChartStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import upgradeChartStoreInjectable from "./store.injectable";
import type { DockTabStore } from "../dock-tab/store";
import upgradeChartValuesInjectable from "./values.injectable";

export interface UpgradeChartProps {
  className?: string;
  tab: DockTabData;
}

interface Dependencies {
  upgradeChartStore: UpgradeChartStore;
  upgradeChartValues: DockTabStore<string>;
}

const NonInjectedUpgradeChart = observer(({ upgradeChartStore, tab, className, upgradeChartValues }: Dependencies & UpgradeChartProps) => {
  const [error, setError] = useState("");
  const [versions] = useState(observable.array<IChartVersion>());
  const [version, setVersion] = useState<IChartVersion | undefined>();

  const compRelease = computed(() => {
    const tabData = upgradeChartStore.getData(tab.id);

    if (!tabData) {
      return null;
    }

    return releaseStore.getByName(tabData.releaseName);
  });
  const loadVersions = async (release: null | HelmRelease) => {
    if (!release) {
      return;
    }

    setVersion(undefined);
    versions.clear();

    versions.replace(await helmChartStore.getVersions(release.getChart()));
    setVersion(versions[0]);
  };

  useEffect(() => reaction(
    () => compRelease.get(),
    loadVersions,
    {
      fireImmediately: true,
    },
  ), []);

  const onChange = (value: string) => {
    setError("");
    upgradeChartValues.setData(tab.id, value);
  };

  const onError = (error: Error | string) => {
    setError(error.toString());
  };

  const release = compRelease.get();
  const releaseName = release.getName();
  const releaseNs = release.getNs();
  const currentVersion = release.getVersion();
  const value = upgradeChartValues.getData(tab.id);

  if (!release || upgradeChartStore.isLoading() || !version) {
    return <Spinner center />;
  }

  const upgrade = async () => {
    if (error) {
      return null;
    }

    await releaseStore.update(releaseName, releaseNs, {
      chart: release.getChart(),
      values: value,
      repo: version.repo,
      version: version.version,
    });

    return (
      <p>
        Release <b>{releaseName}</b> successfully upgraded to version <b>{version}</b>
      </p>
    );
  };

  const formatVersionLabel = ({ value }: SelectOption<IChartVersion>) => {
    const chartName = release.getChart();
    const { repo, version } = value;

    return `${repo}/${chartName}-${version}`;
  };

  const controlsAndInfo = (
    <div className="upgrade flex gaps align-center">
      <span>Release</span> <Badge label={releaseName} />
      <span>Namespace</span> <Badge label={releaseNs} />
      <span>Version</span> <Badge label={currentVersion} />
      <span>Upgrade version</span>
      <Select
        className="chart-version"
        menuPlacement="top"
        themeName="outlined"
        value={version}
        options={versions}
        formatOptionLabel={formatVersionLabel}
        onChange={({ value }: SelectOption) => setVersion(value)}
      />
    </div>
  );

  return (
    <div className={cssNames("UpgradeChart flex column", className)}>
      <InfoPanel
        tabId={tab.id}
        error={error}
        submit={upgrade}
        submitLabel="Upgrade"
        submittingMessage="Updating.."
        controls={controlsAndInfo}
      />
      <EditorPanel
        tabId={tab.id}
        value={value}
        onChange={onChange}
        onError={onError}
      />
    </div>
  );
});

export const UpgradeChart = withInjectables<Dependencies, UpgradeChartProps>(NonInjectedUpgradeChart, {
  getProps: (di, props) => ({
    upgradeChartStore: di.inject(upgradeChartStoreInjectable),
    upgradeChartValues: di.inject(upgradeChartValuesInjectable),
    ...props,
  }),
});
