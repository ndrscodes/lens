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

import "./pod-details-secrets.scss";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { autorun, observable } from "mobx";
import { observer } from "mobx-react";
import type { Pod, Secret, SecretApi } from "../../../common/k8s-api/endpoints";
import { getDetailsUrl } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import secretApiInjectable from "../../../common/k8s-api/endpoints/secret.api.injectable";

export interface PodDetailsSecretsProps {
  pod: Pod;
}

interface Dependencies {
  secretApi: SecretApi;
}

const NonInjectedPodDetailsSecrets = observer(({ secretApi, pod }: Dependencies & PodDetailsSecretsProps) => {
  const [secrets] = useState(observable.map<string, Secret>());

  useEffect(() => autorun(async () => {
    const getSecrets = await Promise.all(
      pod.getSecrets().map(secretName => secretApi.get({
        name: secretName,
        namespace: pod.getNs(),
      })),
    );

    for (const secret of getSecrets) {
      if (secret) {
        secrets.set(secret.getName(), secret);
      }
    }
  }), []);

  return (
    <div className="PodDetailsSecrets">
      {
        pod.getSecrets().map(secretName => {
          const secret = secrets.get(secretName);

          return secret
            ? (
              <Link key={secret.getId()} to={getDetailsUrl(secret.selfLink)}>
                {secret.getName()}
              </Link>
            )
            : (
              <span key={secretName}>
                {secretName}
              </span>
            );
        })
      }
    </div>
  );
});

export const PodDetailsSecrets = withInjectables<Dependencies, PodDetailsSecretsProps>(NonInjectedPodDetailsSecrets, {
  getProps: (di, props) => ({
    secretApi: di.inject(secretApiInjectable),
    ...props,
  }),
});
