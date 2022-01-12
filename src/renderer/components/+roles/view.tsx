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
import { AddRoleDialog } from "./add-dialog";
import type { RoleStore } from "./store";
import type { RolesRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import roleStoreInjectable from "./store.injectable";
import openAddRoleDialogInjectable from "./open-add-dialog.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

export interface RolesProps extends RouteComponentProps<RolesRouteParams> {
}

interface Dependencies {
  roleStore: RoleStore;
  openAddRoleDialog: () => void;
}

const NonInjectedRoles = observer(({ roleStore, openAddRoleDialog }: Dependencies & RolesProps) => (
  <>
    <KubeObjectListLayout
      isConfigurable
      tableId="access_roles"
      className="Roles"
      store={roleStore}
      sortingCallbacks={{
        [columnId.name]: role => role.getName(),
        [columnId.namespace]: role => role.getNs(),
        [columnId.age]: role => role.getTimeDiffFromNow(),
      }}
      searchFilters={[
        role => role.getSearchFields(),
      ]}
      renderHeaderTitle="Roles"
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
        { className: "warning", showWithColumn: columnId.name },
        { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={role => [
        role.getName(),
        <KubeObjectStatusIcon key="icon" object={role} />,
        role.getNs(),
        role.getAge(),
      ]}
      addRemoveButtons={{
        onAdd: openAddRoleDialog,
        addTooltip: "Create new Role",
      }}
    />
    <AddRoleDialog/>
  </>
));

export const Roles = withInjectables<Dependencies, RolesProps>(NonInjectedRoles, {
  getProps: (di, props) => ({
    roleStore: di.inject(roleStoreInjectable),
    openAddRoleDialog: di.inject(openAddRoleDialogInjectable),
    ...props,
  }),
});

