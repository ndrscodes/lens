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

import "./releases.scss";

import React, { useEffect } from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { ReleaseStore } from "./store";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-release.api";
import { ReleaseDetails } from "./details";
import { ReleaseRollbackDialog } from "./rollback-dialog";
import { navigation } from "../../navigation";
import { ItemListLayout } from "../item-object-list/item-list-layout";
import { HelmReleaseMenu } from "./item-menu";
import type { SecretStore } from "../+secrets/store";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import type { ReleaseRouteParams } from "../../../common/routes";
import { releaseURL } from "../../../common/routes";
import type { NamespaceStore } from "../+namespaces/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "../+namespaces/store.injectable";
import releaseStoreInjectable from "./store.injectable";
import secretStoreInjectable from "../+secrets/store.injectable";
import { disposer } from "../../utils";

enum columnId {
  name = "name",
  namespace = "namespace",
  revision = "revision",
  chart = "chart",
  version = "version",
  appVersion = "app-version",
  status = "status",
  updated = "update",
}

export interface HelmReleasesProps extends RouteComponentProps<ReleaseRouteParams> {
}

interface Dependencies {
  releaseStore: ReleaseStore;
  secretStore: SecretStore;
  namespaceStore: NamespaceStore;
}

const NonInjectedHelmReleases = observer(({ releaseStore, secretStore, namespaceStore, match }: Dependencies & HelmReleasesProps) => {
  const { params: { namespace, name }} = match;
  const selectedRelease = releaseStore.findRelease(name, namespace);

  useEffect(() => {
    if (namespace) {
      namespaceStore.selectNamespaces(namespace);
    }

    return disposer(
      releaseStore.watchAssociatedSecrets(),
      releaseStore.watchSelectedNamespaces(),
    );
  }, []);

  const showDetails = (item: HelmRelease) => {
    navigation.push(releaseURL({
      params: {
        name: item.getName(),
        namespace: item.getNs(),
      },
    }));
  };
  const hideDetails = () => {
    navigation.push(releaseURL());
  };
  const onDetails = (item: HelmRelease) => {
    if (item === selectedRelease) {
      hideDetails();
    } else {
      showDetails(item);
    }
  };
  const renderRemoveDialogMessage = (selectedItems: HelmRelease[]) => (
    <div>
      <>Remove <b>{selectedItems.map(item => item.getName()).join(", ")}</b>?</>
      <p className="warning">
          Note: StatefulSet Volumes won&apos;t be deleted automatically
      </p>
    </div>
  );

  return (
    <>
      <ItemListLayout
        isConfigurable
        tableId="helm_releases"
        className="HelmReleases"
        store={releaseStore}
        dependentStores={[secretStore]}
        sortingCallbacks={{
          [columnId.name]: release => release.getName(),
          [columnId.namespace]: release => release.getNs(),
          [columnId.revision]: release => release.getRevision(),
          [columnId.chart]: release => release.getChart(),
          [columnId.status]: release => release.getStatus(),
          [columnId.updated]: release => release.getUpdated(false, false),
        }}
        searchFilters={[
          release => release.getName(),
          release => release.getNs(),
          release => release.getChart(),
          release => release.getStatus(),
          release => release.getVersion(),
        ]}
        customizeHeader={({ filters, searchProps, ...headerPlaceholders }) => ({
          filters: (
            <>
              {filters}
              <NamespaceSelectFilter />
            </>
          ),
          searchProps: {
            ...searchProps,
            placeholder: "Search Releases...",
          },
          ...headerPlaceholders,
        })}
        renderHeaderTitle="Releases"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Chart", className: "chart", sortBy: columnId.chart, id: columnId.chart },
          { title: "Revision", className: "revision", sortBy: columnId.revision, id: columnId.revision },
          { title: "Version", className: "version", id: columnId.version },
          { title: "App Version", className: "app-version", id: columnId.appVersion },
          { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
          { title: "Updated", className: "updated", sortBy: columnId.updated, id: columnId.updated },
        ]}
        renderTableContents={release => [
          release.getName(),
          release.getNs(),
          release.getChart(),
          release.getRevision(),
          release.getVersion(),
          release.appVersion,
          { title: release.getStatus(), className: kebabCase(release.getStatus()) },
          release.getUpdated(),
        ]}
        renderItemMenu={release => (
          <HelmReleaseMenu
            release={release}
            removeConfirmationMessage={renderRemoveDialogMessage([release])}
          />
        )}
        customizeRemoveDialog={selectedItems => ({
          message: renderRemoveDialogMessage(selectedItems),
        })}
        detailsItem={selectedRelease}
        onDetails={onDetails}
      />
      <ReleaseDetails
        release={selectedRelease}
        hideDetails={hideDetails}
      />
      <ReleaseRollbackDialog/>
    </>
  );
});

export const HelmReleases = withInjectables<Dependencies, HelmReleasesProps>(NonInjectedHelmReleases, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    releaseStore: di.inject(releaseStoreInjectable),
    secretStore: di.inject(secretStoreInjectable),
    ...props,
  }),
});
