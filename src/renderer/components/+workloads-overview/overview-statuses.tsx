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

import "./overview-statuses.scss";

import React from "react";
import { observer } from "mobx-react";
import { OverviewWorkloadStatus } from "./overview-workload-status";
import { Link } from "react-router-dom";
import type { NamespaceStore } from "../+namespaces/store";
import type { KubeResource } from "../../../common/rbac";
import { ResourceNames } from "../../utils/rbac";
import { workloadURL } from "../../../common/routes";
import { isAllowedResource } from "../../../common/utils/allowed-resource";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "../+namespaces/store.injectable";
import type { CronJobStore } from "../+cronjobs/store";
import type { DaemonSetStore } from "../+daemonsets/store";
import type { DeploymentStore } from "../+deployments/store";
import type { JobStore } from "../+jobs/store";
import type { ReplicaSetStore } from "../+replica-sets/store";
import type { StatefulSetStore } from "../+stateful-sets/store";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { PodsStore } from "../../../extensions/renderer-api/k8s-api";
import cronJobStoreInjectable from "../+cronjobs/store.injectable";
import daemonSetStoreInjectable from "../+daemonsets/store.injectable";
import deploymentStoreInjectable from "../+deployments/store.injectable";
import jobStoreInjectable from "../+jobs/job.store.injectable";
import podStoreInjectable from "../+pods/store.injectable";
import replicaSetStoreInjectable from "../+replica-sets/store.injectable";
import statefulSetStoreInjectable from "../+stateful-sets/store.injectable";

export interface OverviewStatusesProps {
}

interface Dependencies {
  namespaceStore: NamespaceStore;
  podStore: PodsStore;
  deploymentStore: DeploymentStore;
  daemonSetStore: DaemonSetStore;
  statefulSetStore: StatefulSetStore;
  replicaSetStore: ReplicaSetStore;
  jobStore: JobStore;
  cronJobStore: CronJobStore;
}

const NonInjectedOverviewStatuses = observer(({ namespaceStore, podStore, deploymentStore, daemonSetStore, statefulSetStore, replicaSetStore, jobStore, cronJobStore }: Dependencies & OverviewStatusesProps) => {
  const renderWorkload = (resource: KubeResource, store: KubeObjectStore<KubeObject>) => {
    if (!isAllowedResource(resource)) {
      return null;
    }

    const items = store.getAllByNs(namespaceStore.contextNamespaces);

    return (
      <div className="workload" key={resource}>
        <div className="title">
          <Link to={workloadURL[resource]()}>{ResourceNames[resource]} ({items.length})</Link>
        </div>
        <OverviewWorkloadStatus status={store.getStatuses(items)} />
      </div>
    );
  };

  return (
    <div className="OverviewStatuses">
      <div className="workloads">
        {renderWorkload("pods", podStore)}
        {renderWorkload("deployments", deploymentStore)}
        {renderWorkload("daemonsets", daemonSetStore)}
        {renderWorkload("statefulsets", statefulSetStore)}
        {renderWorkload("replicasets", replicaSetStore)}
        {renderWorkload("jobs", jobStore)}
        {renderWorkload("cronjobs", cronJobStore)}
      </div>
    </div>
  );
});

export const OverviewStatuses = withInjectables<Dependencies, OverviewStatusesProps>(NonInjectedOverviewStatuses, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    cronJobStore: di.inject(cronJobStoreInjectable),
    daemonSetStore: di.inject(daemonSetStoreInjectable),
    deploymentStore: di.inject(deploymentStoreInjectable),
    jobStore: di.inject(jobStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    statefulSetStore: di.inject(statefulSetStoreInjectable),
    ...props,
  }),
});

