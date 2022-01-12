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

import { observer } from "mobx-react";
import React, { useState } from "react";

import { Dialog, DialogProps } from "../dialog";
import { Input } from "../input";
import { showDetails } from "../kube-detail-params";
import { SubTitle } from "../layout/sub-title";
import { Notifications } from "../notifications";
import { Wizard, WizardStep } from "../wizard";
import type { ClusterRoleStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterRoleStoreInjectable from "./store.injectable";
import addClusterRoleDialogStateInjectable from "./add-dialog.state.injectable";
import { cssNames } from "../../utils";
import closeAddClusterRoleDialogInjectable from "./close-add-dialog.injectable";

export interface AddClusterRoleDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  clusterRoleStore: ClusterRoleStore;
  isOpen: boolean;
  closeAddClusterRoleDialog: () => void;
}

const NonInjectedAddClusterRoleDialog = observer(({ clusterRoleStore, isOpen, closeAddClusterRoleDialog, className, ...dialogProps }: Dependencies & AddClusterRoleDialogProps) => {
  const [clusterRoleName, setClusterRoleName] = useState("");

  const reset = () => {
    setClusterRoleName("");
  };
  const createRole = async () => {
    try {
      const role = await clusterRoleStore.create({ name: clusterRoleName });

      showDetails(role.selfLink);
      reset();
      closeAddClusterRoleDialog();
    } catch (err) {
      Notifications.error(err.toString());
    }
  };

  return (
    <Dialog
      {...dialogProps}
      className={cssNames("AddClusterRoleDialog", className)}
      isOpen={isOpen}
      close={closeAddClusterRoleDialog}
    >
      <Wizard
        header={<h5>Create ClusterRole</h5>}
        done={closeAddClusterRoleDialog}
      >
        <WizardStep
          contentClass="flex gaps column"
          nextLabel="Create"
          next={createRole}
        >
          <SubTitle title="ClusterRole Name" />
          <Input
            required autoFocus
            placeholder="Name"
            iconLeft="supervisor_account"
            value={clusterRoleName}
            onChange={setClusterRoleName}
          />
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const AddClusterRoleDialog = withInjectables<Dependencies, AddClusterRoleDialogProps>(NonInjectedAddClusterRoleDialog, {
  getProps: (di, props) => ({
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    closeAddClusterRoleDialog: di.inject(closeAddClusterRoleDialogInjectable),
    ...di.inject(addClusterRoleDialogStateInjectable),
    ...props,
  }),
});
