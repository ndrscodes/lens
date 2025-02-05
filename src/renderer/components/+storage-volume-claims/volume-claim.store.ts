/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { PersistentVolumeClaim } from "../../../common/k8s-api/endpoints";
import { pvcApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

export class VolumeClaimStore extends KubeObjectStore<PersistentVolumeClaim> {
  api = pvcApi;
}

export const volumeClaimStore = new VolumeClaimStore();
apiManager.registerStore(volumeClaimStore);
