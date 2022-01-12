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

import "./details.scss";

import React, { useEffect, useState } from "react";
import groupBy from "lodash/groupBy";
import isEqual from "lodash/isEqual";
import { reaction } from "mobx";
import { Link } from "react-router-dom";
import kebabCase from "lodash/kebabCase";
import { getRelease, getReleaseValues, HelmRelease, IReleaseDetails } from "../../../common/k8s-api/endpoints/helm-release.api";
import { HelmReleaseMenu } from "./item-menu";
import { Drawer, DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { cssNames, disposer, stopPropagation } from "../../utils";
import { observer } from "mobx-react";
import { Spinner } from "../spinner";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { Button } from "../button";
import type { ReleaseStore } from "./store";
import { Notifications } from "../notifications";
import { ThemeStore } from "../../theme.store";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { SubTitle } from "../layout/sub-title";
import type { SecretStore } from "../+secrets/store";
import type { Secret } from "../../../common/k8s-api/endpoints";
import { getDetailsUrl } from "../kube-detail-params";
import { Checkbox } from "../checkbox";
import { MonacoEditor } from "../monaco-editor";
import type { DockTabCreateSpecific, DockTabData } from "../dock/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import newUpgradeChartTabInjectable from "../dock/upgrade-chart/create-tab.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import secretStoreInjectable from "../+secrets/store.injectable";
import releaseStoreInjectable from "./store.injectable";

export interface ReleaseDetailsProps {
  release: HelmRelease;
  hideDetails(): void;
}

interface Dependencies {
  newUpgradeChartTab: (release: HelmRelease, data?: DockTabCreateSpecific) => DockTabData;
  apiManager: ApiManager;
  secretStore: SecretStore;
  releaseStore: ReleaseStore;
}

const NonInjectedReleaseDetails = observer(({
  release,
  hideDetails,
  newUpgradeChartTab,
  apiManager,
  secretStore,
  releaseStore,
}: Dependencies & ReleaseDetailsProps) => {
  const [details, setDetails] = useState<IReleaseDetails | null>(null);
  const [values, setValues] = useState("");
  const [valuesLoading, setValuesLoading] = useState(false);
  const [showOnlyUserSuppliedValues, setShowOnlyUserSuppliedValues] = useState(true);
  const [saving, setSaving] = useState(false);
  const [releaseSecret, setReleaseSecret] = useState<Secret | undefined>(undefined);
  const [error, setError] = useState("");

  const loadDetails = async () =>{
    setDetails(null);

    try {
      setDetails(await getRelease(release.getName(), release.getNs()));
    } catch (error) {
      setError(`Failed to get release details: ${error}`);
    }
  };

  const loadValues = async () => {
    setValuesLoading(true);

    try {
      setValues(await getReleaseValues(release.getName(), release.getNs(), !showOnlyUserSuppliedValues) ?? "");
    } catch (error) {
      Notifications.error(`Failed to load values for ${release.getName()}: ${error}`);
      setValues("");
    } finally {
      setValuesLoading(false);
    }
  };

  const updateValues = async () => {
    setSaving(true);

    const name = release.getName();
    const namespace = release.getNs();
    const data = {
      chart: release.getChart(),
      repo: await release.getRepo(),
      version: release.getVersion(),
      values,
    };

    try {
      await releaseStore.update(name, namespace, data);
      Notifications.ok(
        <p>Release <b>{name}</b> successfully updated!</p>,
      );
    } catch (err) {
      Notifications.error(err);
    }
    setSaving(false);
  };

  const upgradeVersion = () => {
    newUpgradeChartTab(release);
    hideDetails();
  };

  useEffect(() => disposer(
    reaction(() => release, release => {
      if (!release) return;
      loadDetails();
      loadValues();
      setReleaseSecret(undefined);
    }),
    reaction(() => secretStore.getItems(), () => {
      if (!release) return;
      const { getReleaseSecret } = releaseStore;
      const secret = getReleaseSecret(release);

      if (releaseSecret) {
        if (!isEqual(releaseSecret.getLabels(), secret.getLabels())) {
          loadDetails();
        }

        setReleaseSecret(secret);
      }
    }),
    reaction(() => showOnlyUserSuppliedValues, () => loadValues()),
  ), []);

  if (!release) {
    return null;
  }

  const renderValues = () => (
    <div className="values">
      <DrawerTitle title="Values"/>
      <div className="flex column gaps">
        <Checkbox
          label="User-supplied values only"
          value={showOnlyUserSuppliedValues}
          onChange={setShowOnlyUserSuppliedValues}
          disabled={valuesLoading}
        />
        <MonacoEditor
          readOnly={valuesLoading}
          className={cssNames({ loading: valuesLoading })}
          style={{ minHeight: 300 }}
          value={values}
          onChange={setValues}
        >
          {valuesLoading && <Spinner center/>}
        </MonacoEditor>
        <Button
          primary
          label="Save"
          waiting={saving}
          disabled={valuesLoading}
          onClick={updateValues}
        />
      </div>
    </div>
  );

  const renderNotes = () => {
    const { info } = details;

    if (!info?.notes) {
      return null;
    }

    return (
      <>
        <DrawerTitle title="Notes"/>
        <div className="notes">
          {info.notes}
        </div>
      </>
    );
  };

  const renderResources = () => {
    const { resources } = details;

    if (!resources) {
      return null;
    }

    const groups = groupBy(resources, item => item.kind);
    const tables = Object.entries(groups).map(([kind, items]) => (
      <React.Fragment key={kind}>
        <SubTitle title={kind} />
        <Table scrollable={false}>
          <TableHead sticky={false}>
            <TableCell className="name">Name</TableCell>
            {items[0].getNs() && <TableCell className="namespace">Namespace</TableCell>}
            <TableCell className="age">Age</TableCell>
          </TableHead>
          {items.map(item => {
            const name = item.getName();
            const namespace = item.getNs();
            const api = apiManager.getApi(api => api.kind === kind && api.apiVersionWithGroup == item.apiVersion);
            const detailsUrl = api ? getDetailsUrl(api.getUrl({ name, namespace })) : "";

            return (
              <TableRow key={item.getId()}>
                <TableCell className="name">
                  {detailsUrl ? <Link to={detailsUrl}>{name}</Link> : name}
                </TableCell>
                {namespace && <TableCell className="namespace">{namespace}</TableCell>}
                <TableCell className="age">{item.getAge()}</TableCell>
              </TableRow>
            );
          })}
        </Table>
      </React.Fragment>
    ));

    return (
      <>
        <DrawerTitle title="Resources"/>
        <div className="resources">
          {tables}
        </div>
      </>
    );
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="loading-error">
          {error}
        </div>
      );
    }

    if (!details) {
      return <Spinner center/>;
    }

    return (
      <div>
        <DrawerItem name="Chart" className="chart">
          <div className="flex gaps align-center">
            <span>{release.getChart()}</span>
            <Button
              primary
              label="Upgrade"
              className="box right upgrade"
              onClick={upgradeVersion}
            />
          </div>
        </DrawerItem>
        <DrawerItem name="Updated">
          {release.getUpdated()} ago ({release.updated})
        </DrawerItem>
        <DrawerItem name="Namespace">
          {release.getNs()}
        </DrawerItem>
        <DrawerItem name="Version" onClick={stopPropagation}>
          <div className="version flex gaps align-center">
            <span>
              {release.getVersion()}
            </span>
          </div>
        </DrawerItem>
        <DrawerItem name="Status" className="status" labelsOnly>
          <Badge
            label={release.getStatus()}
            className={kebabCase(release.getStatus())}
          />
        </DrawerItem>
        {renderValues()}
        {renderNotes()}
        {renderResources()}
      </div>
    );
  };

  return (
    <Drawer
      className={cssNames("ReleaseDetails", ThemeStore.getInstance().activeTheme.type)}
      usePortal={true}
      open
      title={`Release: ${release.getName()}`}
      onClose={hideDetails}
      toolbar={
        <HelmReleaseMenu
          release={release}
          toolbar
          hideDetails={hideDetails}
        />
      }
    >
      {renderContent()}
    </Drawer>
  );
});

export const ReleaseDetails = withInjectables<Dependencies, ReleaseDetailsProps>(NonInjectedReleaseDetails, {
  getProps: (di, props) => ({
    newUpgradeChartTab: di.inject(newUpgradeChartTabInjectable),
    apiManager: di.inject(apiManagerInjectable),
    secretStore: di.inject(secretStoreInjectable),
    releaseStore: di.inject(releaseStoreInjectable),
    ...props,
  }),
});
