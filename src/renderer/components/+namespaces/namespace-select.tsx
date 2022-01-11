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

import "./namespace-select.scss";

import React from "react";
import { observer } from "mobx-react";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import type { NamespaceStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./store.injectable";

export interface NamespaceSelectProps extends SelectProps {
  showIcons?: boolean;
  sort?: (a: SelectOption<string>, b: SelectOption<string>) => number;
  showAllNamespacesOption?: boolean; // show "All namespaces" option on the top (default: false)
  customizeOptions?(options: SelectOption[]): SelectOption[];
}

interface Dependencies {
  namespaceStore: NamespaceStore;
}

const NonInjectedNamespaceSelect = observer(({ namespaceStore, showIcons = true, sort, showAllNamespacesOption, customizeOptions, className, ...selectProps }: Dependencies & NamespaceSelectProps) => {
  const options = (() => {
    let options: SelectOption[] = namespaceStore.items.map(ns => ({ value: ns.getName() }));

    if (sort) {
      options.sort(sort);
    }

    if (showAllNamespacesOption) {
      options.unshift({ label: "All Namespaces", value: "" });
    }

    if (customizeOptions) {
      options = customizeOptions(options);
    }

    return options;
  })();

  const formatOptionLabel = ({ value, label }: SelectOption) => (
    label || (
      <>
        {showIcons && <Icon small material="layers"/>}
        {value}
      </>
    )
  );

  return (
    <Select
      className={cssNames("NamespaceSelect", className)}
      menuClass="NamespaceSelectMenu"
      formatOptionLabel={formatOptionLabel}
      options={options}
      {...selectProps}
    />
  );
});

export const NamespaceSelect = withInjectables<Dependencies, NamespaceSelectProps>(NonInjectedNamespaceSelect, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    ...props,
  }),
});
