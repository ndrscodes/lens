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
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Input } from "../input";
import { systemName } from "../input/input_validators";
import { ResourceQuotaApi, resourceQuotaKinds, ResourceQuotaKinds } from "../../../common/k8s-api/endpoints";
import { Select } from "../select";
import { Icon } from "../icon";
import { Button } from "../button";
import { Notifications } from "../notifications";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { SubTitle } from "../layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import resourceQuotaApiInjectable from "../../../common/k8s-api/endpoints/resource-quota.api.injectable";
import addResourceQuotaDialogStateInjectable from "./add-dialog.state.injectable";
import closeAddResourceQuotaDialogInjectable from "./add-dialog-close.injectable";
import { cssNames, iter } from "../../utils";

export interface AddQuotaDialogProps extends DialogProps {
}

interface Dependencies {
  resourceQuotaApi: ResourceQuotaApi;
  isOpen: boolean;
  closeAddResourceQuotaDialog: () => void;
}

const NonInjectedAddQuotaDialog = observer(({ resourceQuotaApi, isOpen, closeAddResourceQuotaDialog, className, ...dialogProps }: Dependencies & AddQuotaDialogProps) => {
  const [quotaName, setQuotaName] = useState("");
  const [quotaSelectValue, setQuotaSelectValue] = useState<ResourceQuotaKinds>(resourceQuotaKinds[0]);
  const [quotaInputValue, setQuotaInputValue] = useState("");
  const [namespace, setNamespace] = useState("default");
  const [quotas] = useState(observable.map(resourceQuotaKinds.map(resourceQuotaKind => [resourceQuotaKind, ""])));

  const quotaEntries = [...iter.filter(quotas.entries(), ([, value]) => value.trim().length === 0)];
  const quotaOptions = Array.from(quotas.keys(), quota => {
    const isCompute = quota.endsWith(".cpu") || quota.endsWith(".memory");
    const isStorage = quota.endsWith(".storage") || quota === "persistentvolumeclaims";
    const isCount = quota.startsWith("count/");
    const icon = isCompute ? "memory" : isStorage ? "storage" : isCount ? "looks_one" : "";

    return {
      label: icon ? <span className="nobr"><Icon material={icon} /> {quota}</span> : quota,
      value: quota,
    };
  });

  const reset = () => {
    quotas.replace(resourceQuotaKinds.map(resourceQuotaKind => [resourceQuotaKind, ""]));
    setQuotaName("");
    setQuotaSelectValue(resourceQuotaKinds[0]);
    setQuotaInputValue("");
    setNamespace("default");
  };
  const setQuota = () => {
    if (quotaSelectValue) {
      quotas.set(quotaSelectValue, quotaInputValue);
      setQuotaInputValue("");
    }
  };
  const addQuota = async () => {
    try {
      await resourceQuotaApi.create({ namespace, name: quotaName }, {
        spec: {
          hard: Object.fromEntries(quotaEntries),
        },
      });
      closeAddResourceQuotaDialog();
    } catch (err) {
      Notifications.error(err);
    }
  };
  const onInputQuota = (evt: React.KeyboardEvent) => {
    switch (evt.key) {
      case "Enter":
        setQuota();
        evt.preventDefault(); // don't submit form
        break;
    }
  };

  return (
    <Dialog
      {...dialogProps}
      className={cssNames("AddQuotaDialog", className)}
      isOpen={isOpen}
      onOpen={reset}
      close={closeAddResourceQuotaDialog}
    >
      <Wizard header={<h5>Create ResourceQuota</h5>} done={closeAddResourceQuotaDialog}>
        <WizardStep
          contentClass="flex gaps column"
          disabledNext={!namespace}
          nextLabel="Create"
          next={addQuota}
        >
          <div className="flex gaps">
            <Input
              required autoFocus
              placeholder="ResourceQuota name"
              trim
              validators={systemName}
              value={quotaName}
              onChange={setQuotaName}
              className="box grow"
            />
          </div>

          <SubTitle title="Namespace" />
          <NamespaceSelect
            value={namespace}
            placeholder="Namespace"
            themeName="light"
            className="box grow"
            onChange={({ value }) => setNamespace(value)}
          />

          <SubTitle title="Values" />
          <div className="flex gaps align-center">
            <Select
              className="quota-select"
              themeName="light"
              placeholder="Select a quota.."
              options={quotaOptions}
              value={quotaSelectValue}
              onChange={({ value }) => setQuotaSelectValue(value)}
            />
            <Input
              maxLength={10}
              placeholder="Value"
              value={quotaInputValue}
              onChange={setQuotaInputValue}
              onKeyDown={onInputQuota}
              className="box grow"
            />
            <Button round primary onClick={setQuota}>
              <Icon
                material={quotas.get(quotaSelectValue) ? "edit" : "add"}
                tooltip="Set quota"
              />
            </Button>
          </div>
          <div className="quota-entries">
            {quotaEntries.map(([quota, value]) => (
              <div key={quota} className="quota gaps inline align-center">
                <div className="name">{quota}</div>
                <div className="value">{value}</div>
                <Icon material="clear" onClick={() => quotas.set(quota, "")} />
              </div>
            ))}
          </div>
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const AddResourceQuotaDialog = withInjectables<Dependencies, AddQuotaDialogProps>(NonInjectedAddQuotaDialog, {
  getProps: (di, props) => ({
    resourceQuotaApi: di.inject(resourceQuotaApiInjectable),
    isOpen: di.inject(addResourceQuotaDialogStateInjectable).isOpen,
    closeAddResourceQuotaDialog: di.inject(closeAddResourceQuotaDialogInjectable),
    ...props,
  }),
});
