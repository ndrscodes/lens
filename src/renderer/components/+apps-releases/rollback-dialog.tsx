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

import "./rollback-dialog.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { getReleaseHistory, HelmRelease, IReleaseRevision } from "../../../common/k8s-api/endpoints/helm-release.api";
import type { ReleaseStore } from "./store";
import { Select, SelectOption } from "../select";
import { Notifications } from "../notifications";
import orderBy from "lodash/orderBy";
import { withInjectables } from "@ogre-tools/injectable-react";
import helmReleaseRollbackDialogStateInjectable from "./rollback-dialog.state.injectable";
import closeHelmReleaseScaleDialogInjectable from "./rollback-dialog-close.injectable";
import releaseStoreInjectable from "./store.injectable";

export interface ReleaseRollbackDialogProps extends DialogProps {
}

interface Dependencies {
  helmRelease: HelmRelease | null;
  closeReleaseRollbackDialog: () => void;
  releaseStore: ReleaseStore;
}

const NonInjectedReleaseRollbackDialog = observer(({ helmRelease, closeReleaseRollbackDialog, releaseStore, className, ...dialogProps }: Dependencies & ReleaseRollbackDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [revision, setRevision] = useState<IReleaseRevision | undefined>(undefined);
  const [revisions, setRevisions] = useState<IReleaseRevision[]>([]);
  const isOpen = Boolean(helmRelease);

  const onOpen = async () => {
    setIsLoading(true);

    const revisions = orderBy(await getReleaseHistory(helmRelease.getName(), helmRelease.getNs()), "revision", "desc");

    setRevisions(revisions);
    setRevision(revisions[0]);
    setIsLoading(false);
  };
  const rollback = async () => {
    try {
      await releaseStore.rollback(helmRelease.getName(), helmRelease.getNs(), helmRelease.getRevision());
      closeReleaseRollbackDialog();
    } catch (err) {
      Notifications.error(err);
    }
  };
  const renderContent = () => {
    if (!revision) {
      return <p>No revisions to rollback.</p>;
    }

    return (
      <div className="flex gaps align-center">
        <b>Revision</b>
        <Select
          themeName="light"
          value={revision}
          options={revisions}
          formatOptionLabel={({ value }: SelectOption<IReleaseRevision>) => `${value.revision} - ${value.chart} - ${value.app_version}, updated: ${new Date(value.updated).toLocaleString()}`}
          onChange={({ value }: SelectOption<IReleaseRevision>) => setRevision(value)}
        />
      </div>
    );
  };

  return (
    <Dialog
      {...dialogProps}
      className="ReleaseRollbackDialog"
      isOpen={isOpen}
      onOpen={onOpen}
      close={closeReleaseRollbackDialog}
    >
      <Wizard header={<h5>Rollback <b>{helmRelease?.getName()}</b></h5>} done={closeReleaseRollbackDialog}>
        <WizardStep
          scrollable={false}
          nextLabel="Rollback"
          next={rollback}
          loading={isLoading}
        >
          {renderContent()}
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const ReleaseRollbackDialog = withInjectables<Dependencies, ReleaseRollbackDialogProps>(NonInjectedReleaseRollbackDialog, {
  getProps: (di, props) => ({
    helmRelease: di.inject(helmReleaseRollbackDialogStateInjectable).helmRelease,
    closeReleaseRollbackDialog: di.inject(closeHelmReleaseScaleDialogInjectable),
    releaseStore: di.inject(releaseStoreInjectable),
    ...props,
  }),
});
