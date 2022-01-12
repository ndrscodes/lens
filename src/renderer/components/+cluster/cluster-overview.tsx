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

import styles from "./cluster-overview.module.scss";

import React, { useEffect, useState } from "react";
import { when } from "mobx";
import { observer } from "mobx-react";
import { disposer, interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout";
import { Spinner } from "../spinner";
import { ClusterIssues } from "./cluster-issues";
import { ClusterMetrics } from "./cluster-metrics";
import { ClusterPieCharts } from "./cluster-pie-charts";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { kubeWatchApi } from "../../../common/k8s-api/kube-watch-api";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { PodStore } from "../+pods/store";
import type { EventStore } from "../+events/store";
import type { NodeStore } from "../+nodes/store";
import podStoreInjectable from "../+pods/store.injectable";
import eventStoreInjectable from "../+events/store.injectable";
import nodeStoreInjectable from "../+nodes/store.injectable";
import { getMetricsByNodeNames, IClusterMetrics } from "../../../common/k8s-api/endpoints";
import { MetricNodeRole, MetricType } from "./overview.state";

export interface ClusterOverviewProps {
  clusterIsAvailable: boolean;
}

interface Dependencies {
  podStore: PodStore;
  eventStore: EventStore;
  nodeStore: NodeStore;
}

const NonInjectedClusterOverview = observer(({ podStore, eventStore, nodeStore, clusterIsAvailable }: Dependencies & ClusterOverviewProps) => {
  const [metrics, setMetrics] = useState<IClusterMetrics | null>(null);
  const [metricsNodeRole, setMetricsNodeRole] = useState(MetricNodeRole.MASTER);
  const [metricsType, setMetricsType] = useState(MetricType.CPU);
  const [loadMetricsPoller] = useState(interval(60, async () => {
    if (!clusterIsAvailable) {
      return;
    }

    await when(() => nodeStore.isLoaded);

    const nodes = metricsNodeRole === MetricNodeRole.MASTER
      ? nodeStore.masterNodes
      : nodeStore.workerNodes;

    setMetrics(await getMetricsByNodeNames(nodes.map(node => node.getName())));
  }));

  useEffect(() => {
    loadMetricsPoller.start();

    return disposer(
      kubeWatchApi.subscribeStores([
        podStore,
        eventStore,
        nodeStore,
      ]),
      () => loadMetricsPoller.stop(),
    );
  }, []);

  const changeMetricsNodeRole = (val: MetricNodeRole) => {
    setMetricsNodeRole(val);
    loadMetricsPoller.restart(true);
  };

  const renderClusterOverview = () => {
    const isMetricsHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Cluster);

    return (
      <>
        {isMetricsHidden && (
          <>
            <ClusterMetrics
              metrics={metrics}
              metricsType={metricsType}
              metricsNodeRole={metricsNodeRole}
              masterNodes={nodeStore.masterNodes}
              workerNodes={nodeStore.workerNodes}
              setMetricsType={setMetricsType}
              setMetricsNodeRole={changeMetricsNodeRole}
            />
            <ClusterPieCharts
              metrics={metrics}
              metricsNodeRole={metricsNodeRole}
              masterNodes={nodeStore.masterNodes}
              workerNodes={nodeStore.workerNodes}
            />
          </>
        )}
        <ClusterIssues className={isMetricsHidden ? "OnlyClusterIssues" : ""}/>
      </>
    );
  };

  return (
    <TabLayout>
      <div className={styles.ClusterOverview} data-testid="cluster-overview-page">
        {
          nodeStore.isLoaded && eventStore.isLoaded
            ? <Spinner center/>
            : renderClusterOverview()
        }
      </div>
    </TabLayout>
  );
});

export const ClusterOverview = withInjectables<Dependencies, ClusterOverviewProps>(NonInjectedClusterOverview, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
    nodeStore: di.inject(nodeStoreInjectable),
    ...props,
  }),
});
