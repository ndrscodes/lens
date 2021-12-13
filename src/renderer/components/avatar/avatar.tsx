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

import styles from "./avatar.module.scss";

import React, { HTMLAttributes } from "react";
import randomColor from "randomcolor";
import { cssNames } from "../../utils";

export interface AvatarProps extends HTMLAttributes<HTMLElement> {
  colorHash?: string;
  size?: number;
  background?: string;
  variant?: "circle" | "rounded" | "square";
  disabled?: boolean;
}

export function Avatar(props: AvatarProps) {
  const { variant = "rounded", size = 32, colorHash, children, background, className, disabled, ...rest } = props;

  return (
    <div
      className={cssNames(styles.Avatar, {
        [styles.circle]: variant == "circle",
        [styles.rounded]: variant == "rounded",
        [styles.disabled]: disabled,
      }, className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: background || randomColor({ seed: colorHash, luminosity: "dark" }),
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
