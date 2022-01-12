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

import styles from "./cluster-metrics.module.scss";

import React from "react";
import { observer } from "mobx-react";
import type { ChartOptions, ChartPoint } from "chart.js";
import { BarChart } from "../chart";
import { bytesToUnits, cssNames } from "../../utils";
import { Spinner } from "../spinner";
import { ZebraStripes } from "../chart/zebra-stripes.plugin";
import { ClusterNoMetrics } from "./cluster-no-metrics";
import { ClusterMetricSwitchers } from "./cluster-metric-switchers";
import { getMetricLastPoints, normalizeMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { MetricNodeRole, MetricType } from "./overview.state";
import type { IClusterMetrics, Node } from "../../../common/k8s-api/endpoints";

export interface ClusterMetricsProps {
  metrics: IClusterMetrics | null;
  metricsNodeRole: MetricNodeRole;
  setMetricsNodeRole: (val: MetricNodeRole) => void;
  metricsType: MetricType;
  setMetricsType: (val: MetricType) => void;
  masterNodes: Node[];
  workerNodes: Node[];
}

function getMetricsValues(metricsType: MetricType, source: IClusterMetrics | null): [number, string][] {
  switch (metricsType) {
    case MetricType.CPU:
      return normalizeMetrics(source?.cpuUsage).data.result[0].values;
    case MetricType.MEMORY:
      return normalizeMetrics(source?.memoryUsage).data.result[0].values;
    default:
      return [];
  }
}

export const ClusterMetrics = observer(({
  metricsType,
  metrics,
  setMetricsType,
  metricsNodeRole,
  setMetricsNodeRole,
  masterNodes,
  workerNodes,
}: ClusterMetricsProps) => {
  const { memoryCapacity, cpuCapacity } = getMetricLastPoints(metrics ?? {});
  const metricsValues = getMetricsValues(metricsType, metrics);
  const colors = { cpu: "#3D90CE", memory: "#C93DCE" };
  const data = metricsValues.map(value => ({
    x: value[0],
    y: parseFloat(value[1]).toFixed(3),
  }));

  const datasets = [{
    id: metricsType + metricsNodeRole,
    label: `${metricsType.toUpperCase()} usage`,
    borderColor: colors[metricsType],
    data,
  }];
  const cpuOptions: ChartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          suggestedMax: cpuCapacity,
          callback: (value) => value,
        },
      }],
    },
    tooltips: {
      callbacks: {
        label: ({ index }, data) => {
          const value = data.datasets[0].data[index] as ChartPoint;

          return value.y.toString();
        },
      },
    },
  };
  const memoryOptions: ChartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          suggestedMax: memoryCapacity,
          callback: (value: string) => !value ? 0 : bytesToUnits(parseInt(value)),
        },
      }],
    },
    tooltips: {
      callbacks: {
        label: ({ index }, data) => {
          const value = data.datasets[0].data[index] as ChartPoint;

          return bytesToUnits(parseInt(value.y as string), 3);
        },
      },
    },
  };
  const options = metricsType === MetricType.CPU ? cpuOptions : memoryOptions;

  const renderMetrics = () => {
    if (!metricsValues.length && !metrics) {
      return <Spinner center/>;
    }

    if (!memoryCapacity || !cpuCapacity) {
      return <ClusterNoMetrics className={styles.empty}/>;
    }

    return (
      <BarChart
        name={`${metricsNodeRole}-${metricsType}`}
        options={options}
        data={{ datasets }}
        timeLabelStep={5}
        showLegend={false}
        plugins={[ZebraStripes]}
        className={styles.chart}
      />
    );
  };

  return (
    <div className={cssNames(styles.ClusterMetrics, "flex column")}>
      <ClusterMetricSwitchers
        metricsValues={metricsValues}
        metricsNodeRole={metricsNodeRole}
        metricsType={metricsType}
        masterNodes={masterNodes}
        workerNodes={workerNodes}
        setMetricsType={setMetricsType}
        setMetricsNodeRole={setMetricsNodeRole}
      />
      {renderMetrics()}
    </div>
  );
});
