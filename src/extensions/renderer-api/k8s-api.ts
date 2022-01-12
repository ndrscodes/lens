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

// import apiManagerInjectable from "../../common/k8s-api/api-manager.injectable";
// import configMapApiInjectable from "../../common/k8s-api/endpoints/configmap.api.injectable";
// import cronJobApiInjectable from "../../common/k8s-api/endpoints/cron-job.api.injectable";
// import daemonSetApiInjectable from "../../common/k8s-api/endpoints/daemon-set.api.injectable";
// import deploymentApiInjectable from "../../common/k8s-api/endpoints/deployment.api.injectable";
// import horizontalPodAutoscalerApiInjectable from "../../common/k8s-api/endpoints/horizontal-pod-autoscaler.api.injectable";
// import jobApiInjectable from "../../common/k8s-api/endpoints/job.api.injectable";
// import limitRangeApiInjectable from "../../common/k8s-api/endpoints/limit-range.api.injectable";
// import nodeApiInjectable from "../../common/k8s-api/endpoints/node.api.injectable";
// import persistentVolumeClaimApiInjectable from "../../common/k8s-api/endpoints/persistent-volume-claim.api.injectable";
// import persistentVolumeApiInjectable from "../../common/k8s-api/endpoints/persistent-volume.api.injectable";
// import podApiInjectable from "../../common/k8s-api/endpoints/pod.api.injectable";
// import replicaSetApiInjectable from "../../common/k8s-api/endpoints/replica-set.api.injectable";
// import resourceQuotaApiInjectable from "../../common/k8s-api/endpoints/resource-quota.api.injectable";
// import secretApiInjectable from "../../common/k8s-api/endpoints/secret.api.injectable";
// import serviceApiInjectable from "../../common/k8s-api/endpoints/service.api.injectable";
// import statefulSetApiInjectable from "../../common/k8s-api/endpoints/stateful-set.api.injectable";
// import horizontalPodAutoscalerStoreInjectable from "../../renderer/components/+config-autoscalers/store.injectable";
// import limitRangeStoreInjectable from "../../renderer/components/+config-limit-ranges/store.injectable";
// import resourceQuotaStoreInjectable from "../../renderer/components/+config-resource-quotas/store.injectable";
// import secretStoreInjectable from "../../renderer/components/+config-secrets/store.injectable";
// import eventStoreInjectable from "../../renderer/components/+events/event.store.injectable";
// import namespaceStoreInjectable from "../../renderer/components/+namespaces/store.injectable";
// import serviceAccountStoreInjectable from "../../renderer/components/+user-management/+service-accounts/store.injectable";
// import cronJobStoreInjectable from "../../renderer/components/+workloads-cronjobs/cronjob.store.injectable";
// import jobStoreInjectable from "../../renderer/components/+workloads-jobs/job.store.injectable";
// import replicaSetStoreInjectable from "../../renderer/components/+workloads-replica-sets/store.injectable";
// import { asLegacyGlobalObjectForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

