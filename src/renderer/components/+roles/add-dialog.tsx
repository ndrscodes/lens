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

import "./add-dialog.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";

import { NamespaceSelect } from "../+namespaces/namespace-select";
import { Dialog, DialogProps } from "../dialog";
import { Input } from "../input";
import { showDetails } from "../kube-detail-params";
import { SubTitle } from "../layout/sub-title";
import { Notifications } from "../notifications";
import { Wizard, WizardStep } from "../wizard";
import type { RoleStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import roleStoreInjectable from "./store.injectable";
import addRoleDialogStateInjectable from "./add-dialog.state.injectable";
import closeAddRoleDialogInjectable from "./close-add-dialog.injectable";
import { cssNames } from "../../utils";

export interface AddRoleDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  roleStore: RoleStore;
  isOpen: boolean;
  closeAddRoleDialog: () => void;
}

const NonInjectedAddRoleDialog = observer(({ roleStore, isOpen, closeAddRoleDialog, className, ...dialogProps }: Dependencies & AddRoleDialogProps) => {
  const [roleName, setRoleName] = useState("");
  const [namespace, setNamespace] = useState("");

  const reset = () => {
    setRoleName("");
    setNamespace("");
  };

  const createRole = async () => {
    try {
      const role = await roleStore.create({ name: roleName, namespace });

      showDetails(role.selfLink);
      reset();
      closeAddRoleDialog();
    } catch (err) {
      Notifications.error(err.toString());
    }
  };

  return (
    <Dialog
      {...dialogProps}
      className={cssNames("AddRoleDialog", className)}
      isOpen={isOpen}
      close={closeAddRoleDialog}
    >
      <Wizard header={<h5>Create Role</h5>} done={closeAddRoleDialog}>
        <WizardStep
          contentClass="flex gaps column"
          nextLabel="Create"
          next={createRole}
        >
          <SubTitle title="Role Name" />
          <Input
            required autoFocus
            placeholder="Name"
            iconLeft="supervisor_account"
            value={roleName}
            onChange={setRoleName}
          />
          <SubTitle title="Namespace" />
          <NamespaceSelect
            themeName="light"
            value={namespace}
            onChange={({ value }) => setNamespace(value)}
          />
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const AddRoleDialog = withInjectables<Dependencies, AddRoleDialogProps>(NonInjectedAddRoleDialog, {
  getProps: (di, props) => ({
    roleStore: di.inject(roleStoreInjectable),
    closeAddRoleDialog: di.inject(closeAddRoleDialogInjectable),
    ...di.inject(addRoleDialogStateInjectable),
    ...props,
  }),
});
