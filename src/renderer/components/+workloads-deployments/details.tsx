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
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { Deployment, getMetricsForDeployments, IPodMetrics } from "../../../common/k8s-api/endpoints";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import type { PodStore } from "../+workloads-pods/pod.store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import type { DeploymentStore } from "./store";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import type { ReplicaSetStore } from "../+workloads-replica-sets/store";
import { DeploymentReplicaSets } from "./details-replica-sets";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { cssNames, disposer } from "../../utils";
import logger from "../../../common/logger";
import { kubeWatchApi } from "../../../common/k8s-api/kube-watch-api";
import { withInjectables } from "@ogre-tools/injectable-react";
import podStoreInjectable from "../+workloads-pods/pod.store.injectable";
import deploymentStoreInjectable from "./store.injectable";
import replicaSetStoreInjectable from "../+workloads-replica-sets/store.injectable";

export interface DeploymentDetailsProps extends KubeObjectDetailsProps<Deployment> {
}

interface Dependencies {
  podStore: PodStore;
  deploymentStore: DeploymentStore;
  replicaSetStore: ReplicaSetStore;
}

const NonInjectedDeploymentDetails = observer(({ podStore, deploymentStore, replicaSetStore, className, object: deployment }: Dependencies & DeploymentDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics | null>(null);

  useEffect(() => disposer(
    reaction(() => deployment, () => setMetrics(null)),
    kubeWatchApi.subscribeStores([
      podStore,
      replicaSetStore,
    ]),
  ), []);

  if (!deployment) {
    return null;
  }

  if (!(deployment instanceof Deployment)) {
    logger.error("[DeploymentDetails]: passed object that is not an instanceof Deployment", deployment);

    return null;
  }

  const loadMetrics = async () => {
    setMetrics(await getMetricsForDeployments([deployment], deployment.getNs(), ""));
  };

  const { status, spec } = deployment;
  const nodeSelector = deployment.getNodeSelectors();
  const selectors = deployment.getSelectors();
  const childPods = deploymentStore.getChildPods(deployment);
  const replicaSets = replicaSetStore.getReplicaSetsByOwner(deployment);
  const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Deployment);

  return (
    <div className={cssNames("DeploymentDetails", className)}>
      {!isMetricHidden && podStore.isLoaded && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs}
          object={deployment}
          metrics={metrics}
        >
          <PodCharts/>
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={deployment}/>
      <DrawerItem name="Replicas">
        {`${spec.replicas} desired, ${status.updatedReplicas || 0} updated`},{" "}
        {`${status.replicas || 0} total, ${status.availableReplicas || 0} available`},{" "}
        {`${status.unavailableReplicas || 0} unavailable`}
      </DrawerItem>
      {selectors.length > 0 &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
      }
      {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector">
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
      }
      <DrawerItem name="Strategy Type">
        {spec.strategy.type}
      </DrawerItem>
      <DrawerItem name="Conditions" className="conditions" labelsOnly>
        {
          deployment.getConditions()
            .map(({ type, message, lastTransitionTime, status }) => (
              <Badge
                key={type}
                label={type}
                disabled={status === "False"}
                className={kebabCase(type)}
                tooltip={(
                  <>
                    <p>{message}</p>
                    <p>Last transition time: {lastTransitionTime}</p>
                  </>
                )}
              />
            ))
        }
      </DrawerItem>
      <PodDetailsTolerations workload={deployment}/>
      <PodDetailsAffinities workload={deployment}/>
      <ResourceMetricsText metrics={metrics}/>
      <DeploymentReplicaSets replicaSets={replicaSets}/>
      <PodDetailsList pods={childPods} owner={deployment}/>
    </div>
  );
});

export const DeploymentDetails = withInjectables<Dependencies, DeploymentDetailsProps>(NonInjectedDeploymentDetails, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    deploymentStore: di.inject(deploymentStoreInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    ...props,
  }),
});
