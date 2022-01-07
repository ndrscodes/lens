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

import "./edit-resource.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import yaml from "js-yaml";
import type { DockTabData } from "../store";
import { InfoPanel } from "../info-panel/info-panel";
import { Badge } from "../../badge";
import { EditorPanel } from "../editor/editor-panel";
import { Spinner } from "../../spinner";
import { createPatch } from "rfc6902";
import type { EditResourceStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import editResourceStoreInjectable from "./store.injectable";

export interface EditResourceProps {
  tab: DockTabData;
}

interface Dependencies {
  editResourceStore: EditResourceStore;
}

const NonInjectedEditResource = observer(({ tab, editResourceStore }: Dependencies & EditResourceProps) => {
  const [error, setError] = useState("");

  if (!editResourceStore.isReady(tab.id)) {
    return <Spinner center />;
  }

  const resource = editResourceStore.getResource(tab.id);
  const draft = (() => {
    const editData = editResourceStore.getData(tab.id);

    if (typeof editData.draft === "string") {
      return editData.draft;
    }

    // dump resource first time and save
    return editData.firstDraft = yaml.dump(resource.toPlainObject());
  })();

  const save = async () => {
    if (error) {
      return null;
    }

    const store = editResourceStore.getStore(tab.id);
    const currentVersion = yaml.load(draft);
    const firstVersion = yaml.load(editResourceStore.getData(tab.id).firstDraft ?? draft);
    const patches = createPatch(firstVersion, currentVersion);
    const updatedResource = await store.patch(resource, patches);

    editResourceStore.clearInitialDraft(tab.id);

    return (
      <p>
        {updatedResource.kind} <b>{updatedResource.getName()}</b> updated.
      </p>
    );
  };

  return (
    <div className="EditResource flex column">
      <InfoPanel
        tabId={tab.id}
        error={error}
        submit={save}
        submitLabel="Save"
        submittingMessage="Applying.."
        controls={(
          <div className="resource-info flex gaps align-center">
            <span>Kind:</span><Badge label={resource.kind} />
            <span>Name:</span><Badge label={resource.getName()} />
            <span>Namespace:</span><Badge label={resource.getNs() || "global"} />
          </div>
        )}
      />
      <EditorPanel
        tabId={tab.id}
        value={draft}
        onChange={draft => {
          setError("");
          editResourceStore.getData(tab.id).draft = draft;
        }}
        onError={error => setError(error.toString())}
      />
    </div>
  );
});

export const EditResource = withInjectables<Dependencies, EditResourceProps>(NonInjectedEditResource, {
  getProps: (di, props) => ({
    editResourceStore: di.inject(editResourceStoreInjectable),
    ...props,
  }),
});
