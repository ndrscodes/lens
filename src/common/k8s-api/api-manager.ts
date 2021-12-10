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

import type { KubeObjectStore } from "./kube-object.store";

import { action, observable, makeObservable, computed } from "mobx";
import { autoBind, iter } from "../utils";
import type { KubeApi } from "./kube-api";
import type { KubeObject } from "./kube-object";
import { IKubeObjectRef, parseKubeApi, createKubeApiURL } from "./kube-api-parse";

export class ApiManager {
  private apiSet = observable.set<KubeApi<KubeObject>>();
  private stores = observable.map<KubeApi<KubeObject>, KubeObjectStore<KubeObject>>();

  constructor() {
    makeObservable(this);
    autoBind(this);
  }

  @computed private get apis() {
    const res = new Map<string, KubeApi<KubeObject>>();

    for (const api of this.apiSet) {
      if (typeof api.apiBase !== "string" || !api.apiBase) {
        throw new TypeError("KubeApi.apiBase must be a non-empty string");
      }

      if (res.has(api.apiBase)) {
        throw new Error("KubeApi.apiBase must be unique");
      }

      res.set(api.apiBase, api);
    }

    return res;
  }

  hasApi(api: KubeApi<KubeObject>): boolean {
    return this.apiSet.has(api);
  }

  getApi(pathOrCallback: string | ((api: KubeApi<KubeObject>) => boolean)) {
    if (typeof pathOrCallback === "string") {
      return this.apis.get(pathOrCallback) || this.apis.get(parseKubeApi(pathOrCallback).apiBase);
    }

    return iter.find(this.apis.values(), pathOrCallback ?? (() => true));
  }

  getApiByKind(kind: string, apiVersion: string) {
    return iter.find(this.apis.values(), api => api.kind === kind && api.apiVersionWithGroup === apiVersion);
  }

  registerApi(api: KubeApi<KubeObject>): void;
  /**
   * @deprecated Just provide the `api` instance
   */
  registerApi(apiOrBase: string, api: KubeApi<KubeObject>): void
  @action
  registerApi(apiOrBase: string | KubeApi<KubeObject>, api?: KubeApi<KubeObject>): void {
    api = typeof apiOrBase === "string"
      ? api
      : apiOrBase;

    if (this.apiSet.has(api)) {
      throw new Error("Cannot register the same api twice");
    } else {
      this.apiSet.add(api);
    }
  }

  protected resolveApi<K extends KubeObject>(api?: string | KubeApi<K>): KubeApi<K> | undefined {
    if (!api) {
      return undefined;
    }

    if (typeof api === "string") {
      return this.getApi(api) as KubeApi<K>;
    }

    return api;
  }

  /**
   * Removes `api` from the set of registered apis
   * @param api The instance to de-register
   * @returns `true` if the instance was previously registered
   */
  @action
  unregisterApi(api: KubeApi<KubeObject>) {
    return this.apiSet.delete(api);
  }

  @action
  registerStore(store: KubeObjectStore<KubeObject>, apis: KubeApi<KubeObject>[] = [store.api]) {
    for (const api of apis) {
      if (this.stores.has(api)) {
        throw new Error(`Each api instance can only have one store associated with it. Attempt to register a duplicate store for the ${api.apiBase} api`);
      } else {
        this.stores.set(api, store);
      }
    }
  }

  getStore<S extends KubeObjectStore<KubeObject>>(api: string | KubeApi<KubeObject>): S | undefined {
    return this.stores.get(this.resolveApi(api)) as S;
  }

  lookupApiLink(ref: IKubeObjectRef, parentObject?: KubeObject): string {
    const {
      kind, apiVersion, name,
      namespace = parentObject?.getNs(),
    } = ref;

    if (!kind) return "";

    // search in registered apis by 'kind' & 'apiVersion'
    const api = this.getApi(api => api.kind === kind && api.apiVersionWithGroup == apiVersion);

    if (api) {
      return api.getUrl({ namespace, name });
    }

    // lookup api by generated resource link
    const apiPrefixes = ["/apis", "/api"];
    const resource = kind.endsWith("s") ? `${kind.toLowerCase()}es` : `${kind.toLowerCase()}s`;

    for (const apiPrefix of apiPrefixes) {
      const apiLink = createKubeApiURL({ apiPrefix, apiVersion, name, namespace, resource });

      if (this.getApi(apiLink)) {
        return apiLink;
      }
    }

    // resolve by kind only (hpa's might use refs to older versions of resources for example)
    const apiByKind = this.getApi(api => api.kind === kind);

    if (apiByKind) {
      return apiByKind.getUrl({ name, namespace });
    }

    // otherwise generate link with default prefix
    // resource still might exists in k8s, but api is not registered in the app
    return createKubeApiURL({ apiVersion, name, namespace, resource });
  }
}

export const apiManager = new ApiManager();
