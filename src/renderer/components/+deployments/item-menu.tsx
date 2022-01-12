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
import type { Deployment, DeploymentApi } from "../../../common/k8s-api/endpoints";
import deploymentApiInjectable from "../../../common/k8s-api/endpoints/deployment.api.injectable";
import type { ConfirmDialogParams } from "../confirm-dialog";
import openConfirmDialogInjectable from "../confirm-dialog/dialog-open.injectable";
import { Icon } from "../icon";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { MenuItem } from "../menu";
import { Notifications } from "../notifications";
import openDeploymentScaleDialogInjectable from "./scale-dialog-open.injectable";

export interface DeploymentMenuProps extends KubeObjectMenuProps<Deployment> {

}

interface Dependencies {
  openDeploymentScaleDialog: (deployment: Deployment) => void;
  deploymentApi: DeploymentApi;
  openConfirmDialog: (params: ConfirmDialogParams) => void;
}

const NonInjectedDeploymentMenu = observer(({ openDeploymentScaleDialog, openConfirmDialog, deploymentApi, object: deployment, toolbar }: Dependencies & DeploymentMenuProps) => (
  <>
    <MenuItem onClick={() => openDeploymentScaleDialog(deployment)}>
      <Icon material="open_with" tooltip="Scale" interactive={toolbar}/>
      <span className="title">Scale</span>
    </MenuItem>
    <MenuItem onClick={() => openConfirmDialog({
      ok: async () =>
      {
        try {
          await deploymentApi.restart({
            namespace: deployment.getNs(),
            name: deployment.getName(),
          });
        } catch (err) {
          Notifications.error(err);
        }
      },
      labelOk: `Restart`,
      message: (
        <p>
            Are you sure you want to restart deployment <b>{deployment.getName()}</b>?
        </p>
      ),
    })}>
      <Icon material="autorenew" tooltip="Restart" interactive={toolbar}/>
      <span className="title">Restart</span>
    </MenuItem>
  </>
));

export const DeploymentMenu = withInjectables<Dependencies, DeploymentMenuProps>(NonInjectedDeploymentMenu, {
  getProps: (di, props) => ({
    deploymentApi: di.inject(deploymentApiInjectable),
    openDeploymentScaleDialog: di.inject(openDeploymentScaleDialogInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    ...props,
  }),
});
