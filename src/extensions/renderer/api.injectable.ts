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
import * as Catalog from "./catalog";
import * as Navigation from "./navigation";
import * as Theme from "./theming";
import { IpcRenderer as Ipc } from "../ipc/ipc-renderer";
import { LensRendererExtension as LensExtension } from "../lens-renderer-extension";
import k8sRendererApiInjectable from "./k8s-api.injectable";
import componentsInjectable from "./components.injectable";

const lensRendererExtensionsApiInjectable = getInjectable({
  instantiate: (di) => ({
    Catalog,
    Component: di.inject(componentsInjectable),
    K8sApi: di.inject(k8sRendererApiInjectable),
    Navigation,
    Theme,
    Ipc,
    LensExtension,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default lensRendererExtensionsApiInjectable;