export { isAllowedResource } from "../../common/utils/allowed-resource";
export { ResourceStack } from "../../common/k8s/resource-stack";
export { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
export { KubeApi, forCluster, forRemoteCluster } from "../../common/k8s-api/kube-api";
export { KubeObject, KubeStatus } from "../../common/k8s-api/kube-object";
export { Pod, PodApi, PodApi as PodsApi } from "../../common/k8s-api/endpoints";
export { Node, NodeApi, NodeApi as NodesApi } from "../../common/k8s-api/endpoints";
export { Deployment, DeploymentApi } from "../../common/k8s-api/endpoints";
export { DaemonSet, DaemonSetApi } from "../../common/k8s-api/endpoints";
export { StatefulSet, StatefulSetApi } from "../../common/k8s-api/endpoints";
export { Job, JobApi } from "../../common/k8s-api/endpoints";
export { CronJob, CronJobApi } from "../../common/k8s-api/endpoints";
export { ConfigMap, ConfigMapApi } from "../../common/k8s-api/endpoints";
export { Secret, SecretApi } from "../../common/k8s-api/endpoints";
export { ReplicaSet, ReplicaSetApi } from "../../common/k8s-api/endpoints";
export { ResourceQuota, ResourceQuotaApi } from "../../common/k8s-api/endpoints";
export { LimitRange, LimitRangeApi } from "../../common/k8s-api/endpoints";
export { HorizontalPodAutoscaler, HorizontalPodAutoscalerApi } from "../../common/k8s-api/endpoints";
export { PodDisruptionBudget, PodDisruptionBudgetApi } from "../../common/k8s-api/endpoints";
export { Service, ServiceApi } from "../../common/k8s-api/endpoints";
export { Endpoint, EndpointApi } from "../../common/k8s-api/endpoints";
export { Ingress, IngressApi } from "../../common/k8s-api/endpoints";
export { NetworkPolicy, NetworkPolicyApi } from "../../common/k8s-api/endpoints";
export { PersistentVolume, PersistentVolumeApi } from "../../common/k8s-api/endpoints";
export { PersistentVolumeClaim, PersistentVolumeClaimApi as PersistentVolumeClaimsApi } from "../../common/k8s-api/endpoints";
export { StorageClass, StorageClassApi } from "../../common/k8s-api/endpoints";
export { Namespace, NamespaceApi } from "../../common/k8s-api/endpoints";
export { KubeEvent, EventApi } from "../../common/k8s-api/endpoints";
export { ServiceAccount, ServiceAccountApi } from "../../common/k8s-api/endpoints";
export { Role, RoleApi } from "../../common/k8s-api/endpoints";
export { RoleBinding, RoleBindingApi } from "../../common/k8s-api/endpoints";
export { ClusterRole, ClusterRoleApi } from "../../common/k8s-api/endpoints";
export { ClusterRoleBinding, ClusterRoleBindingApi } from "../../common/k8s-api/endpoints";
export { CustomResourceDefinition, CustomResourceDefinitionApi } from "../../common/k8s-api/endpoints";
export { KubeObjectStatusLevel } from "./kube-object-status";
export { KubeJsonApi } from "../../common/k8s-api/kube-json-api";

// types
export type { ILocalKubeApiConfig, IRemoteKubeApiConfig, IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { IPodContainer, IPodContainerStatus } from "../../common/k8s-api/endpoints";
export type { ISecretRef } from "../../common/k8s-api/endpoints";
export type { KubeObjectStatus } from "./kube-object-status";

// stores
export type { EventStore } from "../../renderer/components/+events/store";
export type { PodStore as PodsStore } from "../../renderer/components/+workloads-pods/store";
export type { NodeStore as NodesStore } from "../../renderer/components/+nodes/store";
export type { DeploymentStore } from "../../renderer/components/+workloads-deployments/store";
export type { DaemonSetStore } from "../../renderer/components/+workloads-daemonsets/store";
export type { StatefulSetStore } from "../../renderer/components/+workloads-statefulsets/store";
export type { JobStore } from "../../renderer/components/+workloads-jobs/store";
export type { CronJobStore } from "../../renderer/components/+workloads-cronjobs/cronjob.store";
export type { ConfigMapStore as ConfigMapsStore } from "../../renderer/components/+config-maps/store";
export type { SecretStore as SecretsStore } from "../../renderer/components/+config-secrets/store";
export type { ReplicaSetStore } from "../../renderer/components/+workloads-replica-sets/store";
export type { ResourceQuotaStore as ResourceQuotasStore } from "../../renderer/components/+config-resource-quotas/store";
export type { LimitRangeStore as LimitRangesStore } from "../../renderer/components/+config-limit-ranges/store";
export type { HorizontalPodAutoscalerStore as HPAStore } from "../../renderer/components/+config-autoscalers/store";
export type { PodDisruptionBudgetStore as PodDisruptionBudgetsStore } from "../../renderer/components/+config-pod-disruption-budgets/store";
export type { ServiceStore } from "../../renderer/components/+services/services.store";
export type { EndpointStore } from "../../renderer/components/+endpoints/store";
export type { IngressStore } from "../../renderer/components/+ingresses/store";
export type { NetworkPolicyStore } from "../../renderer/components/+network-policies/store";
export type { PersistentVolumeStore as PersistentVolumesStore } from "../../renderer/components/+persistent-volumes/store";
export type { PersistentVolumeClaimStore as VolumeClaimStore } from "../../renderer/components/+persistent-volume-claims/store";
export type { StorageClassStore } from "../../renderer/components/+storage-classes/store";
export type { NamespaceStore } from "../../renderer/components/+namespaces/store";
export type { ServiceAccountStore as ServiceAccountsStore } from "../../renderer/components/+user-management/+service-accounts/store";
export type { RoleStore as RolesStore } from "../../renderer/components/+user-management/+roles/store";
export type { RoleBindingStore as RoleBindingsStore } from "../../renderer/components/+user-management/+role-bindings/store";
export type { CustomResourceDefinitionStore as CRDStore } from "../../renderer/components/+custom-resource-definitions/store";
export type { CRDResourceStore } from "../../renderer/components/+custom-resource-definitions/resource.store";

// export const apiManager = asLegacyGlobalObjectForExtensionApi(apiManagerInjectable);
// export const nodesApi = asLegacyGlobalObjectForExtensionApi(nodeApiInjectable);
// export const podsApi = asLegacyGlobalObjectForExtensionApi(podApiInjectable);
// export const serviceApi = asLegacyGlobalObjectForExtensionApi(serviceApiInjectable);
// export const deploymentApi = asLegacyGlobalObjectForExtensionApi(deploymentApiInjectable);
// export const daemonSetApi = asLegacyGlobalObjectForExtensionApi(daemonSetApiInjectable);
// export const statefulSetApi = asLegacyGlobalObjectForExtensionApi(statefulSetApiInjectable);
// export const jobApi = asLegacyGlobalObjectForExtensionApi(jobApiInjectable);
// export const cronJobApi = asLegacyGlobalObjectForExtensionApi(cronJobApiInjectable);
// export const configMapApi = asLegacyGlobalObjectForExtensionApi(configMapApiInjectable);
// export const pvcApi = asLegacyGlobalObjectForExtensionApi(persistentVolumeClaimApiInjectable);
// export const persistentVolumeApi = asLegacyGlobalObjectForExtensionApi(persistentVolumeApiInjectable);
// export const secretApi = asLegacyGlobalObjectForExtensionApi(secretApiInjectable);
// export const replicaSetApi = asLegacyGlobalObjectForExtensionApi(replicaSetApiInjectable);
// export const resourceQuotaApi = asLegacyGlobalObjectForExtensionApi(resourceQuotaApiInjectable);
// export const limitRangeApi = asLegacyGlobalObjectForExtensionApi(limitRangeApiInjectable);
// export const hpaApi = asLegacyGlobalObjectForExtensionApi(horizontalPodAutoscalerApiInjectable);
// export const pdbApi
// endpointApi
// ingressApi
// networkPolicyApi
// storageClassApi
// namespacesApi
// eventApi
// serviceAccountsApi
// roleApi
// roleBindingApi
// clusterRoleApi
// clusterRoleBindingApi
// crdApi

// export const eventStore = asLegacyGlobalObjectForExtensionApi(eventStoreInjectable);
// export const cronJobStore = asLegacyGlobalObjectForExtensionApi(cronJobStoreInjectable);
// export const jobStore = asLegacyGlobalObjectForExtensionApi(jobStoreInjectable);
// export const secretStore = asLegacyGlobalObjectForExtensionApi(secretStoreInjectable);
// export const replicaSetStore = asLegacyGlobalObjectForExtensionApi(replicaSetStoreInjectable);
// export const resourceQuotaStore = asLegacyGlobalObjectForExtensionApi(resourceQuotaStoreInjectable);
// export const limitRangeStore = asLegacyGlobalObjectForExtensionApi(limitRangeStoreInjectable);
// export const horizontalPodAutoscalerStore = asLegacyGlobalObjectForExtensionApi(horizontalPodAutoscalerStoreInjectable);
// export const serviceAccountStore = asLegacyGlobalObjectForExtensionApi(serviceAccountStoreInjectable);
// export const namespaceStore = asLegacyGlobalObjectForExtensionApi(namespaceStoreInjectable);
