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

import "./dialog.scss";

import { observable } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";

import { serviceAccountsStore } from "../+service-accounts/store";
import { ClusterRole, ClusterRoleBinding, ServiceAccount } from "../../../../common/k8s-api/endpoints";
import { Dialog, DialogProps } from "../../dialog";
import { EditableList } from "../../editable-list";
import { Icon } from "../../icon";
import { showDetails } from "../../kube-detail-params";
import { SubTitle } from "../../layout/sub-title";
import { Notifications } from "../../notifications";
import { Select, SelectOption } from "../../select";
import { Wizard, WizardStep } from "../../wizard";
import type { ClusterRoleBindingStore } from "./store";
import type { ClusterRoleStore } from "../+cluster-roles/store";
import { ObservableHashSet, nFircate } from "../../../utils";
import { Input } from "../../input";
import { TooltipPosition } from "../../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterRoleBindingStoreInjectable from "./store.injectable";
import clusterRoleStoreInjectable from "../+cluster-roles/store.injectable";
import clusterRoleBindingDialogStateInjectable from "./dialog.state.injectable";

export interface ClusterRoleBindingDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  clusterRoleBindingStore: ClusterRoleBindingStore;
  clusterRoleStore: ClusterRoleStore;
  isOpen: boolean;
  clusterRoleBinding: ClusterRoleBinding | null;
}

