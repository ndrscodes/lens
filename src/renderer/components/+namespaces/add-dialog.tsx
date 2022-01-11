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
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import type { NamespaceStore } from "./store";
import type { Namespace } from "../../../common/k8s-api/endpoints";
import { Input } from "../input";
import { systemName } from "../input/input_validators";
import { Notifications } from "../notifications";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./store.injectable";
import addNamespaceDialogStateInjectable from "./add-dialog.state.injectable";
import closeAddNamespaceDialogInjectable from "./add-dialog-close.injectable";
import { noop } from "../../utils";

export interface AddNamespaceDialogProps extends DialogProps {
  onSuccess?: (ns: Namespace) => void;
  onError?: (error: any) => void;
}

interface Dependencies {
  namespaceStore: NamespaceStore;
  isOpen: boolean;
  closeAddNamespaceDialog: () => void;
}

const NonInjectedAddNamespaceDialog = observer(({ namespaceStore, isOpen, closeAddNamespaceDialog, className, onSuccess = noop, onError = noop, ...dialogProps }: Dependencies & AddNamespaceDialogProps) => {
  const [namespace, setNamespace] = useState("");

  const addNamespace = async () => {
    try {
      const created = await namespaceStore.create({ name: namespace });

      onSuccess(created);
      closeAddNamespaceDialog();
    } catch (err) {
      Notifications.error(err);
      onError(err);
    }
  };
  const reset = () => {
    setNamespace("");
  };

  return (
    <Dialog
      {...dialogProps}
      className="AddNamespaceDialog"
      isOpen={isOpen}
      onOpen={reset}
      close={closeAddNamespaceDialog}
    >
      <Wizard header={<h5>Create Namespace</h5>} done={closeAddNamespaceDialog}>
        <WizardStep
          contentClass="flex gaps column"
          nextLabel="Create"
          next={addNamespace}
        >
          <Input
            required autoFocus
            iconLeft="layers"
            placeholder="Namespace"
            trim
            validators={systemName}
            value={namespace}
            onChange={setNamespace}
          />
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const AddNamespaceDialog = withInjectables<Dependencies, AddNamespaceDialogProps>(NonInjectedAddNamespaceDialog, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    isOpen: di.inject(addNamespaceDialogStateInjectable).isOpen,
    closeAddNamespaceDialog: di.inject(closeAddNamespaceDialogInjectable),
    ...props,
  }),
});
