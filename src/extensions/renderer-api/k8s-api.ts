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

import apiManagerInjectable from "../../common/k8s-api/api-manager.injectable";
import deploymentApiInjectable from "../../common/k8s-api/endpoints/deployment.api.injectable";
import nodeApiInjectable from "../../common/k8s-api/endpoints/node.api.injectable";
import podApiInjectable from "../../common/k8s-api/endpoints/pod.api.injectable";
import serviceApiInjectable from "../../common/k8s-api/endpoints/service.api.injectable";
import { asLegacyGlobalObjectForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

export { isAllowedResource } from "../../common/utils/allowed-resource";
export { ResourceStack } from "../../common/k8s/resource-stack";
export { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
export { KubeApi, forCluster, forRemoteCluster } from "../../common/k8s-api/kube-api";
export { KubeObject, KubeStatus } from "../../common/k8s-api/kube-object";
export { Pod, PodApi as PodsApi } from "../../common/k8s-api/endpoints";
export { Node, NodeApi as NodesApi } from "../../common/k8s-api/endpoints";
export { Deployment, DeploymentApi } from "../../common/k8s-api/endpoints";
export { DaemonSet, daemonSetApi } from "../../common/k8s-api/endpoints";
export { StatefulSet, statefulSetApi } from "../../common/k8s-api/endpoints";
export { Job, jobApi } from "../../common/k8s-api/endpoints";
export { CronJob, cronJobApi } from "../../common/k8s-api/endpoints";
export { ConfigMap, configMapApi } from "../../common/k8s-api/endpoints";
export { Secret, secretsApi } from "../../common/k8s-api/endpoints";
export { ReplicaSet, replicaSetApi } from "../../common/k8s-api/endpoints";
export { ResourceQuota, resourceQuotaApi } from "../../common/k8s-api/endpoints";
export { LimitRange, limitRangeApi } from "../../common/k8s-api/endpoints";
export { HorizontalPodAutoscaler, hpaApi } from "../../common/k8s-api/endpoints";
export { PodDisruptionBudget, pdbApi } from "../../common/k8s-api/endpoints";
export { Service } from "../../common/k8s-api/endpoints";
export { Endpoint, endpointApi } from "../../common/k8s-api/endpoints";
export { Ingress, ingressApi, IngressApi } from "../../common/k8s-api/endpoints";
export { NetworkPolicy, networkPolicyApi } from "../../common/k8s-api/endpoints";
export { PersistentVolume, persistentVolumeApi } from "../../common/k8s-api/endpoints";
export { PersistentVolumeClaim, pvcApi, PersistentVolumeClaimApi as PersistentVolumeClaimsApi } from "../../common/k8s-api/endpoints";
export { StorageClass, storageClassApi } from "../../common/k8s-api/endpoints";
export { Namespace, namespacesApi } from "../../common/k8s-api/endpoints";
export { KubeEvent, eventApi } from "../../common/k8s-api/endpoints";
export { ServiceAccount, serviceAccountsApi } from "../../common/k8s-api/endpoints";
export { Role, roleApi } from "../../common/k8s-api/endpoints";
export { RoleBinding, roleBindingApi } from "../../common/k8s-api/endpoints";
export { ClusterRole, clusterRoleApi } from "../../common/k8s-api/endpoints";
export { ClusterRoleBinding, clusterRoleBindingApi } from "../../common/k8s-api/endpoints";
export { CustomResourceDefinition, crdApi } from "../../common/k8s-api/endpoints";
export { KubeObjectStatusLevel } from "./kube-object-status";
export { KubeJsonApi } from "../../common/k8s-api/kube-json-api";

// types
export type { ILocalKubeApiConfig, IRemoteKubeApiConfig, IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { IPodContainer, IPodContainerStatus } from "../../common/k8s-api/endpoints";
export type { ISecretRef } from "../../common/k8s-api/endpoints";
export type { KubeObjectStatus } from "./kube-object-status";

// stores
export type { EventStore } from "../../renderer/components/+events/event.store";
export type { PodStore as PodsStore } from "../../renderer/components/+workloads-pods/pod.store";
export type { NodeStore as NodesStore } from "../../renderer/components/+nodes/nodes.store";
export type { DeploymentStore } from "../../renderer/components/+workloads-deployments/deployments.store";
export type { DaemonSetStore } from "../../renderer/components/+workloads-daemonsets/daemonsets.store";
export type { StatefulSetStore } from "../../renderer/components/+workloads-statefulsets/statefulset.store";
export type { JobStore } from "../../renderer/components/+workloads-jobs/job.store";
export type { CronJobStore } from "../../renderer/components/+workloads-cronjobs/cronjob.store";
export type { ConfigMapStore as ConfigMapsStore } from "../../renderer/components/+config-maps/config-maps.store";
export type { SecretStore as SecretsStore } from "../../renderer/components/+config-secrets/secret.store";
export type { ReplicaSetStore } from "../../renderer/components/+workloads-replicasets/replicasets.store";
export type { ResourceQuotaStore as ResourceQuotasStore } from "../../renderer/components/+config-resource-quotas/resource-quotas.store";
export type { LimitRangeStore as LimitRangesStore } from "../../renderer/components/+config-limit-ranges/limit-ranges.store";
export type { HorizontalPodAutoscalerStore as HPAStore } from "../../renderer/components/+config-autoscalers/hpa.store";
export type { PodDisruptionBudgetStore as PodDisruptionBudgetsStore } from "../../renderer/components/+config-pod-disruption-budgets/pod-disruption-budgets.store";
export type { ServiceStore } from "../../renderer/components/+network-services/services.store";
export type { EndpointStore } from "../../renderer/components/+network-endpoints/endpoints.store";
export type { IngressStore } from "../../renderer/components/+network-ingresses/ingress.store";
export type { NetworkPolicyStore } from "../../renderer/components/+network-policies/network-policy.store";
export type { PersistentVolumeStore as PersistentVolumesStore } from "../../renderer/components/+storage-volumes/volumes.store";
export type { PersistentVolumeClaimStore as VolumeClaimStore } from "../../renderer/components/+storage-volume-claims/volume-claim.store";
export type { StorageClassStore } from "../../renderer/components/+storage-classes/storage-class.store";
export type { NamespaceStore } from "../../renderer/components/+namespaces/namespace.store";
export type { ServiceAccountStore as ServiceAccountsStore } from "../../renderer/components/+user-management/+service-accounts/store";
export type { RoleStore as RolesStore } from "../../renderer/components/+user-management/+roles/store";
export type { RoleBindingStore as RoleBindingsStore } from "../../renderer/components/+user-management/+role-bindings/store";
export type { CustomResourceDefinitionStore as CRDStore } from "../../renderer/components/+custom-resources/crd.store";
export type { CRDResourceStore } from "../../renderer/components/+custom-resources/crd-resource.store";

export const apiManager = asLegacyGlobalObjectForExtensionApi(apiManagerInjectable);
export const nodesApi = asLegacyGlobalObjectForExtensionApi(nodeApiInjectable);
export const podsApi = asLegacyGlobalObjectForExtensionApi(podApiInjectable);
export const serviceApi = asLegacyGlobalObjectForExtensionApi(serviceApiInjectable);
export const deploymentApi = asLegacyGlobalObjectForExtensionApi(deploymentApiInjectable);