const NonInjectedClusterRoleBindingDialog = observer(({ clusterRoleBindingStore, clusterRoleStore, isOpen, clusterRoleBinding, className, ...dialogProps }: Dependencies & ClusterRoleBindingDialogProps) => {
  const [selectedRoleRef, setSelectedRoleRef] = useState<ClusterRole | null>(null);
  const [bindingName, setBindingName] = useState("");
  const [selectedAccounts] = useState(new ObservableHashSet<ServiceAccount>([], sa => sa.metadata.uid));
  const [selectedUsers] = useState(observable.set<string>([]));
  const [selectedGroups] = useState(observable.set<string>([]));

  useEffect(() => setBindingName(clusterRoleBinding?.getName() ?? ""), [clusterRoleBinding]);

  const isEditing = Boolean(clusterRoleBinding);
  const selectedBindings = [
    ...Array.from(selectedAccounts, sa => ({
      name: sa.getName(),
      kind: "ServiceAccount" as const,
      namespace: sa.getNs(),
    })),
    ...Array.from(selectedUsers, user => ({
      name: user,
      kind: "User" as const,
    })),
    ...Array.from(selectedGroups, group => ({
      name: group,
      kind: "Group" as const,
    })),
  ];

  const clusterRoleRefoptions = clusterRolesStore.items.map(value => ({
    value,
    label: value.getName(),
  }));

  const serviceAccountOptions = serviceAccountsStore.items.map(account => ({
    value: account,
    label: `${account.getName()} (${account.getNs()})`,
  }));

  const selectedServiceAccountOptions = serviceAccountOptions.filter(({ value }) => selectedAccounts.has(value));

  const   onOpen = action(() => {
    const binding = clusterRoleBinding;

    if (!binding) {
      return reset();
    }

    selectedRoleRef = clusterRolesStore
      .items
      .find(item => item.getName() === binding.roleRef.name);
    bindingName = clusterRoleBinding.getName();

    const [saSubjects, uSubjects, gSubjects] = nFircate(binding.getSubjects(), "kind", ["ServiceAccount", "User", "Group"]);
    const accountNames = new Set(saSubjects.map(acc => acc.name));

    selectedAccounts.replace(
      serviceAccountsStore.items
        .filter(sa => accountNames.has(sa.getName())),
    );
    selectedUsers.replace(uSubjects.map(user => user.name));
    selectedGroups.replace(gSubjects.map(group => group.name));
  });

  const   reset = action(() => {
    selectedRoleRef = undefined;
    bindingName = "";
    selectedAccounts.clear();
    selectedUsers.clear();
    selectedGroups.clear();
  });

  createBindings = async () => {
    try {
      const { selfLink } = isEditing
        ? await clusterRoleBindingStore.updateSubjects(clusterRoleBinding, selectedBindings)
        : await clusterRoleBindingStore.create({ name: bindingName }, {
          subjects: selectedBindings,
          roleRef: {
            name: selectedRoleRef.getName(),
            kind: selectedRoleRef.kind,
          },
        });

      showDetails(selfLink);
      ClusterRoleBindingDialog.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  const renderContents = () => {
    return (
      <>
        <SubTitle title="Cluster Role Reference" />
        <Select
          themeName="light"
          placeholder="Select cluster role ..."
          isDisabled={isEditing}
          options={clusterRoleRefoptions}
          value={selectedRoleRef}
          autoFocus={!isEditing}
          formatOptionLabel={({ value }: SelectOption<ClusterRole>) => (
            <>
              <Icon
                small
                material={value.kind === "Role" ? "person" : "people"}
                tooltip={{
                  preferredPositions: TooltipPosition.LEFT,
                  children: value.kind,
                }}
              />
              {" "}
              {value.getName()}
            </>
          )}
          onChange={({ value }: SelectOption<ClusterRole> ) => {
            if (!selectedRoleRef || bindingName === selectedRoleRef.getName()) {
              bindingName = value.getName();
            }

            selectedRoleRef = value;
          }}
        />

        <SubTitle title="Binding Name" />
        <Input
          placeholder="Name of ClusterRoleBinding ..."
          disabled={isEditing}
          value={bindingName}
          onChange={val => bindingName = val}
        />

        <SubTitle title="Binding targets" />

        <b>Users</b>
        <EditableList
          placeholder="Bind to User Account ..."
          add={(newUser) => selectedUsers.add(newUser)}
          items={Array.from(selectedUsers)}
          remove={({ oldItem }) => selectedUsers.delete(oldItem)}
        />

        <b>Groups</b>
        <EditableList
          placeholder="Bind to User Group ..."
          add={(newGroup) => selectedGroups.add(newGroup)}
          items={Array.from(selectedGroups)}
          remove={({ oldItem }) => selectedGroups.delete(oldItem)}
        />

        <b>Service Accounts</b>
        <Select
          isMulti
          themeName="light"
          placeholder="Select service accounts ..."
          autoConvertOptions={false}
          options={serviceAccountOptions}
          value={selectedServiceAccountOptions}
          formatOptionLabel={({ value }: SelectOption<ServiceAccount>) => (
            <><Icon small material="account_box" /> {value.getName()} ({value.getNs()})</>
          )}
          onChange={(selected: SelectOption<ServiceAccount>[] | null) => {
            if (selected) {
              selectedAccounts.replace(selected.map(opt => opt.value));
            } else {
              selectedAccounts.clear();
            }
          }}
          maxMenuHeight={200}
        />
      </>
    );
  };

  const [action, nextLabel] = isEditing ? ["Edit", "Update"] : ["Add", "Create"];
  const disableNext = !selectedRoleRef || !selectedBindings.length || !bindingName;

  return (
    <Dialog
      {...dialogProps}
      className="AddClusterRoleBindingDialog"
      isOpen={ClusterRoleBindingDialog.state.isOpen}
      close={ClusterRoleBindingDialog.close}
      onClose={reset}
      onOpen={onOpen}
    >
      <Wizard
        header={<h5>{action} ClusterRoleBinding</h5>}
        done={ClusterRoleBindingDialog.close}
      >
        <WizardStep
          nextLabel={nextLabel}
          next={createBindings}
          disabledNext={disableNext}
        >
          {renderContents()}
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const ClusterRoleBindingDialog = withInjectables<Dependencies, ClusterRoleBindingDialogProps>(NonInjectedClusterRoleBindingDialog, {
  getProps: (di, props) => ({
    clusterRoleBindingStore: di.inject(clusterRoleBindingStoreInjectable),
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    ...di.inject(clusterRoleBindingDialogStateInjectable),
    ...props,
  }),
});
