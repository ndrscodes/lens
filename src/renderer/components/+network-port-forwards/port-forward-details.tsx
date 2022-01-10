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

import "./port-forward-details.scss";

import React from "react";
import { Link } from "react-router-dom";
import { portForwardAddress, PortForwardItem } from "../../port-forward";
import { Drawer, DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { getDetailsUrl } from "../kube-detail-params";
import { PortForwardMenu } from "./port-forward-menu";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { ServiceApi, PodApi } from "../../../common/k8s-api/endpoints";
import podApiInjectable from "../../../common/k8s-api/endpoints/pod.api.injectable";
import serviceApiInjectable from "../../../common/k8s-api/endpoints/service.api.injectable";

export interface PortForwardDetailsProps {
  portForward: PortForwardItem;
  hideDetails(): void;
}

interface Dependencies {
  serviceApi: ServiceApi;
  podApi: PodApi;
}

const NonInjectedPortForwardDetails = observer(({ podApi, serviceApi, portForward, hideDetails }: Dependencies & PortForwardDetailsProps) => {
  if (!portForward) {
    return null;
  }

  const renderResourceName = () => {
    const name = portForward.getName();
    const api = {
      "service": serviceApi,
      "pod": podApi,
    }[portForward.kind];

    if (!api) {
      return (
        <span>{name}</span>
      );
    }

    return (
      <Link to={getDetailsUrl(api.getUrl({ name, namespace: portForward.getNs() }))}>
        {name}
      </Link>
    );
  };

  return (
    <Drawer
      className="PortForwardDetails"
      usePortal
      open
      title={`Port Forward: ${portForwardAddress(portForward)}`}
      onClose={hideDetails}
      toolbar={<PortForwardMenu portForward={portForward} toolbar hideDetails={hideDetails}/>}
    >
      <div>
        <DrawerItem name="Resource Name">
          {renderResourceName()}
        </DrawerItem>
        <DrawerItem name="Namespace">
          {portForward.getNs()}
        </DrawerItem>
        <DrawerItem name="Kind">
          {portForward.getKind()}
        </DrawerItem>
        <DrawerItem name="Pod Port">
          {portForward.getPort()}
        </DrawerItem>
        <DrawerItem name="Local Port">
          {portForward.getForwardPort()}
        </DrawerItem>
        <DrawerItem name="Protocol">
          {portForward.getProtocol()}
        </DrawerItem>
        <DrawerItem name="Status">
          <span className={cssNames("status", portForward.getStatus().toLowerCase())}>{portForward.getStatus()}</span>
        </DrawerItem>
      </div>
    </Drawer>
  );
});

export const PortForwardDetails = withInjectables<Dependencies, PortForwardDetailsProps>(NonInjectedPortForwardDetails, {
  getProps: (di, props) => ({
    podApi: di.inject(podApiInjectable),
    serviceApi: di.inject(serviceApiInjectable),
    ...props,
  }),
});
