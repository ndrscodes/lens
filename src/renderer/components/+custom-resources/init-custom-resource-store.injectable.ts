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

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { CustomResourceDefinition } from "../../../common/k8s-api/endpoints";
import { KubeApi } from "../../../common/k8s-api/kube-api";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { bind } from "../../utils";

interface Dependencies {
  apiManager: ApiManager;
}

function initCrdStore({ apiManager }: Dependencies, crd: CustomResourceDefinition) {
  const objectConstructor = class extends KubeObject {
    static readonly kind = crd.getResourceKind();
    static readonly namespaced = crd.isNamespaced();
    static readonly apiBase = crd.getResourceApiBase();
  };

  const api = apiManager.getApi(objectConstructor.apiBase)
    ?? new KubeApi({ objectConstructor });

  if (!apiManager.hasApi(api)) {
    apiManager.registerApi(api);
  }

  if (!apiManager.getStore(api)) {
    apiManager.registerStore(new class extends KubeObjectStore<KubeObject> {
      api = api;
    });
  }
}

const initCustomResourceStoreInjectable = getInjectable({
  instantiate: (di) => bind(initCrdStore, null, {
    apiManager: di.inject(apiManagerInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default initCustomResourceStoreInjectable;
