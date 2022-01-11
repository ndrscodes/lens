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

import "./deployments.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { Deployment } from "../../../common/k8s-api/endpoints";
import type { DeploymentStore } from "./store";
import type { EventStore } from "../+events/event.store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { cssNames } from "../../utils";
import kebabCase from "lodash/kebabCase";
import orderBy from "lodash/orderBy";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { DeploymentsRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import deploymentStoreInjectable from "./store.injectable";
import eventStoreInjectable from "../+events/event.store.injectable";
import { DeploymentMenu } from "./item-menu";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  replicas = "replicas",
  age = "age",
  condition = "condition",
}

export interface DeploymentsProps extends RouteComponentProps<DeploymentsRouteParams> {
}

interface Dependencies {
  deploymentStore: DeploymentStore;
  eventStore: EventStore;
}

function renderPods(deployment: Deployment) {
  const { replicas, availableReplicas } = deployment.status;

  return `${availableReplicas || 0}/${replicas || 0}`;
}

function renderConditions(deployment: Deployment) {
  const conditions = orderBy(deployment.getConditions(true), "type", "asc");

  return conditions.map(({ type, message }) => (
    <span key={type} className={cssNames("condition", kebabCase(type))} title={message}>
      {type}
    </span>
  ));
}

const NonInjectedDeployments = observer(({ deploymentStore, eventStore }: Dependencies & DeploymentsProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="workload_deployments"
    className="Deployments" store={deploymentStore}
    dependentStores={[eventStore]} // status icon component uses event store
    sortingCallbacks={{
      [columnId.name]: deployment => deployment.getName(),
      [columnId.namespace]: deployment => deployment.getNs(),
      [columnId.replicas]: deployment => deployment.getReplicas(),
      [columnId.age]: deployment => deployment.getTimeDiffFromNow(),
      [columnId.condition]: deployment => deployment.getConditionsText(),
    }}
    searchFilters={[
      deployment => deployment.getSearchFields(),
      deployment => deployment.getConditionsText(),
    ]}
    renderHeaderTitle="Deployments"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
      { className: "warning", showWithColumn: columnId.name },
      { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
      { title: "Pods", className: "pods", id: columnId.pods },
      { title: "Replicas", className: "replicas", sortBy: columnId.replicas, id: columnId.replicas },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      { title: "Conditions", className: "conditions", sortBy: columnId.condition, id: columnId.condition },
    ]}
    renderTableContents={deployment => [
      deployment.getName(),
      <KubeObjectStatusIcon key="icon" object={deployment}/>,
      deployment.getNs(),
      renderPods(deployment),
      deployment.getReplicas(),
      deployment.getAge(),
      renderConditions(deployment),
    ]}
    renderItemMenu={item => <DeploymentMenu object={item} />}
  />
));

export const Deployments = withInjectables<Dependencies, DeploymentsProps>(NonInjectedDeployments, {
  getProps: (di, props) => ({
    deploymentStore: di.inject(deploymentStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
    ...props,
  }),
});
