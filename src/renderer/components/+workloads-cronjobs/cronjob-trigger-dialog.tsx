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

import "./cronjob-trigger-dialog.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import type { CronJob, CronJobApi, JobApi } from "../../../common/k8s-api/endpoints";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";
import { Input } from "../input";
import { systemName, maxLength } from "../input/input_validators";
import type { KubeObjectMetadata } from "../../../common/k8s-api/kube-object";
import { withInjectables } from "@ogre-tools/injectable-react";
import cronJobApiInjectable from "../../../common/k8s-api/endpoints/cron-job.api.injectable";
import jobApiInjectable from "../../../common/k8s-api/endpoints/job.api.injectable";
import cronjobTriggerDialogStateInjectable from "./trigger-dialog.state.injectable";
import closeCronJobTriggerDialogInjectable from "./trigger-dialog-close.injectable";

export interface CronJobTriggerDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  cronJobApi: CronJobApi;
  jobApi: JobApi;
  cronJob: CronJob | null;
  closeCronJobTriggerDialog: () => void;
}

const NonInjectedCronJobTriggerDialog = observer(({ cronJobApi, jobApi, cronJob, closeCronJobTriggerDialog, className, ...dialogProps }: Dependencies & CronJobTriggerDialogProps) => {
  const [jobName, setJobName] = useState("");
  const [ready, setReady] = useState(false);
  const isOpen = Boolean(cronJob);

  const onOpen = () => {
    setJobName(
      cronJob
        ? `${cronJob.getName()}-manual-${Math.random().toString(36).slice(2, 7)}`.slice(0, 63)
        : "",
    );
    setReady(true);
  };
  const onClose = () => setReady(false);

  const trigger = async () => {
    try {
      const cronJobDefinition = await cronJobApi.get({
        name: cronJob.getName(),
        namespace: cronJob.getNs(),
      });

      await jobApi.create({
        name: jobName,
        namespace: cronJob.getNs(),
      }, {
        spec: cronJobDefinition.spec.jobTemplate.spec,
        metadata: {
          ownerReferences: [{
            apiVersion: cronJob.apiVersion,
            blockOwnerDeletion: true,
            controller: true,
            kind: cronJob.kind,
            name: cronJob.metadata.name,
            uid: cronJob.metadata.uid,
          }],
        } as KubeObjectMetadata,
      });

      closeCronJobTriggerDialog();
    } catch (err) {
      Notifications.error(err);
    }
  };

  return (
    <Dialog
      {...dialogProps}
      isOpen={isOpen}
      className={cssNames("CronJobTriggerDialog", className)}
      onOpen={onOpen}
      onClose={onClose}
      close={closeCronJobTriggerDialog}
    >
      <Wizard
        header={(
          <h5>
            Trigger CronJob <span>{cronJob?.getName()}</span>
          </h5>
        )}
        done={closeCronJobTriggerDialog}
      >
        <WizardStep
          contentClass="flex gaps column"
          next={trigger}
          nextLabel="Trigger"
          disabledNext={!ready}
        >
          <div className="flex gaps">
              Job name:
          </div>
          <div className="flex gaps">
            <Input
              required
              autoFocus
              placeholder={jobName}
              trim
              validators={[systemName, maxLength]}
              maxLength={63}
              value={jobName}
              onChange={v => setJobName(v.toLowerCase())}
              className="box grow"
            />
          </div>
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const CronJobTriggerDialog = withInjectables<Dependencies, CronJobTriggerDialogProps>(NonInjectedCronJobTriggerDialog, {
  getProps: (di, props) => ({
    cronJobApi: di.inject(cronJobApiInjectable),
    jobApi: di.inject(jobApiInjectable),
    cronJob: di.inject(cronjobTriggerDialogStateInjectable).cronJob,
    closeCronJobTriggerDialog: di.inject(closeCronJobTriggerDialogInjectable),
    ...props,
  }),
});
