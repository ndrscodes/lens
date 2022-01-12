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

import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { observer } from "mobx-react";
import React from "react";
import { Table, TableHead, TableCell, TableRow } from "../table";
import { prevDefault } from "../../utils";
import type { EndpointStore } from "../+endpoints/store";
import { Spinner } from "../spinner";
import { showDetails } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import endpointStoreInjectable from "../+endpoints/store.injectable";

export interface ServiceDetailsEndpointProps {
  endpoint: KubeObject;
}

interface Dependencies {
  endpointStore: EndpointStore;
}

const NonInjectedServiceDetailsEndpoint = observer(({ endpointStore, endpoint }: Dependencies & ServiceDetailsEndpointProps) => {
  if (!endpoint) {
    if (!endpointStore.isLoaded) {
      return (
        <div className="PodDetailsList flex justify-center">
          <Spinner/>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="EndpointList flex column">
      <Table
        selectable
        virtual={false}
        scrollable={false}
        className="box grow"
      >
        <TableHead>
          <TableCell className="name" >Name</TableCell>
          <TableCell className="endpoints">Endpoints</TableCell>
        </TableHead>
        <TableRow
          key={endpoint.getId()}
          nowrap
          onClick={prevDefault(() => showDetails(endpoint.selfLink, false))}
        >
          <TableCell className="name">{endpoint.getName()}</TableCell>
          <TableCell className="endpoints">{ endpoint.toString()}</TableCell>
        </TableRow>
      </Table>
    </div>
  );
});

export const ServiceDetailsEndpoint = withInjectables<Dependencies, ServiceDetailsEndpointProps>(NonInjectedServiceDetailsEndpoint, {
  getProps: (di, props) => ({
    endpointStore: di.inject(endpointStoreInjectable),
    ...props,
  }),
});

