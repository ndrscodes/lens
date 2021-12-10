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

import { clusterOverviewStore } from "../../renderer/components/+cluster/cluster-overview.store";
import { hpaStore } from "../../renderer/components/+config-autoscalers/hpa.store";
import { limitRangeStore } from "../../renderer/components/+config-limit-ranges/limit-ranges.store";
import { configMapsStore } from "../../renderer/components/+config-maps/config-maps.store";
import { podDisruptionBudgetsStore } from "../../renderer/components/+config-pod-disruption-budgets/pod-disruption-budgets.store";
import { resourceQuotaStore } from "../../renderer/components/+config-resource-quotas/resource-quotas.store";
import { secretsStore } from "../../renderer/components/+config-secrets/secrets.store";
import { crdStore } from "../../renderer/components/+custom-resources/crd.store";
import { eventStore } from "../../renderer/components/+events/event.store";
import { namespaceStore } from "../../renderer/components/+namespaces/namespace.store";
import { endpointStore } from "../../renderer/components/+network-endpoints/endpoints.store";
import { ingressStore } from "../../renderer/components/+network-ingresses/ingress.store";
import { networkPolicyStore } from "../../renderer/components/+network-policies/network-policy.store";
import { serviceStore } from "../../renderer/components/+network-services/services.store";
import { nodesStore } from "../../renderer/components/+nodes/nodes.store";
import { podSecurityPoliciesStore } from "../../renderer/components/+pod-security-policies/pod-security-policies.store";
import { storageClassStore } from "../../renderer/components/+storage-classes/storage-class.store";
import { volumeClaimStore } from "../../renderer/components/+storage-volume-claims/volume-claim.store";
import { volumesStore } from "../../renderer/components/+storage-volumes/volumes.store";
import { clusterRoleBindingsStore } from "../../renderer/components/+user-management/+cluster-role-bindings/store";
import { clusterRolesStore } from "../../renderer/components/+user-management/+cluster-roles/store";
import { roleBindingsStore } from "../../renderer/components/+user-management/+role-bindings/store";
import { rolesStore } from "../../renderer/components/+user-management/+roles/store";
import { serviceAccountsStore } from "../../renderer/components/+user-management/+service-accounts/store";
import { cronJobStore } from "../../renderer/components/+workloads-cronjobs/cronjob.store";
import { daemonSetStore } from "../../renderer/components/+workloads-daemonsets/daemonsets.store";
import { deploymentStore } from "../../renderer/components/+workloads-deployments/deployments.store";
import { jobStore } from "../../renderer/components/+workloads-jobs/job.store";
import { podsStore } from "../../renderer/components/+workloads-pods/pods.store";
import { replicaSetStore } from "../../renderer/components/+workloads-replicasets/replicasets.store";
import { statefulSetStore } from "../../renderer/components/+workloads-statefulsets/statefulset.store";
import type { ApiManager } from "../k8s-api/api-manager";
import * as endpoints from "../k8s-api/endpoints";

/**
 * Initialize an ApiManager instance
 */
export function initApiManager(manager: ApiManager): void {
  /**
   * Register apis
   */
  manager.registerApi(endpoints.clusterApi);
  manager.registerApi(endpoints.clusterRoleApi);
  manager.registerApi(endpoints.clusterRoleBindingApi);
  manager.registerApi(endpoints.configMapApi);
  manager.registerApi(endpoints.crdApi);
  manager.registerApi(endpoints.cronJobApi);
  manager.registerApi(endpoints.daemonSetApi);
  manager.registerApi(endpoints.deploymentApi);
  manager.registerApi(endpoints.endpointApi);
  manager.registerApi(endpoints.eventApi);
  manager.registerApi(endpoints.hpaApi);
  manager.registerApi(endpoints.ingressApi);
  manager.registerApi(endpoints.jobApi);
  manager.registerApi(endpoints.limitRangeApi);
  manager.registerApi(endpoints.namespacesApi);
  manager.registerApi(endpoints.networkPolicyApi);
  manager.registerApi(endpoints.nodesApi);
  manager.registerApi(endpoints.pdbApi);
  manager.registerApi(endpoints.persistentVolumeApi);
  manager.registerApi(endpoints.podMetricsApi);
  manager.registerApi(endpoints.podsApi);
  manager.registerApi(endpoints.pspApi);
  manager.registerApi(endpoints.pvcApi);
  manager.registerApi(endpoints.replicaSetApi);
  manager.registerApi(endpoints.resourceQuotaApi);
  manager.registerApi(endpoints.roleApi);
  manager.registerApi(endpoints.roleBindingApi);
  manager.registerApi(endpoints.secretsApi);
  manager.registerApi(endpoints.selfSubjectRulesReviewApi);
  manager.registerApi(endpoints.serviceAccountsApi);
  manager.registerApi(endpoints.serviceApi);
  manager.registerApi(endpoints.statefulSetApi);
  manager.registerApi(endpoints.storageClassApi);

  /**
   * Register stores
   */
  manager.registerStore(clusterOverviewStore);
  manager.registerStore(clusterRoleBindingsStore);
  manager.registerStore(clusterRolesStore);
  manager.registerStore(configMapsStore);
  manager.registerStore(crdStore);
  manager.registerStore(cronJobStore);
  manager.registerStore(daemonSetStore);
  manager.registerStore(deploymentStore);
  manager.registerStore(endpointStore);
  manager.registerStore(eventStore);
  manager.registerStore(hpaStore);
  manager.registerStore(ingressStore);
  manager.registerStore(jobStore);
  manager.registerStore(limitRangeStore);
  manager.registerStore(namespaceStore);
  manager.registerStore(networkPolicyStore);
  manager.registerStore(nodesStore);
  manager.registerStore(podDisruptionBudgetsStore);
  manager.registerStore(podSecurityPoliciesStore);
  manager.registerStore(podsStore);
  manager.registerStore(replicaSetStore);
  manager.registerStore(resourceQuotaStore);
  manager.registerStore(roleBindingsStore);
  manager.registerStore(rolesStore);
  manager.registerStore(secretsStore);
  manager.registerStore(serviceAccountsStore);
  manager.registerStore(serviceStore);
  manager.registerStore(statefulSetStore);
  manager.registerStore(storageClassStore);
  manager.registerStore(volumeClaimStore);
  manager.registerStore(volumesStore);
}
