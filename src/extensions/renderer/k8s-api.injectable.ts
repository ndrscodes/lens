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
import apiManagerInjectable from "../../common/k8s-api/api-manager.injectable";

import { isAllowedResource } from "../../common/utils/allowed-resource";
import { ResourceStack } from "../../common/k8s/resource-stack";
import { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
import { KubeApi, forCluster, forRemoteCluster } from "../../common/k8s-api/kube-api";
import { KubeObject, KubeStatus } from "../../common/k8s-api/kube-object";
import * as endpoints from "../../common/k8s-api/endpoints";
import { KubeObjectStatusLevel } from "./kube-object-status";
import { KubeJsonApi } from "../../common/k8s-api/kube-json-api";

const k8sRendererApiInjectable = getInjectable({
  instantiate: (di) => ({
    apiManager: di.inject(apiManagerInjectable),
    isAllowedResource,
    ResourceStack,
    KubeObjectStore,
    KubeApi,
    forCluster,
    forRemoteCluster,
    KubeObject,
    KubeStatus,
    Pod: endpoints.Pod,
    podsApi: endpoints.podsApi,
    PodsApi: endpoints.PodsApi,
    Node: endpoints.Node,
    nodesApi: endpoints.nodesApi,
    NodesApi: endpoints.NodesApi,
    Deployment: endpoints.Deployment,
    deploymentApi: endpoints.deploymentApi,
    DeploymentApi: endpoints.DeploymentApi,
    DaemonSet: endpoints.DaemonSet,
    daemonSetApi: endpoints.daemonSetApi,
    StatefulSet: endpoints.StatefulSet,
    statefulSetApi: endpoints.statefulSetApi,
    Job: endpoints.Job,
    jobApi: endpoints.jobApi,
    CronJob: endpoints.CronJob,
    cronJobApi: endpoints.cronJobApi,
    ConfigMap: endpoints.ConfigMap,
    configMapApi: endpoints.configMapApi,
    Secret: endpoints.Secret,
    secretsApi: endpoints.secretsApi,
    ReplicaSet: endpoints.ReplicaSet,
    replicaSetApi: endpoints.replicaSetApi,
    ResourceQuota: endpoints.ResourceQuota,
    resourceQuotaApi: endpoints.resourceQuotaApi,
    LimitRange: endpoints.LimitRange,
    limitRangeApi: endpoints.limitRangeApi,
    HorizontalPodAutoscaler: endpoints.HorizontalPodAutoscaler,
    hpaApi: endpoints.hpaApi,
    PodDisruptionBudget: endpoints.PodDisruptionBudget,
    pdbApi: endpoints.pdbApi,
    Service: endpoints.Service,
    serviceApi: endpoints.serviceApi,
    Endpoint: endpoints.Endpoint,
    endpointApi: endpoints.endpointApi,
    Ingress: endpoints.Ingress,
    ingressApi: endpoints.ingressApi,
    IngressApi: endpoints.IngressApi,
    NetworkPolicy: endpoints.NetworkPolicy,
    networkPolicyApi: endpoints.networkPolicyApi,
    PersistentVolume: endpoints.PersistentVolume,
    persistentVolumeApi: endpoints.persistentVolumeApi,
    PersistentVolumeClaim: endpoints.PersistentVolumeClaim,
    pvcApi: endpoints.pvcApi,
    PersistentVolumeClaimsApi: endpoints.PersistentVolumeClaimsApi,
    StorageClass: endpoints.StorageClass,
    storageClassApi: endpoints.storageClassApi,
    Namespace: endpoints.Namespace,
    namespacesApi: endpoints.namespacesApi,
    KubeEvent: endpoints.KubeEvent,
    eventApi: endpoints.eventApi,
    ServiceAccount: endpoints.ServiceAccount,
    serviceAccountsApi: endpoints.serviceAccountsApi,
    Role: endpoints.Role,
    roleApi: endpoints.roleApi,
    RoleBinding: endpoints.RoleBinding,
    roleBindingApi: endpoints.roleBindingApi,
    ClusterRole: endpoints.ClusterRole,
    clusterRoleApi: endpoints.clusterRoleApi,
    ClusterRoleBinding: endpoints.ClusterRoleBinding,
    clusterRoleBindingApi: endpoints.clusterRoleBindingApi,
    CustomResourceDefinition: endpoints.CustomResourceDefinition,
    crdApi: endpoints.crdApi,
    KubeObjectStatusLevel,
    KubeJsonApi,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default k8sRendererApiInjectable;
