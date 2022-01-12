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

import "./service-details.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Service } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import { ServicePortComponent } from "./service-port-component";
import { ServiceDetailsEndpoint } from "./service-details-endpoint";
import { kubeWatchApi } from "../../../common/k8s-api/kube-watch-api";
import { portForwardStore } from "../../port-forward";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import endpointStoreInjectable from "../+endpoints/store.injectable";
import { disposer } from "../../utils";
import type { EndpointStore } from "../+endpoints/store";

export interface ServiceDetailsProps extends KubeObjectDetailsProps<Service> {
}

interface Dependencies {
  endpointStore: EndpointStore;
}

const NonInjectedServiceDetails = observer(({ object: service, endpointStore }: Dependencies & ServiceDetailsProps) => {
  useEffect(() => disposer(
    kubeWatchApi.subscribeStores([
      endpointStore,
    ], {
      namespaces: [service.getNs()],
    }),
    portForwardStore.watch(),
  ), []);

  if (!service) {
    return null;
  }

  if (!(service instanceof Service)) {
    logger.error("[ServiceDetails]: passed object that is not an instanceof Service", service);

    return null;
  }

  const { spec } = service;
  const endpoint = endpointStore.getByName(service.getName(), service.getNs());
  const externalIps = service.getExternalIps();

  if (externalIps.length === 0 && spec?.externalName) {
    externalIps.push(spec.externalName);
  }

  return (
    <div className="ServicesDetails">
      <KubeObjectMeta object={service}/>

      <DrawerItem name="Selector" labelsOnly>
        {service.getSelector().map(selector => <Badge key={selector} label={selector}/>)}
      </DrawerItem>

      <DrawerItem name="Type">
        {spec.type}
      </DrawerItem>

      <DrawerItem name="Session Affinity">
        {spec.sessionAffinity}
      </DrawerItem>

      <DrawerTitle title="Connection"/>

      <DrawerItem name="Cluster IP">
        {spec.clusterIP}
      </DrawerItem>

      <DrawerItem name="Cluster IPs" hidden={!service.getClusterIps().length} labelsOnly>
        {
          service.getClusterIps().map(label => (
            <Badge key={label} label={label}/>
          ))
        }
      </DrawerItem>

      <DrawerItem name="IP families" hidden={!service.getIpFamilies().length}>
        {service.getIpFamilies().join(", ")}
      </DrawerItem>

      <DrawerItem name="IP family policy" hidden={!service.getIpFamilyPolicy()}>
        {service.getIpFamilyPolicy()}
      </DrawerItem>

      {externalIps.length > 0 && (
        <DrawerItem name="External IPs">
          {externalIps.map(ip => <div key={ip}>{ip}</div>)}
        </DrawerItem>
      )}

      <DrawerItem name="Ports">
        <div>
          {
            service.getPorts().map((port) => (
              <ServicePortComponent service={service} port={port} key={port.toString()}/>
            ))
          }
        </div>
      </DrawerItem>

      {spec.type === "LoadBalancer" && spec.loadBalancerIP && (
        <DrawerItem name="Load Balancer IP">
          {spec.loadBalancerIP}
        </DrawerItem>
      )}
      <DrawerTitle title="Endpoint"/>

      <ServiceDetailsEndpoint endpoint={endpoint}/>
    </div>
  );
});

export const ServiceDetails = withInjectables<Dependencies, ServiceDetailsProps>(NonInjectedServiceDetails, {
  getProps: (di, props) => ({
    endpointStore: di.inject(endpointStoreInjectable),
    ...props,
  }),
});

