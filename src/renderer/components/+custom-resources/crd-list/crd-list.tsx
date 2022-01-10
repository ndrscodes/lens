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

import "./crd-list.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { iter, stopPropagation, ToggleSet } from "../../../utils";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import type { CRDStore } from "../crd.store";
import { Select } from "../../select";
import { Icon } from "../../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { PageParam } from "../../../navigation";
import crdStoreInjectable from "../crd.store.injectable";
import crdGroupsUrlParamInjectable from "./crd-groups-url.injectable";

enum columnId {
  kind = "kind",
  group = "group",
  version = "version",
  scope = "scope",
  age = "age",
}

export interface CrdListProps {

}

interface Dependencies {
  crdStore: CRDStore;
  crdGroupsUrlParam: PageParam<string[]>;
}

const NonInjectedCrdList = observer(({ crdStore, crdGroupsUrlParam }: Dependencies & CrdListProps) => {
  const selectedGroups = new Set(crdGroupsUrlParam.get());
  const items = selectedGroups.size === 0
    ? crdStore.items
    : crdStore.items.filter(crd => selectedGroups.has(crd.getGroup()));

  const toggleSelection = (group: string) => {
    const groups = new ToggleSet(selectedGroups);

    groups.toggle(group);
    crdGroupsUrlParam.set([...groups]);
  };

  const getPlaceHolder = () => {
    if (selectedGroups.size === 0) {
      return "All groups";
    }

    const prefix = selectedGroups.size === 1
      ? "Group"
      : "Groups";

    return `${prefix}: ${iter.join(selectedGroups, ", ")}`;
  };

  return (
    <KubeObjectListLayout
      isConfigurable
      tableId="crd"
      className="CrdList"
      store={crdStore}
      // Don't subscribe the `crdStore` because <Sidebar> already has and is always mounted
      subscribeStores={false}
      items={items}
      sortingCallbacks={{
        [columnId.kind]: crd => crd.getResourceKind(),
        [columnId.group]: crd => crd.getGroup(),
        [columnId.version]: crd => crd.getVersion(),
        [columnId.scope]: crd => crd.getScope(),
      }}
      searchFilters={[
        crd => crd.getResourceKind(),
        crd => crd.getGroup(),
        crd => crd.getVersion(),
        crd => crd.getScope(),
      ]}
      renderHeaderTitle="Custom Resources"
      customizeHeader={({ filters, ...headerPlaceholders }) => ({
        // todo: move to global filters
        filters: (
          <>
            {filters}
            <Select
              className="group-select"
              placeholder={getPlaceHolder()}
              options={Object.keys(crdStore.groups)}
              onChange={({ value: group }) => toggleSelection(group)}
              closeMenuOnSelect={false}
              controlShouldRenderValue={false}
              formatOptionLabel={({ value: group }) => (
                <div className="flex gaps align-center">
                  <Icon small material="folder"/>
                  <span>{group}</span>
                  {selectedGroups.has(group) && <Icon small material="check" className="box right"/>}
                </div>
              )}
            />
          </>
        ),
        ...headerPlaceholders,
      })}
      renderTableHeader={[
        { title: "Resource", className: "kind", sortBy: columnId.kind, id: columnId.kind },
        { title: "Group", className: "group", sortBy: columnId.group, id: columnId.group },
        { title: "Version", className: "version", sortBy: columnId.version, id: columnId.version },
        { title: "Scope", className: "scope", sortBy: columnId.scope, id: columnId.scope },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={crd => [
        <Link key="link" to={crd.getResourceUrl()} onClick={stopPropagation}>
          {crd.getResourceKind()}
        </Link>,
        crd.getGroup(),
        crd.getVersion(),
        crd.getScope(),
        crd.getAge(),
      ]}
    />
  );
});

export const CrdList = withInjectables<Dependencies, CrdListProps>(NonInjectedCrdList, {
  getProps: (di, props) => ({
    crdStore: di.inject(crdStoreInjectable),
    crdGroupsUrlParam: di.inject(crdGroupsUrlParamInjectable),
    ...props,
  }),
});
