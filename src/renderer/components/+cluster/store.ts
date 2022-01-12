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

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { Cluster, ClusterApi, IClusterMetrics } from "../../../common/k8s-api/endpoints";
import { autoBind } from "../../utils";
import type { IMetricsReqParams } from "../../../common/k8s-api/endpoints/metrics.api";
import { MetricNodeRole, MetricType } from "./overview.state";

export class ClusterStore extends KubeObjectStore<Cluster> {
  /**
   * @deprecated no longer used
   */
  metrics: Partial<IClusterMetrics> = {};

  /**
   * @deprecated no longer used
   */
  metricsLoaded = false;

  /**
   * @deprecated no longer used
   */
  metricType = MetricType.CPU;

  /**
   * @deprecated no longer used
   */
  metricNodeRole = MetricNodeRole.MASTER;

  constructor(public api: ClusterApi) {
    super();
    autoBind(this);
  }

  /**
   * @deprecated no longer used
   */
  async loadMetrics(params?: IMetricsReqParams) {
    void params;
  }

  /**
   * @deprecated no longer used
   */
  getMetricsValues(source: Partial<IClusterMetrics>): [number, string][] {
    void source;

    return [];
  }

  /**
   * @deprecated no longer used
   */
  resetMetrics() {
    return;
  }
}
