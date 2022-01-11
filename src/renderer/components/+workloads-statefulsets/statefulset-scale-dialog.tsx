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

import "./statefulset-scale-dialog.scss";

import type { StatefulSet, StatefulSetApi } from "../../../common/k8s-api/endpoints";
import React, { useState } from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Icon } from "../icon";
import { Slider } from "../slider";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import statefulSetApiInjectable from "../../../common/k8s-api/endpoints/stateful-set.api.injectable";
import statefulSetScaleDialogStateInjectable from "./scale-dialog.state.injectable";
import closeStatefulSetDialogScaleInjectable from "./scale-dialog-close.injectable";

export interface StatefulSetScaleDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  statefulSetApi: StatefulSetApi;
  statefulSet: StatefulSet | null;
  closeStatefulSetScaleDialog: () => void;
}

const defaultScaleMax = 50;

const NonInjectedStatefulSetScaleDialog = observer(({ statefulSetApi, statefulSet, className, closeStatefulSetScaleDialog, ...dialogProps }: Dependencies & StatefulSetScaleDialogProps) => {
  const [ready, setReady] = useState(false);
  const [currentReplicas, setCurrentReplicas] = useState(0);
  const [desiredReplicas, setDesiredReplicas] = useState(0);

  const isOpen = Boolean(statefulSet);
  const scaleMax = Math.min(currentReplicas, defaultScaleMax) * 2;
  const scaleMin = 0;

  const onClose = () => setReady(false);
  const onChange = (evt: React.ChangeEvent, value: number) => setDesiredReplicas(value);
  const desiredReplicasUp = () => setDesiredReplicas(Math.min(scaleMax, desiredReplicas + 1));
  const desiredReplicasDown = () => setDesiredReplicas(Math.max(scaleMin, desiredReplicas - 1));
  const onOpen = async () => {
    setCurrentReplicas(
      await statefulSetApi.getReplicas({
        namespace: statefulSet.getNs(),
        name: statefulSet.getName(),
      }),
    );
    setDesiredReplicas(currentReplicas);
    setReady(true);
  };
  const scale = async () => {
    try {
      if (currentReplicas !== desiredReplicas) {
        await statefulSetApi.scale({
          name: statefulSet.getName(),
          namespace: statefulSet.getNs(),
        }, desiredReplicas);
      }
      closeStatefulSetScaleDialog();
    } catch (err) {
      Notifications.error(err);
    }
  };

  return (
    <Dialog
      {...dialogProps}
      isOpen={isOpen}
      className={cssNames("StatefulSetScaleDialog", className)}
      onOpen={onOpen}
      onClose={onClose}
      close={closeStatefulSetScaleDialog}
    >
      <Wizard
        header={(
          <h5>
        Scale Stateful Set <span>{statefulSet?.getName()}</span>
          </h5>
        )}
        done={closeStatefulSetScaleDialog}
      >
        <WizardStep
          contentClass="flex gaps column"
          next={scale}
          nextLabel="Scale"
          disabledNext={!ready}
        >
          <div className="current-scale" data-testid="current-scale">
          Current replica scale: {currentReplicas}
          </div>
          <div className="flex gaps align-center">
            <div className="desired-scale" data-testid="desired-scale">
            Desired number of replicas: {desiredReplicas}
            </div>
            <div className="slider-container flex align-center" data-testid="slider">
              <Slider value={desiredReplicas} max={scaleMax}
                onChange={onChange as any /** see: https://github.com/mui-org/material-ui/issues/20191 */}
              />
            </div>
            <div className="plus-minus-container flex gaps">
              <Icon
                material="add_circle_outline"
                onClick={desiredReplicasUp}
                data-testid="desired-replicas-up"
              />
              <Icon
                material="remove_circle_outline"
                onClick={desiredReplicasDown}
                data-testid="desired-replicas-down"
              />
            </div>
          </div>
          {currentReplicas < 10 && desiredReplicas > 90 && (
            <div className="warning" data-testid="warning">
              <Icon material="warning"/>
                High number of replicas may cause cluster performance issues
            </div>
          )}
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const StatefulSetScaleDialog = withInjectables<Dependencies, StatefulSetScaleDialogProps>(NonInjectedStatefulSetScaleDialog, {
  getProps: (di, props) => ({
    statefulSetApi: di.inject(statefulSetApiInjectable),
    statefulSet: di.inject(statefulSetScaleDialogStateInjectable).statefulSet,
    closeStatefulSetScaleDialog: di.inject(closeStatefulSetDialogScaleInjectable),
    ...props,
  }),
});
