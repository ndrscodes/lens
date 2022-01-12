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

import "./create-dialog.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";

import { NamespaceSelect } from "../../+namespaces/namespace-select";
import { Dialog, DialogProps } from "../../dialog";
import { Input } from "../../input";
import { systemName } from "../../input/input_validators";
import { showDetails } from "../../kube-detail-params";
import { SubTitle } from "../../layout/sub-title";
import { Notifications } from "../../notifications";
import { Wizard, WizardStep } from "../../wizard";
import type { ServiceAccountStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import createServiceAccountDialogStateInjectable from "./create-dialog.state.injectable";
import serviceAccountStoreInjectable from "./store.injectable";
import closeCreateServiceAccountDialogInjectable from "./close-create-dialog.injectable";
import { cssNames } from "../../../utils";

export interface CreateServiceAccountDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  isOpen: boolean;
  serviceAccountStore: ServiceAccountStore;
  closeCreateServiceAccountDialog: () => void;
}

const NonInjectedCreateServiceAccountDialog = observer(({ isOpen, serviceAccountStore, closeCreateServiceAccountDialog, className, ...dialogProps }: Dependencies & CreateServiceAccountDialogProps) => {
  const [name, setName] = useState("");
  const [namespace, setNamespace] = useState("default");

  const reset = () => {
    setName("");
    setNamespace("default");
  };

  const createAccount = async () => {
    try {
      const serviceAccount = await serviceAccountStore.create({ namespace, name });

      reset();
      showDetails(serviceAccount.selfLink);
      closeCreateServiceAccountDialog();
    } catch (err) {
      Notifications.error(err);
    }
  };

  return (
    <Dialog
      {...dialogProps}
      className={cssNames("CreateServiceAccountDialog", className)}
      isOpen={isOpen}
      close={closeCreateServiceAccountDialog}
    >
      <Wizard header={<h5>Create Service Account</h5>} done={closeCreateServiceAccountDialog}>
        <WizardStep nextLabel="Create" next={createAccount}>
          <SubTitle title="Account Name" />
          <Input
            autoFocus
            required
            placeholder="Enter a name"
            trim
            validators={systemName}
            value={name}
            onChange={setName}
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

export const CreateServiceAccountDialog = withInjectables<Dependencies, CreateServiceAccountDialogProps>(NonInjectedCreateServiceAccountDialog, {
  getProps: (di, props) => ({
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    closeCreateServiceAccountDialog: di.inject(closeCreateServiceAccountDialogInjectable),
    ...di.inject(createServiceAccountDialogStateInjectable),
    ...props,
  }),
});

