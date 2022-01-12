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

import "./namespace-details.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { getMetricsForNamespace, IPodMetrics, Namespace } from "../../../common/k8s-api/endpoints";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Link } from "react-router-dom";
import { Spinner } from "../spinner";
import type { ResourceQuotaStore } from "../+config-resource-quotas/store";
import { KubeObjectMeta } from "../kube-object-meta";
import type { LimitRangeStore } from "../+config-limit-ranges/store";
import { ResourceMetrics } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";
import { kubeWatchApi } from "../../../common/k8s-api/kube-watch-api";
import { withInjectables } from "@ogre-tools/injectable-react";
import resourceQuotaStoreInjectable from "../+config-resource-quotas/store.injectable";
import limitRangeStoreInjectable from "../+config-limit-ranges/store.injectable";

export interface NamespaceDetailsProps extends KubeObjectDetailsProps<Namespace> {
}

interface Dependencies {
  resourceQuotaStore: ResourceQuotaStore;
  limitRangeStore: LimitRangeStore;
}

const NonInjectedNamespaceDetails = observer(({ resourceQuotaStore, limitRangeStore, object: namespace }: Dependencies & NamespaceDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics>(null);

  if (!namespace) {
    return null;
  }

  if (!(namespace instanceof Namespace)) {
    logger.error("[NamespaceDetails]: passed object that is not an instanceof Namespace", namespace);

    return null;
  }

  useEffect(() => setMetrics(null), [namespace]);
  useEffect(() =>  kubeWatchApi.subscribeStores([
    resourceQuotaStore,
    limitRangeStore,
  ]), []);

  const loadMetrics = async () => {
    setMetrics(await getMetricsForNamespace(namespace.getName(), ""));
  };

  const quotas = resourceQuotaStore.getAllByNs(namespace.getName());
  const limitRanges = limitRangeStore.getAllByNs(namespace.getName());
  const status = namespace.getStatus();
  const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Namespace);

  return (
    <div className="NamespaceDetails">
      {!isMetricHidden && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs}
          object={namespace}
          metrics={metrics}
        >
          <PodCharts />
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={namespace}/>

      <DrawerItem name="Status">
        <span className={cssNames("status", status.toLowerCase())}>{status}</span>
      </DrawerItem>

      <DrawerItem name="Resource Quotas" className="quotas flex align-center">
        {resourceQuotaStore.isLoading && <Spinner/>}
        {quotas.map(quota => (
          <Link key={quota.getId()} to={getDetailsUrl(quota.selfLink)}>
            {quota.getName()}
          </Link>
        ))}
      </DrawerItem>
      <DrawerItem name="Limit Ranges">
        {limitRangeStore.isLoading && <Spinner/>}
        {limitRanges.map(limitRange => (
          <Link key={limitRange.getId()} to={getDetailsUrl(limitRange.selfLink)}>
            {limitRange.getName()}
          </Link>
        ))}
      </DrawerItem>
    </div>
  );
});

export const NamespaceDetails = withInjectables<Dependencies, NamespaceDetailsProps>(NonInjectedNamespaceDetails, {
  getProps: (di, props) => ({
    resourceQuotaStore: di.inject(resourceQuotaStoreInjectable),
    limitRangeStore: di.inject(limitRangeStoreInjectable),
    ...props,
  }),
});
