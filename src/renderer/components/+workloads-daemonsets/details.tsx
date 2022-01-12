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
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import type { DaemonSetStore } from "./store";
import type { PodStore } from "../+workloads-pods/store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { DaemonSet, getMetricsForDaemonSets, IPodMetrics } from "../../../common/k8s-api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { kubeWatchApi } from "../../../common/k8s-api/kube-watch-api";
import { withInjectables } from "@ogre-tools/injectable-react";
import daemonSetStoreInjectable from "./store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";

export interface DaemonSetDetailsProps extends KubeObjectDetailsProps<DaemonSet> {
}

interface Dependencies {
  daemonSetStore: DaemonSetStore;
  podStore: PodStore;
}

const NonInjectedDaemonSetDetails = observer(({ podStore, daemonSetStore, object: daemonSet }: Dependencies & DaemonSetDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics | null>(null);

  useEffect(() => setMetrics(null), [daemonSet]);
  useEffect(() => (
    kubeWatchApi.subscribeStores([
      podStore,
    ])
  ), []);

  if (!daemonSet) {
    return null;
  }

  if (!(daemonSet instanceof DaemonSet)) {
    logger.error("[DaemonSetDetails]: passed object that is not an instanceof DaemonSet", daemonSet);

    return null;
  }

  const loadMetrics = async () => {
    setMetrics(await getMetricsForDaemonSets([daemonSet], daemonSet.getNs(), ""));
  };

  const { spec } = daemonSet;
  const selectors = daemonSet.getSelectors();
  const images = daemonSet.getImages();
  const nodeSelector = daemonSet.getNodeSelectors();
  const childPods = daemonSetStore.getChildPods(daemonSet);
  const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.DaemonSet);

  return (
    <div className="DaemonSetDetails">
      {!isMetricHidden && podStore.isLoaded && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs}
          object={daemonSet}
          metrics={metrics}
        >
          <PodCharts/>
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={daemonSet}/>
      {selectors.length > 0 &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
      }
      {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector" labelsOnly>
          {
            nodeSelector.map(label => (<Badge key={label} label={label}/>))
          }
        </DrawerItem>
      }
      {images.length > 0 &&
        <DrawerItem name="Images">
          {
            images.map(image => <p key={image}>{image}</p>)
          }
        </DrawerItem>
      }
      <DrawerItem name="Strategy Type">
        {spec.updateStrategy.type}
      </DrawerItem>
      <PodDetailsTolerations workload={daemonSet}/>
      <PodDetailsAffinities workload={daemonSet}/>
      <DrawerItem name="Pod Status" className="pod-status">
        <PodDetailsStatuses pods={childPods}/>
      </DrawerItem>
      <ResourceMetricsText metrics={metrics}/>
      <PodDetailsList pods={childPods} owner={daemonSet}/>
    </div>
  );
});

export const DaemonSetDetails = withInjectables<Dependencies, DaemonSetDetailsProps>(NonInjectedDaemonSetDetails, {
  getProps: (di, props) => ({
    daemonSetStore: di.inject(daemonSetStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    ...props,
  }),
});
