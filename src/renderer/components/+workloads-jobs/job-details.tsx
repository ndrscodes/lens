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

import "./job-details.scss";

import React, { useEffect, useState } from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { Link } from "react-router-dom";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { PodsStore, podsStore } from "../+workloads-pods/pods.store";
import { jobStore } from "./job.store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForJobs, IPodMetrics, Job } from "../../../common/k8s-api/endpoints";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { reaction } from "mobx";
import { podMetricTabs, PodCharts } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ResourceMetrics } from "../resource-metrics";
import { getDetailsUrl } from "../kube-detail-params";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import logger from "../../../common/logger";
import type { KubeWatchApi } from "../../../common/k8s-api/kube-watch-api";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import { disposer } from "../../utils";
import kubeWatchApiInjectable from "../../../common/k8s-api/kube-watch-api.injectable";

export interface JobDetailsProps extends KubeObjectDetailsProps<Job> {
}

interface Dependencies {
  apiManager: ApiManager;
  kubeWatchApi: KubeWatchApi;
  podsStore: PodsStore;
}

const NonInjectedJobDetails = observer(({ apiManager, object: job, kubeWatchApi, podsStore }: Dependencies & JobDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics | null>(null);

  if (!job) {
    return null;
  }

  if (!(job instanceof Job)) {
    logger.error("[JobDetails]: passed object that is not an instanceof Job", job);

    return null;
  }

  useEffect(() => disposer(
    reaction(() => job, () => setMetrics(null)),
    kubeWatchApi.subscribeStores([
      podsStore,
    ]),
  ), []);

  const loadMetrics = async () => {
    setMetrics(await getMetricsForJobs([job], job.getNs(), ""));
  };

  const selectors = job.getSelectors();
  const nodeSelector = job.getNodeSelectors();
  const images = job.getImages();
  const childPods = jobStore.getChildPods(job);
  const ownerRefs = job.getOwnerRefs();
  const condition = job.getCondition();
  const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Job);

  return (
    <div className="JobDetails">
      {!isMetricHidden && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs} object={job} params={{ metrics }}
        >
          <PodCharts />
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={job}/>
      <DrawerItem name="Selector" labelsOnly>
        {
          Object.keys(selectors).map(label => <Badge key={label} label={label}/>)
        }
      </DrawerItem>
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
      {ownerRefs.length > 0 &&
        <DrawerItem name="Controlled by">
          {
            ownerRefs.map(ref => {
              const { name, kind } = ref;
              const detailsUrl = getDetailsUrl(apiManager.lookupApiLink(ref, job));

              return (
                <p key={name}>
                  {kind} <Link to={detailsUrl}>{name}</Link>
                </p>
              );
            })
          }
        </DrawerItem>
      }
      <DrawerItem name="Conditions" className="conditions" labelsOnly>
        {condition && (
          <Badge
            className={kebabCase(condition.type)}
            label={condition.type}
            tooltip={condition.message}
          />
        )}
      </DrawerItem>
      <DrawerItem name="Completions">
        {job.getDesiredCompletions()}
      </DrawerItem>
      <DrawerItem name="Parallelism">
        {job.getParallelism()}
      </DrawerItem>
      <PodDetailsTolerations workload={job}/>
      <PodDetailsAffinities workload={job}/>
      <DrawerItem name="Pod Status" className="pod-status">
        <PodDetailsStatuses pods={childPods}/>
      </DrawerItem>
      <PodDetailsList pods={childPods} owner={job}/>
    </div>
  );
});

export const JobDetails = withInjectables<Dependencies, JobDetailsProps>(NonInjectedJobDetails, {
  getProps: (di, props) => ({
    apiManager: di.inject(apiManagerInjectable),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    podsStore,
    ...props,
  }),
});
