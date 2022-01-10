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
import type { ApiManager } from "../common/k8s-api/api-manager";
import apiManagerInjectable from "../common/k8s-api/api-manager.injectable";
import type { CRDStore } from "./components/+custom-resources/crd.store";
import crdStoreInjectable from "./components/+custom-resources/crd.store.injectable";
import { bind, isClusterPageContext } from "./utils";
import { clusterOverviewStore } from "../renderer/components/+cluster/cluster-overview.store";
import { hpaStore } from "../renderer/components/+config-autoscalers/hpa.store";
import { limitRangeStore } from "../renderer/components/+config-limit-ranges/limit-ranges.store";
import { configMapsStore } from "../renderer/components/+config-maps/config-maps.store";
import { podDisruptionBudgetsStore } from "../renderer/components/+config-pod-disruption-budgets/pod-disruption-budgets.store";
import { resourceQuotaStore } from "../renderer/components/+config-resource-quotas/resource-quotas.store";
import { secretsStore } from "../renderer/components/+config-secrets/secrets.store";
import { eventStore } from "../renderer/components/+events/event.store";
import { namespaceStore } from "../renderer/components/+namespaces/namespace.store";
import { endpointStore } from "../renderer/components/+network-endpoints/endpoints.store";
import { ingressStore } from "../renderer/components/+network-ingresses/ingress.store";
import { networkPolicyStore } from "../renderer/components/+network-policies/network-policy.store";
import { serviceStore } from "../renderer/components/+network-services/services.store";
import { nodesStore } from "../renderer/components/+nodes/nodes.store";
import { podSecurityPoliciesStore } from "../renderer/components/+pod-security-policies/pod-security-policies.store";
import { storageClassStore } from "../renderer/components/+storage-classes/storage-class.store";
import { volumeClaimStore } from "../renderer/components/+storage-volume-claims/volume-claim.store";
import { volumesStore } from "../renderer/components/+storage-volumes/volumes.store";
import { clusterRoleBindingsStore } from "../renderer/components/+user-management/+cluster-role-bindings/store";
import { clusterRolesStore } from "../renderer/components/+user-management/+cluster-roles/store";
import { roleBindingsStore } from "../renderer/components/+user-management/+role-bindings/store";
import { rolesStore } from "../renderer/components/+user-management/+roles/store";
import { serviceAccountsStore } from "../renderer/components/+user-management/+service-accounts/store";
import { cronJobStore } from "../renderer/components/+workloads-cronjobs/cronjob.store";
import { daemonSetStore } from "../renderer/components/+workloads-daemonsets/daemonsets.store";
import { deploymentStore } from "../renderer/components/+workloads-deployments/deployments.store";
import { jobStore } from "../renderer/components/+workloads-jobs/job.store";
import { podsStore } from "../renderer/components/+workloads-pods/pods.store";
import { replicaSetStore } from "../renderer/components/+workloads-replicasets/replicasets.store";
import { statefulSetStore } from "../renderer/components/+workloads-statefulsets/statefulset.store";
import * as endpoints from "../common/k8s-api/endpoints";

interface Dependencies {
  apiManager: ApiManager;
  crdStore: CRDStore;
}

function initApisAndStores({ apiManager, crdStore }: Dependencies) {
  /**
   * Register apis
   */
  apiManager.registerApi(endpoints.clusterApi);
  apiManager.registerApi(endpoints.clusterRoleApi);
  apiManager.registerApi(endpoints.clusterRoleBindingApi);
  apiManager.registerApi(endpoints.configMapApi);
  apiManager.registerApi(endpoints.crdApi);
  apiManager.registerApi(endpoints.cronJobApi);
  apiManager.registerApi(endpoints.daemonSetApi);
  apiManager.registerApi(endpoints.deploymentApi);
  apiManager.registerApi(endpoints.endpointApi);
  apiManager.registerApi(endpoints.eventApi);
  apiManager.registerApi(endpoints.hpaApi);
  apiManager.registerApi(endpoints.ingressApi);
  apiManager.registerApi(endpoints.jobApi);
  apiManager.registerApi(endpoints.limitRangeApi);
  apiManager.registerApi(endpoints.namespacesApi);
  apiManager.registerApi(endpoints.networkPolicyApi);
  apiManager.registerApi(endpoints.nodesApi);
  apiManager.registerApi(endpoints.pdbApi);
  apiManager.registerApi(endpoints.persistentVolumeApi);
  apiManager.registerApi(endpoints.podMetricsApi);
  apiManager.registerApi(endpoints.podsApi);
  apiManager.registerApi(endpoints.pspApi);
  apiManager.registerApi(endpoints.pvcApi);
  apiManager.registerApi(endpoints.replicaSetApi);
  apiManager.registerApi(endpoints.resourceQuotaApi);
  apiManager.registerApi(endpoints.roleApi);
  apiManager.registerApi(endpoints.roleBindingApi);
  apiManager.registerApi(endpoints.secretsApi);
  apiManager.registerApi(endpoints.selfSubjectRulesReviewApi);
  apiManager.registerApi(endpoints.serviceAccountsApi);
  apiManager.registerApi(endpoints.serviceApi);
  apiManager.registerApi(endpoints.statefulSetApi);
  apiManager.registerApi(endpoints.storageClassApi);

  /**
   * Register stores
   */
  apiManager.registerStore(clusterOverviewStore);
  apiManager.registerStore(clusterRoleBindingsStore);
  apiManager.registerStore(clusterRolesStore);
  apiManager.registerStore(configMapsStore);
  apiManager.registerStore(crdStore);
  apiManager.registerStore(cronJobStore);
  apiManager.registerStore(daemonSetStore);
  apiManager.registerStore(deploymentStore);
  apiManager.registerStore(endpointStore);
  apiManager.registerStore(eventStore);
  apiManager.registerStore(hpaStore);
  apiManager.registerStore(ingressStore);
  apiManager.registerStore(jobStore);
  apiManager.registerStore(limitRangeStore);
  apiManager.registerStore(namespaceStore);
  apiManager.registerStore(networkPolicyStore);
  apiManager.registerStore(nodesStore);
  apiManager.registerStore(podDisruptionBudgetsStore);
  apiManager.registerStore(podSecurityPoliciesStore);
  apiManager.registerStore(podsStore);
  apiManager.registerStore(replicaSetStore);
  apiManager.registerStore(resourceQuotaStore);
  apiManager.registerStore(roleBindingsStore);
  apiManager.registerStore(rolesStore);
  apiManager.registerStore(secretsStore);
  apiManager.registerStore(serviceAccountsStore);
  apiManager.registerStore(serviceStore);
  apiManager.registerStore(statefulSetStore);
  apiManager.registerStore(storageClassStore);
  apiManager.registerStore(volumeClaimStore);
  apiManager.registerStore(volumesStore);
}

const initApisAndStoresInjectable = getInjectable({
  instantiate: (di) => isClusterPageContext()
    ? bind(initApisAndStores, null, {
      apiManager: di.inject(apiManagerInjectable),
      crdStore: di.inject(crdStoreInjectable),
    })
    : undefined,
  lifecycle: lifecycleEnum.singleton,
});

export default initApisAndStoresInjectable;
