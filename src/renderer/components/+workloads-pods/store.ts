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

import countBy from "lodash/countBy";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";
import type { Pod, PodApi } from "../../../common/k8s-api/endpoints";
import type { WorkloadKubeObject } from "../../../common/k8s-api/workload-kube-object";

export class PodStore extends KubeObjectStore<Pod> {
  constructor(public api: PodApi) {
    super();
    autoBind(this);
  }

  /**
   * @deprecated This function has been removed and returns nothing
   */
  async loadKubeMetrics(namespace?: string) {
    void namespace;
    console.warn("loadKubeMetrics has been removed and does nothing");
  }

  getPodsByOwner(workload: WorkloadKubeObject): Pod[] {
    if (!workload) return [];

    return this.items.filter(pod => {
      const owners = pod.getOwnerRefs();

      return owners.find(owner => owner.uid === workload.getId());
    });
  }

  getPodsByOwnerId(workloadId: string): Pod[] {
    return this.items.filter(pod => {
      return pod.getOwnerRefs().find(owner => owner.uid === workloadId);
    });
  }

  getPodsByNode(node: string) {
    if (!this.isLoaded) return [];

    return this.items.filter(pod => pod.spec.nodeName === node);
  }

  getStatuses(pods: Pod[]) {
    return countBy(pods.map(pod => pod.getStatus()).sort().reverse());
  }

  /**
   * @deprecated This function has been removed and returns nothing
   */
  getPodKubeMetrics(pod: Pod) {
    void pod;
    console.warn("getPodKubeMetrics has been removed and does nothing");

    return { cpu: 0, memory: 0 };
  }
}
