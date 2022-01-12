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

import React, { Fragment, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { PodStore } from "../+workloads-pods/store";
import { Link } from "react-router-dom";
import { ResourceMetrics } from "../resource-metrics";
import { VolumeClaimDiskChart } from "./disk-chart";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForPvc, IPvcMetrics, PersistentVolumeClaim } from "../../../common/k8s-api/endpoints";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { KubeObjectMeta } from "../kube-object-meta";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import podStoreInjectable from "../+workloads-pods/store.injectable";

export interface PersistentVolumeClaimDetailsProps extends KubeObjectDetailsProps<PersistentVolumeClaim> {
}

interface Dependencies {
  podStore: PodStore;
}

const NonInjectedPersistentVolumeClaimDetails = observer(({ podStore, object: persistentVolumeClaim }: Dependencies & PersistentVolumeClaimDetailsProps) => {
  const [metrics, setMetrics] = useState<IPvcMetrics | null>(null);

  useEffect(() => setMetrics(null), [persistentVolumeClaim]);

  const loadMetrics = async () => {
    setMetrics(await getMetricsForPvc(persistentVolumeClaim));
  };

  if (!persistentVolumeClaim) {
    return null;
  }

  if (!(persistentVolumeClaim instanceof PersistentVolumeClaim)) {
    logger.error("[PersistentVolumeClaimDetails]: passed object that is not an instanceof PersistentVolumeClaim", persistentVolumeClaim);

    return null;
  }

  const { storageClassName, accessModes } = persistentVolumeClaim.spec;
  const pods = persistentVolumeClaim.getPods(podStore.items);
  const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.VolumeClaim);

  return (
    <div className="PersistentVolumeClaimDetails">
      {!isMetricHidden && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={[
            "Disk",
          ]}
          object={persistentVolumeClaim}
          metrics={metrics}
        >
          <VolumeClaimDiskChart/>
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={persistentVolumeClaim}/>
      <DrawerItem name="Access Modes">
        {accessModes.join(", ")}
      </DrawerItem>
      <DrawerItem name="Storage Class Name">
        {storageClassName}
      </DrawerItem>
      <DrawerItem name="Storage">
        {persistentVolumeClaim.getStorage()}
      </DrawerItem>
      <DrawerItem name="Pods" className="pods">
        {pods.map(pod => (
          <Link key={pod.getId()} to={getDetailsUrl(pod.selfLink)}>
            {pod.getName()}
          </Link>
        ))}
      </DrawerItem>
      <DrawerItem name="Status">
        {persistentVolumeClaim.getStatus()}
      </DrawerItem>

      <DrawerTitle title="Selector"/>

      <DrawerItem name="Match Labels" labelsOnly>
        {persistentVolumeClaim.getMatchLabels().map(label => <Badge key={label} label={label}/>)}
      </DrawerItem>

      <DrawerItem name="Match Expressions">
        {persistentVolumeClaim.getMatchExpressions().map(({ key, operator, values }, i) => (
          <Fragment key={i}>
            <DrawerItem name="Key">{key}</DrawerItem>
            <DrawerItem name="Operator">{operator}</DrawerItem>
            <DrawerItem name="Values">{values.join(", ")}</DrawerItem>
          </Fragment>
        ))}
      </DrawerItem>
    </div>
  );
});

export const PersistentVolumeClaimDetails = withInjectables<Dependencies, PersistentVolumeClaimDetailsProps>(NonInjectedPersistentVolumeClaimDetails, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    ...props,
  }),
});
