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

import { KubeObject } from "../kube-object";
import { KubeApi, SpecificApiOptions } from "../kube-api";

export const resourceQuotaKinds = [
  "limits.cpu",
  "limits.memory",
  "requests.cpu",
  "requests.memory",
  "requests.storage",
  "persistentvolumeclaims",
  "count/pods",
  "count/persistentvolumeclaims",
  "count/services",
  "count/secrets",
  "count/configmaps",
  "count/replicationcontrollers",
  "count/deployments.apps",
  "count/replicasets.apps",
  "count/statefulsets.apps",
  "count/jobs.batch",
  "count/cronjobs.batch",
  "count/deployments.extensions",
] as const;

export type ResourceQuotaKinds = typeof resourceQuotaKinds[number];

export type IResourceQuotaValues = Partial<Record<ResourceQuotaKinds | string, string>>;

export interface ResourceQuota {
  spec: {
    hard: IResourceQuotaValues;
    scopeSelector?: {
      matchExpressions: {
        operator: string;
        scopeName: string;
        values: string[];
      }[];
    };
  };

  status: {
    hard: IResourceQuotaValues;
    used: IResourceQuotaValues;
  };
}

export class ResourceQuota extends KubeObject {
  static kind = "ResourceQuota";
  static namespaced = true;
  static apiBase = "/api/v1/resourcequotas";

  getScopeSelector() {
    const { matchExpressions = [] } = this.spec.scopeSelector || {};

    return matchExpressions;
  }
}

export class ResourceQuotaApi extends KubeApi<ResourceQuota> {
  constructor(args: SpecificApiOptions<ResourceQuota> = {}) {
    super({
      ...args,
      objectConstructor: ResourceQuota,
    });
  }
}
