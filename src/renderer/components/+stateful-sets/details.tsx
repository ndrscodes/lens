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
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import { PodDetailsStatuses } from "../+pods/details-statuses";
import { PodDetailsTolerations } from "../+pods/details-tolerations";
import { PodDetailsAffinities } from "../+pods/details-affinities";
import type { PodStore } from "../+pods/store";
import type { StatefulSetStore } from "./store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForStatefulSets, IPodMetrics, StatefulSet } from "../../../common/k8s-api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+pods/charts";
import { PodDetailsList } from "../+pods/details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { kubeWatchApi } from "../../../common/k8s-api/kube-watch-api";
import { withInjectables } from "@ogre-tools/injectable-react";
import podStoreInjectable from "../+pods/store.injectable";
import statefulSetStoreInjectable from "./store.injectable";

export interface StatefulSetDetailsProps extends KubeObjectDetailsProps<StatefulSet> {
}

interface Dependencies {
  podStore: PodStore;
  statefulSetStore: StatefulSetStore;
}

const NonInjectedStatefulSetDetails = observer(({ podStore, statefulSetStore, object: statefulSet }: Dependencies & StatefulSetDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics>(null);

  useEffect(() => setMetrics(null), [statefulSet]);
  useEffect(() => (
    kubeWatchApi.subscribeStores([
      podStore,
    ])
  ), []);

  if (!statefulSet) {
    return null;
  }

  if (!(statefulSet instanceof StatefulSet)) {
    logger.error("[StatefulSetDetails]: passed object that is not an instanceof StatefulSet", statefulSet);

    return null;
  }

  const loadMetrics = async () => {
    setMetrics(await getMetricsForStatefulSets([statefulSet], statefulSet.getNs(), ""));
  };

  const images = statefulSet.getImages();
  const selectors = statefulSet.getSelectors();
  const nodeSelector = statefulSet.getNodeSelectors();
  const childPods = statefulSetStore.getChildPods(statefulSet);
  const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.StatefulSet);

  return (
    <div className="StatefulSetDetails">
      {!isMetricHidden && podStore.isLoaded && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs}
          object={statefulSet}
          metrics={metrics}
        >
          <PodCharts/>
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={statefulSet}/>
      {selectors.length &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
      }
      {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector" labelsOnly>
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
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
      <PodDetailsTolerations workload={statefulSet}/>
      <PodDetailsAffinities workload={statefulSet}/>
      <DrawerItem name="Pod Status" className="pod-status">
        <PodDetailsStatuses pods={childPods}/>
      </DrawerItem>
      <ResourceMetricsText metrics={metrics}/>
      <PodDetailsList
        pods={childPods}
        owner={statefulSet}
        isLoaded={podStore.isLoaded}
      />
    </div>
  );
});

export const StatefulSetDetails = withInjectables<Dependencies, StatefulSetDetailsProps>(NonInjectedStatefulSetDetails, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    statefulSetStore: di.inject(statefulSetStoreInjectable),
    ...props,
  }),
});
