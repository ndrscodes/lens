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

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import type { CronJob, CronJobApi } from "../../../common/k8s-api/endpoints";
import cronJobApiInjectable from "../../../common/k8s-api/endpoints/cron-job.api.injectable";
import type { ConfirmDialogParams } from "../confirm-dialog";
import openConfirmDialogInjectable from "../confirm-dialog/dialog-open.injectable";
import { Icon } from "../icon";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { Notifications } from "../notifications";
import openCronJobTriggerDialogInjectable from "./trigger-dialog-open.injectable";
import { MenuItem } from "../menu";

export interface CronJobMenuProps extends KubeObjectMenuProps<CronJob> {

}

interface Dependencies {
  openCronJobTriggerDialog: (cronJob: CronJob) => void;
  openConfirmDialog: (params: ConfirmDialogParams) => void;
  cronJobApi: CronJobApi;
}

const NonInjectedCronJobMenu = observer(({ openCronJobTriggerDialog, openConfirmDialog, cronJobApi, object: cronJob, toolbar }: Dependencies & CronJobMenuProps) => (
  <>
    <MenuItem onClick={() => openCronJobTriggerDialog(cronJob)}>
      <Icon material="play_circle_filled" tooltip="Trigger" interactive={toolbar}/>
      <span className="title">Trigger</span>
    </MenuItem>

    {cronJob.isSuspend()
      ? (
        <MenuItem onClick={() => openConfirmDialog({
          ok: async () => {
            try {
              await cronJobApi.resume({ namespace: cronJob.getNs(), name: cronJob.getName() });
            } catch (err) {
              Notifications.error(err);
            }
          },
          labelOk: `Resume`,
          message: (
            <p>
              Resume CronJob <b>{cronJob.getName()}</b>?
            </p>),
        })}>
          <Icon material="play_circle_outline" tooltip="Resume" interactive={toolbar}/>
          <span className="title">Resume</span>
        </MenuItem>
      )
      : (
        <MenuItem onClick={() => openConfirmDialog({
          ok: async () => {
            try {
              await cronJobApi.suspend({ namespace: cronJob.getNs(), name: cronJob.getName() });
            } catch (err) {
              Notifications.error(err);
            }
          },
          labelOk: `Suspend`,
          message: (
            <p>
              Suspend CronJob <b>{cronJob.getName()}</b>?
            </p>
          ),
        })}>
          <Icon material="pause_circle_filled" tooltip="Suspend" interactive={toolbar}/>
          <span className="title">Suspend</span>
        </MenuItem>
      )
    }
  </>
));

export const CronJobMenu = withInjectables<Dependencies, CronJobMenuProps>(NonInjectedCronJobMenu, {
  getProps: (di, props) => ({
    cronJobApi: di.inject(cronJobApiInjectable),
    openCronJobTriggerDialog: di.inject(openCronJobTriggerDialogInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    ...props,
  }),
});
