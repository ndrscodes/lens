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

import "./details.scss";

import { autorun } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { SecretStore } from "../../+secrets/store";
import { Secret, SecretRef, SecretType, ServiceAccount } from "../../../../common/k8s-api/endpoints";
import { DrawerItem, DrawerTitle } from "../../drawer";
import { Icon } from "../../icon";
import type { KubeObjectDetailsProps } from "../../kube-object-details";
import { KubeObjectMeta } from "../../kube-object-meta";
import { Spinner } from "../../spinner";
import { ServiceAccountsSecret } from "./secret";
import { getDetailsUrl } from "../../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import logger from "../../../../common/logger";
import secretStoreInjectable from "../../+secrets/store.injectable";

export interface ServiceAccountsDetailsProps extends KubeObjectDetailsProps<ServiceAccount> {
}

interface Dependencies {
  secretStore: SecretStore
}

const NonInjectedServiceAccountsDetails = observer(({ secretStore, object: serviceAccount }: Dependencies & ServiceAccountsDetailsProps) => {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [imagePullSecrets, setImagePullSecrets] = useState<Secret[]>([]);

  if (!serviceAccount) {
    return null;
  }

  if (!(serviceAccount instanceof ServiceAccount)) {
    logger.error("[ServiceAccountsDetails]: passed object that is not an instanceof ServiceAccount", serviceAccount);

    return null;
  }

  const loadSecret = async ({ name }: SecretRef) => {
    const namespace = serviceAccount.getNs();

    try {
      return await secretStore.load({ name, namespace });
    } catch {
      // If error, return dummy secret
      return new Secret({
        apiVersion: "v1",
        kind: "Secret",
        metadata: {
          name,
          namespace,
          uid: null,
          selfLink: null,
          resourceVersion: null,
        },
        type: SecretType.Opaque,
      });
    }
  };

  useEffect(() => autorun(async () => {
    setSecrets(null);
    setImagePullSecrets(null);
    setSecrets(await Promise.all(serviceAccount.getSecrets().map(loadSecret)));
    setImagePullSecrets(await Promise.all(serviceAccount.getImagePullSecrets().map(loadSecret)));
  }), []);

  const renderSecretLinks = (secrets: Secret[]) => (
    secrets.map(secret => (
      secret.getId() === null
        ? (
          <div key={secret.getName()}>
            {secret.getName()}
            <Icon
              small material="warning"
              tooltip="Secret is not found" />
          </div>
        )
        : (
          <Link key={secret.getId()} to={getDetailsUrl(secret.selfLink)}>
            {secret.getName()}
          </Link>
        )
    ))
  );

  const tokens = secretStore.items.filter(secret => (
    secret.getNs() == serviceAccount.getNs()
    && secret.metadata.annotations?.[`kubernetes.io/service-account.name: ${serviceAccount.getName()}`]
  ));

  return (
    <div className="ServiceAccountsDetails">
      <KubeObjectMeta object={serviceAccount}/>

      {tokens.length > 0 &&(
        <DrawerItem name="Tokens" className="links">
          {renderSecretLinks(tokens)}
        </DrawerItem>
      )}
      {serviceAccount.getImagePullSecrets().length > 0 &&(
        <DrawerItem name="ImagePullSecrets" className="links">
          {
            imagePullSecrets
              ? renderSecretLinks(imagePullSecrets)
              : <Spinner center/>
          }
        </DrawerItem>
      )}

      <DrawerTitle title="Mountable secrets"/>
      <div className="secrets">
        {
          secrets
            ? (
              secrets.map(secret => (
                <ServiceAccountsSecret
                  key={secret.getId()}
                  secret={secret}
                />
              ))
            )
            : <Spinner center/>
        }
      </div>
    </div>
  );
});

export const ServiceAccountsDetails = withInjectables<Dependencies, ServiceAccountsDetailsProps>(NonInjectedServiceAccountsDetails, {
  getProps: (di, props) => ({
    secretStore: di.inject(secretStoreInjectable),
    ...props,
  }),
});
