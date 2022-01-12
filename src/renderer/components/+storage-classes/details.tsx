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

import "./details.scss";

import React, { useEffect } from "react";
import startCase from "lodash/startCase";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { StorageClass } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import type { StorageClassStore } from "./store";
import { PersistentVolumeDetailsList } from "../+persistent-volumes/details-list";
import type { PersistentVolumeStore } from "../+persistent-volumes/store";
import logger from "../../../common/logger";
import { kubeWatchApi } from "../../../common/k8s-api/kube-watch-api";
import { withInjectables } from "@ogre-tools/injectable-react";
import storageClassStoreInjectable from "./store.injectable";
import persistentVolumeStoreInjectable from "../+persistent-volumes/store.injectable";

export interface StorageClassDetailsProps extends KubeObjectDetailsProps<StorageClass> {
}

interface Dependencies {
  storageClassStore: StorageClassStore;
  persistentVolumeStore: PersistentVolumeStore;
}

const NonInjectedStorageClassDetails = observer(({ storageClassStore, persistentVolumeStore, object: storageClass }: Dependencies & StorageClassDetailsProps) => {
  useEffect(() => (
    kubeWatchApi.subscribeStores([
      persistentVolumeStore,
    ])
  ), []);

  if (!storageClass) {
    return null;
  }

  if (!(storageClass instanceof StorageClass)) {
    logger.error("[StorageClassDetails]: passed object that is not an instanceof StorageClass", storageClass);

    return null;
  }

  const persistentVolumes = storageClassStore.getPersistentVolumes(storageClass);
  const { provisioner, parameters, mountOptions } = storageClass;

  return (
    <div className="StorageClassDetails">
      <KubeObjectMeta object={storageClass}/>

      {provisioner && (
        <DrawerItem name="Provisioner" labelsOnly>
          <Badge label={provisioner}/>
        </DrawerItem>
      )}
      <DrawerItem name="Volume Binding Mode">
        {storageClass.getVolumeBindingMode()}
      </DrawerItem>
      <DrawerItem name="Reclaim Policy">
        {storageClass.getReclaimPolicy()}
      </DrawerItem>

      {mountOptions && (
        <DrawerItem name="Mount Options">
          {mountOptions.join(", ")}
        </DrawerItem>
      )}
      {parameters && (
        <>
          <DrawerTitle title="Parameters"/>
          {
            Object.entries(parameters).map(([name, value]) => (
              <DrawerItem key={name + value} name={startCase(name)}>
                {value}
              </DrawerItem>
            ))
          }
        </>
      )}
      <PersistentVolumeDetailsList
        persistentVolumes={persistentVolumes}
        isLoaded={persistentVolumeStore.isLoaded}
      />
    </div>
  );
});

export const StorageClassDetails = withInjectables<Dependencies, StorageClassDetailsProps>(NonInjectedStorageClassDetails, {
  getProps: (di, props) => ({
    storageClassStore: di.inject(storageClassStoreInjectable),
    persistentVolumeStore: di.inject(persistentVolumeStoreInjectable),
    ...props,
  }),
});

