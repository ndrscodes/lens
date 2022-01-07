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

import React from "react";
import { KubeMetaField, KubeObject } from "../../../common/k8s-api/kube-object";
import { DrawerItem, DrawerItemLabels } from "../drawer";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { Link } from "react-router-dom";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { LocaleDate } from "../locale-date";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";

export interface KubeObjectMetaProps {
  object: KubeObject;
  hideFields?: KubeMetaField[];
}

interface Dependencies {
  apiManager: ApiManager;
}

const defaultHiddenFields: KubeMetaField[] = [
  "uid",
  "resourceVersion",
  "selfLink",
];

const NonInjectedKubeObjectMeta = observer(({ apiManager, object, hideFields = defaultHiddenFields }: Dependencies & KubeObjectMetaProps) => {
  const hiddenFields = new Set(hideFields);

  if (!object) {
    return null;
  }

  if (!(object instanceof KubeObject)) {
    logger.error("[KubeObjectMeta]: passed object that is not an instanceof KubeObject", object);

    return null;
  }

  const {
    getNs, getLabels, getResourceVersion, selfLink, getAnnotations,
    getFinalizers, getId, getAge, getName, metadata: { creationTimestamp },
  } = object;
  const ownerRefs = object.getOwnerRefs();

  return (
    <>
      <DrawerItem name="Created" hidden={hiddenFields.has("creationTimestamp")}>
        {getAge(true, false)} ago ({<LocaleDate date={creationTimestamp} />})
      </DrawerItem>
      <DrawerItem name="Name" hidden={hiddenFields.has("name")}>
        {getName()}
        <KubeObjectStatusIcon key="icon" object={object} />
      </DrawerItem>
      <DrawerItem name="Namespace" hidden={hiddenFields.has("namespace") || !getNs()}>
        {getNs()}
      </DrawerItem>
      <DrawerItem name="UID" hidden={hiddenFields.has("uid")}>
        {getId()}
      </DrawerItem>
      <DrawerItem name="Link" hidden={hiddenFields.has("selfLink")}>
        {selfLink}
      </DrawerItem>
      <DrawerItem name="Resource Version" hidden={hiddenFields.has("resourceVersion")}>
        {getResourceVersion()}
      </DrawerItem>
      <DrawerItemLabels
        name="Labels"
        labels={getLabels()}
        hidden={hiddenFields.has("labels")}
      />
      <DrawerItemLabels
        name="Annotations"
        labels={getAnnotations()}
        hidden={hiddenFields.has("annotations")}
      />
      <DrawerItemLabels
        name="Finalizers"
        labels={getFinalizers()}
        hidden={hiddenFields.has("finalizers")}
      />
      {ownerRefs?.length > 0 &&
        <DrawerItem name="Controlled By" hidden={hiddenFields.has("ownerReferences")}>
          {
            ownerRefs.map(ref => {
              const { name, kind } = ref;
              const ownerDetailsUrl = getDetailsUrl(apiManager.lookupApiLink(ref, object));

              return (
                <p key={name}>
                  {kind} <Link to={ownerDetailsUrl}>{name}</Link>
                </p>
              );
            })
          }
        </DrawerItem>
      }
    </>
  );
});

export const KubeObjectMeta = withInjectables<Dependencies, KubeObjectMetaProps>(NonInjectedKubeObjectMeta, {
  getProps: (di, props) => ({
    apiManager: di.inject(apiManagerInjectable),
    ...props,
  }),
});
