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

import "./cronjobs.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { CronJobStore } from "./cronjob.store";
import type { JobStore } from "../+workloads-jobs/job.store";
import type { EventStore } from "../+events/event.store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { CronJobsRouteParams } from "../../../common/routes";
import moment from "moment";
import { withInjectables } from "@ogre-tools/injectable-react";
import { CronJobMenu } from "./cronjob-item-menu";
import cronJobStoreInjectable from "./cronjob.store.injectable";
import jobStoreInjectable from "../+workloads-jobs/job.store.injectable";
import eventStoreInjectable from "../+events/event.store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  schedule = "schedule",
  suspend = "suspend",
  active = "active",
  lastSchedule = "last-schedule",
  age = "age",
}

export interface CronJobsProps extends RouteComponentProps<CronJobsRouteParams> {
}

interface Dependencies {
  cronJobStore: CronJobStore;
  jobStore: JobStore;
  eventStore: EventStore;
}

const NonInjectedCronJobs = observer(({ cronJobStore, jobStore, eventStore }: Dependencies & CronJobsProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="workload_cronjobs"
    className="CronJobs"
    store={cronJobStore}
    dependentStores={[jobStore, eventStore]}
    sortingCallbacks={{
      [columnId.name]: cronJob => cronJob.getName(),
      [columnId.namespace]: cronJob => cronJob.getNs(),
      [columnId.suspend]: cronJob => cronJob.getSuspendFlag(),
      [columnId.active]: cronJob => cronJobStore.getActiveJobsNum(cronJob),
      [columnId.lastSchedule]: cronJob => (
        cronJob.status?.lastScheduleTime
          ? moment().diff(cronJob.status.lastScheduleTime)
          : 0
      ),
      [columnId.age]: cronJob => cronJob.getTimeDiffFromNow(),
    }}
    searchFilters={[
      cronJob => cronJob.getSearchFields(),
      cronJob => cronJob.getSchedule(),
    ]}
    renderHeaderTitle="Cron Jobs"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
      { className: "warning", showWithColumn: columnId.name },
      { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
      { title: "Schedule", className: "schedule", id: columnId.schedule },
      { title: "Suspend", className: "suspend", sortBy: columnId.suspend, id: columnId.suspend },
      { title: "Active", className: "active", sortBy: columnId.active, id: columnId.active },
      { title: "Last schedule", className: "last-schedule", sortBy: columnId.lastSchedule, id: columnId.lastSchedule },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
    ]}
    renderTableContents={cronJob => [
      cronJob.getName(),
      <KubeObjectStatusIcon key="icon" object={cronJob} />,
      cronJob.getNs(),
      cronJob.isNeverRun() ? "never"  : cronJob.getSchedule(),
      cronJob.getSuspendFlag(),
      cronJobStore.getActiveJobsNum(cronJob),
      cronJob.getLastScheduleTime(),
      cronJob.getAge(),
    ]}
    renderItemMenu={item => <CronJobMenu object={item}/>}
  />
));

export const CronJobs = withInjectables<Dependencies, CronJobsProps>(NonInjectedCronJobs, {
  getProps: (di, props) => ({
    cronJobStore: di.inject(cronJobStoreInjectable),
    jobStore: di.inject(jobStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
    ...props,
  }),
});
