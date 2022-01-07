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
import { MainLayout } from "../../renderer/components/layout/main-layout";
import { SettingLayout } from "../../renderer/components/layout/setting-layout";
import { PageLayout } from "../../renderer/components/layout/page-layout";
import { WizardLayout } from "../../renderer/components/layout/wizard-layout";
import { TabLayout } from "../../renderer/components/layout/tab-layout";
import { Button } from "../../renderer/components/button";
import { Checkbox } from "../../renderer/components/checkbox";
import { Radio } from "../../renderer/components/radio";
import { Select } from "../../renderer/components/select";
import { Slider } from "../../renderer/components/slider";
import { Switch } from "../../renderer/components/switch";
import { Input, InputValidators } from "../../renderer/components/input/input";
import { CommandOverlay } from "../../renderer/components/command-palette";
import { Icon } from "../../renderer/components/icon";
import { Tooltip, withTooltip } from "../../renderer/components/tooltip";
import { Tab, Tabs } from "../../renderer/components/tabs";
import { Table, TableCell, sortByUrlParam, orderByUrlParam, TableHead, TableRow } from "../../renderer/components/table";
import { Badge } from "../../renderer/components/badge";
import { Drawer, DrawerTitle, DrawerItemLabels, DrawerItem, DrawerParamToggler } from "../../renderer/components/drawer";
import { Dialog }from "../../renderer/components/dialog";
import { ConfirmDialog } from "../../renderer/components/confirm-dialog";
import { LineProgress } from "../../renderer/components/line-progress";
import { Menu, MenuActions, MenuContext, MenuItem } from "../../renderer/components/menu";
import { Notifications, notificationsStore, NotificationsStore, NotificationStatus } from "../../renderer/components/notifications";
import { Spinner } from "../../renderer/components/spinner";
import { Stepper } from "../../renderer/components/stepper";
import { Wizard, WizardStep } from "../../renderer/components/wizard";
import { PodDetailsList } from "../../renderer/components/+workloads-pods/pod-details-list";
import { NamespaceSelect } from "../../renderer/components/+namespaces/namespace-select";
import { NamespaceSelectFilter } from "../../renderer/components/+namespaces/namespace-select-filter";
import { SubTitle } from "../../renderer/components/layout/sub-title";
import { SearchInput } from "../../renderer/components/input/search-input";
import { BarChart, cpuOptions, memoryOptions } from "../../renderer/components/chart/bar-chart";
import { PieChart } from "../../renderer/components/chart/pie-chart";
import { getDetailsUrl, hideDetails, kubeDetailsUrlParam, kubeSelectedUrlParam, showDetails, toggleDetails } from "../../renderer/components/kube-detail-params";
import { KubeObjectDetails } from "../../renderer/components/kube-object-details";
import { KubeObjectListLayout } from "../../renderer/components/kube-object-list-layout";
import { KubeObjectMenu } from "../../renderer/components/kube-object-menu";
import { KubeObjectMeta } from "../../renderer/components/kube-object-meta";
import { KubeEventDetails } from "../../renderer/components/+events/kube-event-details";
import { StatusBrick } from "../../renderer/components/status-brick";

import newTerminalTabInjectable from "../../renderer/components/dock/terminal/create-tab.injectable";
import terminalStoreInjectable from "../../renderer/components/dock/terminal/store.injectable";
import logTabStoreInjectable from "../../renderer/components/dock/log-tab/store.injectable";


const componentsInjectable = getInjectable({
  instantiate: (di) => ({
    terminalStore: di.inject(terminalStoreInjectable),
    createTerminalTab: di.inject(newTerminalTabInjectable),
    logTabStore: di.inject(logTabStoreInjectable),
    MainLayout,
    SettingLayout,
    PageLayout,
    WizardLayout,
    TabLayout,
    Button,
    Checkbox,
    Radio,
    Select,
    Slider,
    Switch,
    Input,
    InputValidators,
    CommandOverlay,
    Icon,
    Tooltip,
    withTooltip,
    Table,
    Tab,
    Tabs,
    TableCell,
    sortByUrlParam,
    orderByUrlParam,
    TableHead,
    TableRow,
    Badge,
    Drawer,
    DrawerTitle,
    DrawerItemLabels,
    DrawerItem,
    DrawerParamToggler,
    Dialog,
    ConfirmDialog,
    LineProgress,
    Menu,
    MenuActions,
    MenuContext,
    MenuItem,
    Notifications,
    notificationsStore,
    NotificationsStore,
    NotificationStatus,
    Spinner,
    Stepper,
    Wizard,
    WizardStep,
    PodDetailsList,
    NamespaceSelect,
    NamespaceSelectFilter,
    SubTitle,
    SearchInput,
    BarChart,
    cpuOptions,
    memoryOptions,
    PieChart,
    getDetailsUrl,
    hideDetails,
    kubeDetailsUrlParam,
    kubeSelectedUrlParam,
    showDetails,
    toggleDetails,
    KubeObjectDetails,
    KubeObjectListLayout,
    KubeObjectMenu,
    KubeObjectMeta,
    KubeEventDetails,
    StatusBrick,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default componentsInjectable;
