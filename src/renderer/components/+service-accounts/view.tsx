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

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { CreateServiceAccountDialog } from "./create-dialog";
import type { ServiceAccountStore } from "./store";
import type { ServiceAccountsRouteParams } from "../../../common/routes";
import { ServiceAccountMenu } from "./item-menu";
import { withInjectables } from "@ogre-tools/injectable-react";
import serviceAccountStoreInjectable from "./store.injectable";
import openCreateServiceAccountDialogInjectable from "./open-create-dialog.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

export interface ServiceAccountsProps extends RouteComponentProps<ServiceAccountsRouteParams> {
}

interface Dependencies {
  serviceAccountStore: ServiceAccountStore;
  openCreateServiceAccountDialog: () => void;
}

const NonInjectedServiceAccounts = observer(({ serviceAccountStore, openCreateServiceAccountDialog }: Dependencies & ServiceAccountsProps) => (
  <>
    <KubeObjectListLayout
      isConfigurable
      tableId="access_service_accounts"
      className="ServiceAccounts"
      store={serviceAccountStore}
      sortingCallbacks={{
        [columnId.name]: account => account.getName(),
        [columnId.namespace]: account => account.getNs(),
        [columnId.age]: account => account.getTimeDiffFromNow(),
      }}
      searchFilters={[
        account => account.getSearchFields(),
      ]}
      renderHeaderTitle="Service Accounts"
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
        { className: "warning", showWithColumn: columnId.name },
        { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={account => [
        account.getName(),
        <KubeObjectStatusIcon key="icon" object={account} />,
        account.getNs(),
        account.getAge(),
      ]}
      renderItemMenu={item => <ServiceAccountMenu object={item}/>}
      addRemoveButtons={{
        onAdd: openCreateServiceAccountDialog,
        addTooltip: "Create new Service Account",
      }}
    />
    <CreateServiceAccountDialog/>
  </>
));

export const ServiceAccounts = withInjectables<Dependencies, ServiceAccountsProps>(NonInjectedServiceAccounts, {
  getProps: (di, props) => ({
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    openCreateServiceAccountDialog: di.inject(openCreateServiceAccountDialogInjectable),
    ...props,
  }),
});
