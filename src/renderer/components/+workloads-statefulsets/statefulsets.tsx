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

import "./statefulsets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { StatefulSet } from "../../../common/k8s-api/endpoints";
import type { PodStore } from "../+workloads-pods/store";
import type { StatefulSetStore } from "./store";
import type { EventStore } from "../+events/store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { StatefulSetsRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import eventStoreInjectable from "../+events/store.injectable";
import statefulSetStoreInjectable from "./store.injectable";
import { StatefulSetMenu } from "./item-menu";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
  replicas = "replicas",
}

export interface StatefulSetsProps extends RouteComponentProps<StatefulSetsRouteParams> {
}

interface Dependencies {
  podStore: PodStore;
  statefulSetStore: StatefulSetStore;
  eventStore: EventStore;
}

function renderPods(statefulSet: StatefulSet) {
  const { readyReplicas, currentReplicas } = statefulSet.status;

  return `${readyReplicas || 0}/${currentReplicas || 0}`;
}

const NonInjectedStatefulSets = observer(({ statefulSetStore, podStore, eventStore }: Dependencies & StatefulSetsProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="workload_statefulsets"
    className="StatefulSets"
    store={statefulSetStore}
    dependentStores={[podStore, eventStore]} // status icon component uses event store, details component uses podStore
    sortingCallbacks={{
      [columnId.name]: statefulSet => statefulSet.getName(),
      [columnId.namespace]: statefulSet => statefulSet.getNs(),
      [columnId.age]: statefulSet => statefulSet.getTimeDiffFromNow(),
      [columnId.replicas]: statefulSet => statefulSet.getReplicas(),
    }}
    searchFilters={[
      statefulSet => statefulSet.getSearchFields(),
    ]}
    renderHeaderTitle="Stateful Sets"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
      { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
      { title: "Pods", className: "pods", id: columnId.pods },
      { title: "Replicas", className: "replicas", sortBy: columnId.replicas, id: columnId.replicas },
      { className: "warning", showWithColumn: columnId.replicas },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
    ]}
    renderTableContents={statefulSet => [
      statefulSet.getName(),
      statefulSet.getNs(),
      renderPods(statefulSet),
      statefulSet.getReplicas(),
      <KubeObjectStatusIcon key="icon" object={statefulSet}/>,
      statefulSet.getAge(),
    ]}
    renderItemMenu={item => <StatefulSetMenu object={item} />}
  />
));

export const StatefulSets = withInjectables<Dependencies, StatefulSetsProps>(NonInjectedStatefulSets, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
    statefulSetStore: di.inject(statefulSetStoreInjectable),
    ...props,
  }),
});
