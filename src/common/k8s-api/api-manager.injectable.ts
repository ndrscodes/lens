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
import { ClusterStore } from "../../renderer/components/+cluster/cluster-overview.store";
import { HorizontalPodAutoscalerStore } from "../../renderer/components/+config-autoscalers/hpa.store";
import { LimitRangeStore } from "../../renderer/components/+config-limit-ranges/limit-ranges.store";
import { ConfigMapStore } from "../../renderer/components/+config-maps/config-maps.store";
import { PodDisruptionBudgetStore } from "../../renderer/components/+config-pod-disruption-budgets/pod-disruption-budgets.store";
import { ResourceQuotaStore } from "../../renderer/components/+config-resource-quotas/resource-quotas.store";
import { SecretStore } from "../../renderer/components/+config-secrets/secret.store";
import { CustomResourceDefinitionStore } from "../../renderer/components/+custom-resources/crd.store";
import { EventStore } from "../../renderer/components/+events/event.store";
import { NamespaceStore } from "../../renderer/components/+namespaces/namespace.store";
import { EndpointStore } from "../../renderer/components/+network-endpoints/endpoints.store";
import { IngressStore } from "../../renderer/components/+network-ingresses/ingress.store";
import { NetworkPolicyStore } from "../../renderer/components/+network-policies/network-policy.store";
import { ServiceStore } from "../../renderer/components/+network-services/services.store";
import { NodeStore } from "../../renderer/components/+nodes/nodes.store";
import { PodSecurityPolicyStore } from "../../renderer/components/+pod-security-policies/pod-security-policies.store";
import { StorageClassStore } from "../../renderer/components/+storage-classes/storage-class.store";
import { PersistentVolumeClaimStore } from "../../renderer/components/+storage-volume-claims/volume-claim.store";
import { PersistentVolumeStore } from "../../renderer/components/+storage-volumes/volumes.store";
import { ClusterRoleBindingStore } from "../../renderer/components/+user-management/+cluster-role-bindings/store";
import { ClusterRoleStore } from "../../renderer/components/+user-management/+cluster-roles/store";
import { RoleBindingStore } from "../../renderer/components/+user-management/+role-bindings/store";
import { RoleStore } from "../../renderer/components/+user-management/+roles/store";
import { ServiceAccountStore } from "../../renderer/components/+user-management/+service-accounts/store";
import { CronJobStore } from "../../renderer/components/+workloads-cronjobs/cronjob.store";
import { DaemonSetStore } from "../../renderer/components/+workloads-daemonsets/daemonsets.store";
import { DeploymentStore } from "../../renderer/components/+workloads-deployments/deployments.store";
import { JobStore } from "../../renderer/components/+workloads-jobs/job.store";
import { PodStore } from "../../renderer/components/+workloads-pods/pod.store";
import { ReplicaSetStore } from "../../renderer/components/+workloads-replicasets/replicasets.store";
import { StatefulSetStore } from "../../renderer/components/+workloads-statefulsets/statefulset.store";
import { isClusterPageContext } from "../utils";
import { ApiManager } from "./api-manager";
import { ClusterApi, ClusterRoleApi, ClusterRoleBindingApi, ConfigMapApi, CronJobApi, CustomResourceDefinition, CustomResourceDefinitionApi, DaemonSetApi, DeploymentApi, EndpointApi, EventApi, HorizontalPodAutoscalerApi, IngressApi, JobApi, LimitRangeApi, NamespaceApi, NetworkPolicyApi, NodeApi, PersistentVolumeApi, PersistentVolumeClaimApi, PodApi, PodDisruptionBudgetApi, PodMetricsApi, PodSecurityPolicyApi, ReplicaSetApi, ResourceQuotaApi, RoleApi, RoleBindingApi, SecretApi, SelfSubjectRulesReviewApi, ServiceAccountApi, ServiceApi, StatefulSetApi, StorageClassApi } from "./endpoints";
import { KubeApi } from "./kube-api";
import { KubeObject } from "./kube-object";
import { KubeObjectStore } from "./kube-object.store";

function createAndInit(): ApiManager {
  const apiManager = new ApiManager();

  if (!isClusterPageContext()) {
    /**
     * Don't try and register anything for non-cluster frames
     *
     * TODO: make ApiManager handle this sort of thing
     */
    return apiManager;
  }

  const constructorPairs = [
    [ClusterApi, ClusterStore],
    [ClusterRoleApi, ClusterRoleStore],
    [ClusterRoleBindingApi, ClusterRoleBindingStore],
    [ConfigMapApi, ConfigMapStore],
    [CronJobApi, CronJobStore],
    [DaemonSetApi, DaemonSetStore],
    [DeploymentApi, DeploymentStore],
    [EndpointApi, EndpointStore],
    [EventApi, EventStore],
    [HorizontalPodAutoscalerApi, HorizontalPodAutoscalerStore],
    [IngressApi, IngressStore],
    [JobApi, JobStore],
    [LimitRangeApi, LimitRangeStore],
    [NamespaceApi, NamespaceStore],
    [NetworkPolicyApi, NetworkPolicyStore],
    [NodeApi, NodeStore],
    [PersistentVolumeApi, PersistentVolumeStore],
    [PersistentVolumeClaimApi, PersistentVolumeClaimStore],
    [PodApi, PodStore],
    [PodDisruptionBudgetApi, PodDisruptionBudgetStore],
    [PodSecurityPolicyApi, PodSecurityPolicyStore],
    [ReplicaSetApi, ReplicaSetStore],
    [ResourceQuotaApi, ResourceQuotaStore],
    [RoleApi, RoleStore],
    [RoleBindingApi, RoleBindingStore],
    [SecretApi, SecretStore],
    [ServiceAccountApi, ServiceAccountStore],
    [ServiceApi, ServiceStore],
    [StatefulSetApi, StatefulSetStore],
    [StorageClassApi, StorageClassStore],
  ] as const;

  for (const [apiConstructor, storeConstructor] of constructorPairs) {
    const api = new apiConstructor();

    apiManager.registerApi(api);
    apiManager.registerStore(new storeConstructor(api as any));
  }

  // CustomResourceDefinitions have to be handled seperately because of a different dep
  const customResourceDefinitionApi = new CustomResourceDefinitionApi();

  apiManager.registerApi(customResourceDefinitionApi);
  apiManager.registerStore(new CustomResourceDefinitionStore(customResourceDefinitionApi, {
    initCustomResourceStore(crd: CustomResourceDefinition) {
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
    },
  }));

  // There is no store for these apis, so just register them
  apiManager.registerApi(new PodMetricsApi());
  apiManager.registerApi(new SelfSubjectRulesReviewApi());

  return apiManager;
}

const apiManagerInjectable = getInjectable({
  instantiate: createAndInit,
  lifecycle: lifecycleEnum.singleton,
});

export default apiManagerInjectable;
