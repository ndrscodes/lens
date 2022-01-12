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

import styles from "./cluster-issues.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { Icon } from "../icon";
import { SubHeader } from "../layout/sub-header";
import { Table, TableCell, TableHead, TableRow } from "../table";
import type { NodeStore } from "../+nodes/store";
import type { EventStore } from "../+events/store";
import { cssNames, prevDefault } from "../../utils";
import type { ItemObject } from "../../../common/item.store";
import { Spinner } from "../spinner";
import { ThemeStore } from "../../theme.store";
import { kubeSelectedUrlParam, toggleDetails } from "../kube-detail-params";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import nodeStoreInjectable from "../+nodes/store.injectable";
import eventStoreInjectable from "../+events/store.injectable";

export interface ClusterIssuesProps {
  className?: string;
}

interface IWarning extends ItemObject {
  kind: string;
  message: string;
  selfLink: string;
  age: string | number;
  timeDiffFromNow: number;
}

enum sortBy {
  type = "type",
  object = "object",
  age = "age",
}

interface Dependencies {
  apiManager: ApiManager;
  nodeStore: NodeStore;
  eventStore: EventStore;
}

const NonInjectedClusterIssues = observer(({ apiManager, nodeStore, eventStore, className }: Dependencies & ClusterIssuesProps) => {
  const warnings: IWarning[] = [
    ...nodeStore.items.flatMap(node => (
      node.getWarningConditions()
        .map(({ message }) => ({
          age: node.getAge(),
          getId: () => node.getId(),
          getName: () => node.getName(),
          timeDiffFromNow: node.getTimeDiffFromNow(),
          kind: node.kind,
          message,
          selfLink: node.selfLink,
        }))
    )),
    ...eventStore.getWarnings().map(warning => ({
      getId: () => warning.involvedObject.uid,
      getName: () => warning.involvedObject.name,
      timeDiffFromNow: warning.getTimeDiffFromNow(),
      age: warning.getAge(),
      message: warning.message,
      kind: warning.kind,
      selfLink: apiManager.lookupApiLink(warning.involvedObject, warning),
    })),
  ];

  const getTableRow = (uid: string) => {
    const warning = warnings.find(warn => warn.getId() == uid);
    const { getId, getName, message, kind, selfLink, age } = warning;

    return (
      <TableRow
        key={getId()}
        sortItem={warning}
        selected={selfLink === kubeSelectedUrlParam.get()}
        onClick={prevDefault(() => toggleDetails(selfLink))}
      >
        <TableCell className={styles.message}>
          {message}
        </TableCell>
        <TableCell className={styles.object}>
          {getName()}
        </TableCell>
        <TableCell className="kind">
          {kind}
        </TableCell>
        <TableCell className="age">
          {age}
        </TableCell>
      </TableRow>
    );
  };

  const renderContent = () => {
    if (!eventStore.isLoaded) {
      return (
        <Spinner center/>
      );
    }

    if (!warnings.length) {
      return (
        <div className={cssNames(styles.noIssues, "flex column box grow gaps align-center justify-center")}>
          <Icon className={styles.Icon} material="check" big sticker/>
          <p className={styles.title}>No issues found</p>
          <p>Everything is fine in the Cluster</p>
        </div>
      );
    }

    return (
      <>
        <SubHeader className={styles.SubHeader}>
          <Icon material="error_outline"/>{" "}
          <>Warnings: {warnings.length}</>
        </SubHeader>
        <Table
          tableId="cluster_issues"
          items={warnings}
          virtual
          selectable
          sortable={{
            [sortBy.type]: (warning: IWarning) => warning.kind,
            [sortBy.object]: (warning: IWarning) => warning.getName(),
            [sortBy.age]: (warning: IWarning) => warning.timeDiffFromNow,
          }}
          sortByDefault={{ sortBy: sortBy.object, orderBy: "asc" }}
          sortSyncWithUrl={false}
          getTableRow={getTableRow}
          className={cssNames("box grow", ThemeStore.getInstance().activeTheme.type)}
        >
          <TableHead nowrap>
            <TableCell className="message">Message</TableCell>
            <TableCell className="object" sortBy={sortBy.object}>Object</TableCell>
            <TableCell className="kind" sortBy={sortBy.type}>Type</TableCell>
            <TableCell className="timestamp" sortBy={sortBy.age}>Age</TableCell>
          </TableHead>
        </Table>
      </>
    );
  };

  return (
    <div className={cssNames(styles.ClusterIssues, "flex column", className)}>
      {renderContent()}
    </div>
  );
});

export const ClusterIssues = withInjectables<Dependencies, ClusterIssuesProps>(NonInjectedClusterIssues, {
  getProps: (di, props) => ({
    apiManager: di.inject(apiManagerInjectable),
    nodeStore: di.inject(nodeStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
    ...props,
  }),
});

