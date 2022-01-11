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


export { isAllowedResource } from "../../common/utils/allowed-resource";
export { ResourceStack } from "../../common/k8s/resource-stack";
export { KubeApi, forCluster, forRemoteCluster } from "../../common/k8s-api/kube-api";
export { KubeObject, KubeStatus } from "../../common/k8s-api/kube-object";
export { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
export { Pod, PodApi as PodsApi } from "../../common/k8s-api/endpoints/pods.api";
export { Node, NodeApi as NodesApi } from "../../common/k8s-api/endpoints/node.api";
export { Deployment, DeploymentApi } from "../../common/k8s-api/endpoints/deployment.api";
export { DaemonSet } from "../../common/k8s-api/endpoints/daemon-set.api";
export { StatefulSet } from "../../common/k8s-api/endpoints/stateful-set.api";
export { Job } from "../../common/k8s-api/endpoints/job.api";
export { CronJob } from "../../common/k8s-api/endpoints/cron-job.api";
export { ConfigMap } from "../../common/k8s-api/endpoints/configmap.api";
export { Secret } from "../../common/k8s-api/endpoints/secret.api";
export { ReplicaSet } from "../../common/k8s-api/endpoints/replica-set.api";
export { ResourceQuota } from "../../common/k8s-api/endpoints/resource-quota.api";
export { LimitRange } from "../../common/k8s-api/endpoints/limit-range.api";
export { HorizontalPodAutoscaler } from "../../common/k8s-api/endpoints/horizonal-pod-autoscaler.api";
export { PodDisruptionBudget } from "../../common/k8s-api/endpoints/poddisruptionbudget.api";
export { Service } from "../../common/k8s-api/endpoints/service.api";
export { Endpoint } from "../../common/k8s-api/endpoints/endpoint.api";
export { Ingress, IngressApi } from "../../common/k8s-api/endpoints/ingress.api";
export { NetworkPolicy } from "../../common/k8s-api/endpoints/network-policy.api";
export { PersistentVolume } from "../../common/k8s-api/endpoints/persistent-volume.api";
export { PersistentVolumeClaim, PersistentVolumeClaimApi as PersistentVolumeClaimsApi } from "../../common/k8s-api/endpoints/persistent-volume-claims.api";
export { StorageClass } from "../../common/k8s-api/endpoints/storage-class.api";
export { Namespace } from "../../common/k8s-api/endpoints/namespaces.api";
export { KubeEvent } from "../../common/k8s-api/endpoints/events.api";
export { ServiceAccount } from "../../common/k8s-api/endpoints/service-account.api";
export { Role } from "../../common/k8s-api/endpoints/role.api";
export { RoleBinding } from "../../common/k8s-api/endpoints/role-binding.api";
export { ClusterRole } from "../../common/k8s-api/endpoints/cluster-role.api";
export { ClusterRoleBinding } from "../../common/k8s-api/endpoints/cluster-role-binding.api";
export { CustomResourceDefinition } from "../../common/k8s-api/endpoints/crd.api";

// types
export type { ILocalKubeApiConfig, IRemoteKubeApiConfig, IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { IPodContainer, IPodContainerStatus } from "../../common/k8s-api/endpoints/pods.api";
export type { ISecretRef } from "../../common/k8s-api/endpoints/secret.api";
