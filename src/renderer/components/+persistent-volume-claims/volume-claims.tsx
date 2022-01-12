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

import "./volume-claims.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link, RouteComponentProps } from "react-router-dom";
import type { PodStore } from "../+workloads-pods/store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { unitsToBytes } from "../../../common/utils/convertMemory";
import { stopPropagation } from "../../utils";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { VolumeClaimsRouteParams } from "../../../common/routes";
import { getDetailsUrl } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { PersistentVolumeClaimStore } from "./store";
import type { StorageClassApi } from "../../../common/k8s-api/endpoints";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import persistentVolumeClaimStoreInjectable from "./store.injectable";
import storageClassApiInjectable from "../../../common/k8s-api/endpoints/storage-class.api.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  size = "size",
  storageClass = "storage-class",
  status = "status",
  age = "age",
}

export interface PersistentVolumeClaimsProps extends RouteComponentProps<VolumeClaimsRouteParams> {
}

interface Dependencies {
  podStore: PodStore;
  persistentVolumeClaimStore: PersistentVolumeClaimStore;
  storageClassApi: StorageClassApi;
}

const NonInjectedPersistentVolumeClaims = observer(({ podStore, persistentVolumeClaimStore, storageClassApi }: Dependencies & PersistentVolumeClaimsProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="storage_volume_claims"
    className="PersistentVolumeClaims"
    store={persistentVolumeClaimStore}
    dependentStores={[podStore]}
    sortingCallbacks={{
      [columnId.name]: pvc => pvc.getName(),
      [columnId.namespace]: pvc => pvc.getNs(),
      [columnId.pods]: pvc => pvc.getPods(podStore.items).map(pod => pod.getName()),
      [columnId.status]: pvc => pvc.getStatus(),
      [columnId.size]: pvc => unitsToBytes(pvc.getStorage()),
      [columnId.storageClass]: pvc => pvc.spec.storageClassName,
      [columnId.age]: pvc => pvc.getTimeDiffFromNow(),
    }}
    searchFilters={[
      item => item.getSearchFields(),
      item => item.getPods(podStore.items).map(pod => pod.getName()),
    ]}
    renderHeaderTitle="Persistent Volume Claims"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
      { className: "warning", showWithColumn: columnId.name },
      { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
      { title: "Storage class", className: "storageClass", sortBy: columnId.storageClass, id: columnId.storageClass },
      { title: "Size", className: "size", sortBy: columnId.size, id: columnId.size },
      { title: "Pods", className: "pods", sortBy: columnId.pods, id: columnId.pods },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
    ]}
    renderTableContents={pvc => {
      const pods = pvc.getPods(podStore.items);
      const { storageClassName } = pvc.spec;
      const storageClassDetailsUrl = getDetailsUrl(storageClassApi.getUrl({
        name: storageClassName,
      }));

      return [
        pvc.getName(),
        <KubeObjectStatusIcon key="icon" object={pvc} />,
        pvc.getNs(),
        <Link key="link" to={storageClassDetailsUrl} onClick={stopPropagation}>
          {storageClassName}
        </Link>,
        pvc.getStorage(),
        pods.map(pod => (
          <Link key={pod.getId()} to={getDetailsUrl(pod.selfLink)} onClick={stopPropagation}>
            {pod.getName()}
          </Link>
        )),
        pvc.getAge(),
        { title: pvc.getStatus(), className: pvc.getStatus().toLowerCase() },
      ];
    }}
  />
));

export const PersistentVolumeClaims = withInjectables<Dependencies, PersistentVolumeClaimsProps>(NonInjectedPersistentVolumeClaims, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    persistentVolumeClaimStore: di.inject(persistentVolumeClaimStoreInjectable),
    storageClassApi: di.inject(storageClassApiInjectable),
    ...props,
  }),
});

