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

import "./daemonsets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { EventStore } from "../+events/store";
import type { PodStore } from "../+workloads-pods/store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { Badge } from "../badge";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { DaemonSetsRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { DaemonSetStore } from "./store";
import daemonSetStoreInjectable from "./store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import eventStoreInjectable from "../+events/store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  labels = "labels",
  age = "age",
}

export interface DaemonSetsProps extends RouteComponentProps<DaemonSetsRouteParams> {
}

interface Dependencies {
  daemonSetStore: DaemonSetStore;
  podStore: PodStore;
  eventStore: EventStore;
}

const NonInjectedDaemonSets = observer(({ daemonSetStore, podStore, eventStore }: Dependencies & DaemonSetsProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="workload_daemonsets"
    className="DaemonSets"
    store={daemonSetStore}
    dependentStores={[podStore, eventStore]} // status icon component uses event store
    sortingCallbacks={{
      [columnId.name]: daemonSet => daemonSet.getName(),
      [columnId.namespace]: daemonSet => daemonSet.getNs(),
      [columnId.pods]: daemonSet => daemonSetStore.getChildPods(daemonSet).length,
      [columnId.age]: daemonSet => daemonSet.getTimeDiffFromNow(),
    }}
    searchFilters={[
      daemonSet => daemonSet.getSearchFields(),
      daemonSet => daemonSet.getLabels(),
    ]}
    renderHeaderTitle="Daemon Sets"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
      { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
      { title: "Pods", className: "pods", sortBy: columnId.pods, id: columnId.pods },
      { className: "warning", showWithColumn: columnId.pods },
      { title: "Node Selector", className: "labels scrollable", id: columnId.labels },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
    ]}
    renderTableContents={daemonSet => [
      daemonSet.getName(),
      daemonSet.getNs(),
      daemonSetStore.getChildPods(daemonSet).length,
      <KubeObjectStatusIcon key="icon" object={daemonSet}/>,
      daemonSet.getNodeSelectors().map(selector => (
        <Badge key={selector} label={selector} scrollable/>
      )),
      daemonSet.getAge(),
    ]}
  />
));

export const DaemonSets = withInjectables<Dependencies, DaemonSetsProps>(NonInjectedDaemonSets, {
  getProps: (di, props) => ({
    daemonSetStore: di.inject(daemonSetStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
    ...props,
  }),
});
