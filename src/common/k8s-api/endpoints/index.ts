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

// Kubernetes apis
// Docs: https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.10/

export * from "./cluster-role-binding.api";
export * from "./cluster-role.api";
export * from "./cluster.api";
export * from "./configmap.api";
export * from "./cron-job.api";
export * from "./custom-resource-definition.api";
export * from "./daemon-set.api";
export * from "./deployment.api";
export * from "./endpoint.api";
export * from "./event.api";
export * from "./helm-release.api";
export * from "./helm-chart.api";
export * from "./horizontal-pod-autoscaler.api";
export * from "./ingress.api";
export * from "./job.api";
export * from "./limit-range.api";
export * from "./namespace.api";
export * from "./network-policy.api";
export * from "./node.api";
export * from "./persistent-volume-claims.api";
export * from "./persistent-volume.api";
export * from "./pod-disruption-budget.api";
export * from "./pod-metrics.api";
export * from "./pod-security-policy.api";
export * from "./pods.api";
export * from "./replica-set.api";
export * from "./resource-quota.api";
export * from "./role-binding.api";
export * from "./role.api";
export * from "./secret.api";
export * from "./self-subject-rules-review.api";
export * from "./service-account.api";
export * from "./service.api";
export * from "./stateful-set.api";
export * from "./storage-class.api";
