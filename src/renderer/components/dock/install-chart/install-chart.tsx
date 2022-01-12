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

import "./install-chart.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import type { DockTabData, TabId } from "../store";
import { InfoPanel } from "../info-panel/info-panel";
import { Badge } from "../../badge";
import { NamespaceSelect } from "../../+namespaces/namespace-select";
import { prevDefault } from "../../../utils";
import type { IChartInstallData, InstallChartManager } from "./store";
import { Spinner } from "../../spinner";
import { Icon } from "../../icon";
import { Button } from "../../button";
import { releaseStore } from "../../+apps-releases/store";
import { LogsDialog } from "../../dialog/logs-dialog";
import { Select, SelectOption } from "../../select";
import { Input } from "../../input";
import { EditorPanel } from "../editor/editor-panel";
import { navigate } from "../../../navigation";
import { releaseURL } from "../../../../common/routes";
import type { DockTabStorageLayer } from "../dock-tab/store";
import type { IReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints/helm-release.api";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "../store.injectable";
import installChartManagerInjectable from "./store.injectable";
import chartVersionManagerInjectable from "./chart-version-manager.injectable";
import releaseDetailsManagerInjectable from "./release-details-manager.injectable";

export interface InstallChartProps {
  tab: DockTabData;
}

interface DockManager {
  closeTab: (tabId: TabId) => void;
}

interface Dependencies {
  dockManager: DockManager;
  installChartManager: InstallChartManager;
  chartVersionManager: DockTabStorageLayer<string[]>;
  releaseDetailsManager: DockTabStorageLayer<IReleaseUpdateDetails>;
}

const NonInjectedInstallChart = observer(({ tab, dockManager, installChartManager, chartVersionManager, releaseDetailsManager }: Dependencies & InstallChartProps) => {
  const [error, setError] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const chartData = installChartManager.getData(tab.id);
  const versions = chartVersionManager.getData(tab.id);
  const releaseDetails = releaseDetailsManager.getData(tab.id);

  const viewRelease = () => {
    const { release } = releaseDetails;

    navigate(releaseURL({
      params: {
        name: release.name,
        namespace: release.namespace,
      },
    }));
    dockManager.closeTab(tab.id);
  };
  const save = (data: Partial<IChartInstallData>) => {
    installChartManager.setData(tab.id, { ...chartData, ...data });
  };
  const onVersionChange = (option: SelectOption) => {
    const version = option.value;

    save({ version, values: "" });
    installChartManager.loadValues(tab.id);
  };
  const onChange = (values: string) => {
    setError("");
    save({ values });
  };
  const onError = (error: Error | string) => {
    setError(error.toString());
  };

  const onNamespaceChange = (opt: SelectOption) => {
    save({ namespace: opt.value });
  };

  const onReleaseNameChange = (name: string) => {
    save({ releaseName: name });
  };

  const install = async () => {
    const { repo, name, version, namespace, values, releaseName } = chartData;
    const details = await releaseStore.create({
      name: releaseName || undefined,
      chart: name,
      repo, namespace, version, values,
    });

    releaseDetailsManager.setData(tab.id, details);

    return (
      <p>Chart Release <b>{details.release.name}</b> successfully created.</p>
    );
  };

  if (chartData?.values === undefined || !versions) {
    return <Spinner center />;
  }

  if (releaseDetails) {
    return (
      <div className="InstallChartDone flex column gaps align-center justify-center">
        <p>
          <Icon material="check" big sticker />
        </p>
        <p>Installation complete!</p>
        <div className="flex gaps align-center">
          <Button
            autoFocus primary
            label="View Helm Release"
            onClick={prevDefault(viewRelease)}
          />
          <Button
            plain active
            label="Show Notes"
            onClick={() => setShowNotes(true)}
          />
        </div>
        <LogsDialog
          title="Helm Chart Install"
          isOpen={showNotes}
          close={() => setShowNotes(false)}
          logs={releaseDetails.log}
        />
      </div>
    );
  }

  const { repo, name, version, namespace, releaseName } = chartData;
  const panelControls = (
    <div className="install-controls flex gaps align-center">
      <span>Chart</span>
      <Badge label={`${repo}/${name}`} title="Repo/Name" />
      <span>Version</span>
      <Select
        className="chart-version"
        value={version}
        options={versions}
        onChange={onVersionChange}
        menuPlacement="top"
        themeName="outlined"
      />
      <span>Namespace</span>
      <NamespaceSelect
        showIcons={false}
        menuPlacement="top"
        themeName="outlined"
        value={namespace}
        onChange={onNamespaceChange}
      />
      <Input
        placeholder="Name (optional)"
        title="Release name"
        maxLength={50}
        value={releaseName}
        onChange={onReleaseNameChange}
      />
    </div>
  );

  return (
    <div className="InstallChart flex column">
      <InfoPanel
        tabId={tab.id}
        controls={panelControls}
        error={error}
        submit={install}
        submitLabel="Install"
        submittingMessage="Installing..."
        showSubmitClose={false}
      />
      <EditorPanel
        tabId={tab.id}
        value={chartData.values}
        onChange={onChange}
        onError={onError}
      />
    </div>
  );
});

export const InstallChart = withInjectables<Dependencies, InstallChartProps>(NonInjectedInstallChart, {
  getProps: (di, props) => ({
    dockManager: di.inject(dockStoreInjectable),
    installChartManager: di.inject(installChartManagerInjectable),
    chartVersionManager: di.inject(chartVersionManagerInjectable),
    releaseDetailsManager: di.inject(releaseDetailsManagerInjectable),
    ...props,
  }),
});
