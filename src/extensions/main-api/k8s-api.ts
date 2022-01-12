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
export {
  Pod, PodApi as PodsApi,
  Node, NodeApi as NodesApi,
  Deployment, DeploymentApi,
  DaemonSet, DaemonSetApi,
  StatefulSet, StatefulSetApi,
  Job, JobApi,
  CronJob, CronJobApi,
  ConfigMap, ConfigMapApi,
  Secret, SecretApi,
  ReplicaSet, ReplicaSetApi,
  ResourceQuota, ResourceQuotaApi,
  LimitRange, LimitRangeApi,
  HorizontalPodAutoscaler, HorizontalPodAutoscalerApi,
  PodDisruptionBudget, PodDisruptionBudgetApi,
  Service, ServiceApi,
  Endpoint, EndpointApi,
  Ingress, IngressApi,
  NetworkPolicy, NetworkPolicyApi,
  PersistentVolume, PersistentVolumeApi,
  PersistentVolumeClaim, PersistentVolumeClaimApi as PersistentVolumeClaimsApi,
  StorageClass, StorageClassApi,
  Namespace, NamespaceApi,
  Event as KubeEvent, EventApi,
  ServiceAccount, ServiceAccountApi,
  Role, RoleApi,
  RoleBinding, RoleBindingApi,
  ClusterRole, ClusterRoleApi,
  ClusterRoleBinding, ClusterRoleBindingApi,
  CustomResourceDefinition, CustomResourceDefinitionApi,
} from "../../common/k8s-api/endpoints";

// types
export type { ILocalKubeApiConfig, IRemoteKubeApiConfig, IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { IPodContainer, IPodContainerStatus } from "../../common/k8s-api/endpoints/pods.api";
export type { ISecretRef } from "../../common/k8s-api/endpoints/secret.api";
