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

import "./pod-container-env.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import type { IPodContainer, Secret } from "../../../common/k8s-api/endpoints";
import { DrawerItem } from "../drawer";
import { autorun } from "mobx";
import type { SecretStore } from "../+config-secrets/store";
import type { ConfigMapStore } from "../+config-maps/store";
import { Icon } from "../icon";
import { base64, cssNames, iter } from "../../utils";
import _ from "lodash";
import { withInjectables } from "@ogre-tools/injectable-react";
import secretStoreInjectable from "../+config-secrets/store.injectable";
import configMapStoreInjectable from "../+config-maps/store.injectable";

export interface ContainerEnvironmentProps {
  container: IPodContainer;
  namespace: string;
}

interface ContainerEnvironmentDependencies {
  secretStore: SecretStore;
  configMapStore: ConfigMapStore;
}

const NonInjectedContainerEnvironment = observer(({ container: { env, envFrom }, namespace, secretStore, configMapStore }: ContainerEnvironmentDependencies & ContainerEnvironmentProps) => {
  useEffect( () => autorun(() => {
    for (const { valueFrom } of env ?? []) {
      if (valueFrom?.configMapKeyRef) {
        configMapStore.load({ name: valueFrom.configMapKeyRef.name, namespace });
      }
    }

    for (const { configMapRef, secretRef } of envFrom ?? []) {
      if (secretRef?.name) {
        secretStore.load({ name: secretRef.name, namespace });
      }

      if (configMapRef?.name) {
        configMapStore.load({ name: configMapRef.name, namespace });
      }
    }
  }), []);

  const renderEnv = () => {
    const orderedEnv = _.sortBy(env, "name");

    return orderedEnv.map(variable => {
      const { name, value, valueFrom } = variable;
      let secretValue = null;

      if (value) {
        secretValue = value;
      }

      if (valueFrom) {
        const { fieldRef, secretKeyRef, configMapKeyRef } = valueFrom;

        if (fieldRef) {
          const { apiVersion, fieldPath } = fieldRef;

          secretValue = `fieldRef(${apiVersion}:${fieldPath})`;
        }

        if (secretKeyRef) {
          secretValue = (
            <SecretKey
              reference={secretKeyRef}
              namespace={namespace}
            />
          );
        }

        if (configMapKeyRef) {
          const { name, key } = configMapKeyRef;
          const configMap = configMapStore.getByName(name, namespace);

          secretValue = configMap ?
            configMap.data[key] :
            `configMapKeyRef(${name}${key})`;
        }
      }

      return (
        <div className="variable" key={name}>
          <span className="var-name">{name}</span>: {secretValue}
        </div>
      );
    });
  };

  const renderEnvFrom = () => {
    return Array.from(iter.filterFlatMap(envFrom, vars => {
      if (vars.configMapRef?.name) {
        return renderEnvFromConfigMap(vars.configMapRef.name);
      }

      if (vars.secretRef?.name) {
        return renderEnvFromSecret(vars.secretRef.name);
      }

      return null;
    }));
  };

  const renderEnvFromConfigMap = (configMapName: string) => {
    const configMap = configMapStore.getByName(configMapName, namespace);

    if (!configMap) return null;

    return Object.entries(configMap.data).map(([name, value]) => (
      <div className="variable" key={name}>
        <span className="var-name">{name}</span>: {value}
      </div>
    ));
  };

  const renderEnvFromSecret = (secretName: string) => {
    const secret = secretStore.getByName(secretName, namespace);

    if (!secret) return null;

    return Object.keys(secret.data).map(key => {
      const secretKeyRef = {
        name: secret.getName(),
        key,
      };

      const value = (
        <SecretKey
          reference={secretKeyRef}
          namespace={namespace}
        />
      );

      return (
        <div className="variable" key={key}>
          <span className="var-name">{key}</span>: {value}
        </div>
      );
    });
  };

  return (
    <DrawerItem name="Environment" className="ContainerEnvironment">
      {env && renderEnv()}
      {envFrom && renderEnvFrom()}
    </DrawerItem>
  );
});

export const ContainerEnvironment = withInjectables<ContainerEnvironmentDependencies, ContainerEnvironmentProps>(NonInjectedContainerEnvironment, {
  getProps: (di, props) => ({
    secretStore: di.inject(secretStoreInjectable),
    configMapStore: di.inject(configMapStoreInjectable),
    ...props,
  }),
});

export interface SecretKeyProps {
  reference: {
    name: string;
    key: string;
  };
  namespace: string;
}

interface SecretKeyDependencies {
  secretStore: SecretStore;
}

const NonInjectedSecretKey = observer(({ secretStore, reference: { name, key }, namespace }: SecretKeyDependencies & SecretKeyProps) => {
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState<Secret>();

  const showKey = async (evt: React.MouseEvent) => {
    evt.preventDefault();
    setLoading(true);
    const secret = await secretStore.load({ name, namespace });

    setLoading(false);
    setSecret(secret);
  };

  if (secret?.data?.[key]) {
    return <>{base64.decode(secret.data[key])}</>;
  }

  return (
    <>
      secretKeyRef({name}.{key})&nbsp;
      <Icon
        className={cssNames("secret-button", { loading })}
        material="visibility"
        tooltip="Show"
        onClick={showKey}
      />
    </>
  );
});

export const SecretKey = withInjectables<SecretKeyDependencies, SecretKeyProps>(NonInjectedSecretKey, {
  getProps: (di, props) => ({
    secretStore: di.inject(secretStoreInjectable),
    ...props,
  }),
});
