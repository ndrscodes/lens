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

import "./confirm-dialog.scss";

import React, { ReactNode, useState } from "react";
import { observer } from "mobx-react";
import { cssNames, noop, prevDefault } from "../../utils";
import { Button, ButtonProps } from "../button";
import { Dialog, DialogProps } from "../dialog";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { withInjectables } from "@ogre-tools/injectable-react";
import confirmDialogStateInjectable from "./dialog.state.injectable";
import closeConfirmDialogInjectable from "./dialog-close.injectable";

export interface ConfirmDialogProps extends Partial<DialogProps> {
}

export interface ConfirmDialogParams extends ConfirmDialogBooleanParams {
  ok?: () => any | Promise<any>;
  cancel?: () => any | Promise<any>;
}

export interface ConfirmDialogBooleanParams {
  labelOk?: ReactNode;
  labelCancel?: ReactNode;
  message: ReactNode;
  icon?: ReactNode;
  okButtonProps?: Partial<ButtonProps>;
  cancelButtonProps?: Partial<ButtonProps>;
}

interface Dependencies {
  params: ConfirmDialogParams | null;
  closeConfirmDialog: () => void;
}

const NonInjectedConfirmDialog = observer(({ params, closeConfirmDialog, className, ...dialogProps }: Dependencies & ConfirmDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const isOpen = Boolean(params);
  const {
    message,
    icon = <Icon big material="warning"/>,
    labelCancel = "Cancel",
    cancel = noop,
    cancelButtonProps = {},
    labelOk = "Ok",
    ok = noop,
    okButtonProps = {},
  } = params;

  const actionOk = async () => {
    try {
      setIsSaving(true);
      await (async () => ok())();
    } catch (error) {
      Notifications.error(
        <>
          <p>Confirmation action failed:</p>
          <p>{error?.message ?? error?.toString?.() ?? "Unknown error"}</p>
        </>,
      );
    } finally {
      setIsSaving(false);
      closeConfirmDialog();
    }
  };

  const onClose = () => setIsSaving(false);

  const actionClose = async () => {
    try {
      await (async () => cancel())();
    } catch (error) {
      Notifications.error(
        <>
          <p>Cancelling action failed:</p>
          <p>{error?.message ?? error?.toString?.() ?? "Unknown error"}</p>
        </>,
      );
    } finally {
      setIsSaving(false);
      closeConfirmDialog();
    }
  };

  return (
    <Dialog
      {...dialogProps}
      className={cssNames("ConfirmDialog", className)}
      isOpen={isOpen}
      onClose={onClose}
      close={actionClose}
      data-testid="confirmation-dialog"
    >
      <div className="confirm-content">
        {icon} {message}
      </div>
      <div className="confirm-buttons">
        <Button
          plain
          className="cancel"
          label={labelCancel}
          onClick={prevDefault(actionClose)}
          {...cancelButtonProps}
        />
        <Button
          autoFocus primary
          className="ok"
          label={labelOk}
          onClick={prevDefault(actionOk)}
          waiting={isSaving}
          data-testid="confirm"
          {...okButtonProps}
        />
      </div>
    </Dialog>
  );
});

export const ConfirmDialog = withInjectables<Dependencies, ConfirmDialogProps>(NonInjectedConfirmDialog, {
  getProps: (di, props) => ({
    params: di.inject(confirmDialogStateInjectable).params,
    closeConfirmDialog: di.inject(closeConfirmDialogInjectable),
    ...props,
  }),
});
