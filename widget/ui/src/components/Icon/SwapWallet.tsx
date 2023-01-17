import * as React from 'react';
import { SvgWithFillColor } from './common';
import { IconProps } from './types';

export const SwapWallet = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 16, color, ...props }) => {
    return (
      <SvgWithFillColor
        width={size}
        height={size}
        viewBox="0 0 24 24"
        color={color}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.244 7.205a3.018 3.018 0 0 0-3.01 3.01v1.73a.75.75 0 0 1-1.5 0v-1.73a4.518 4.518 0 0 1 4.51-4.51h11.48a4.518 4.518 0 0 1 4.51 4.51v1.44a.75.75 0 0 1-.75.75h-2.02c-.359 0-.674.14-.902.373l-.014.014c-.266.26-.414.63-.377 1.022v.009c.054.635.664 1.182 1.413 1.182h1.9a.75.75 0 0 1 .75.75v1.19a4.518 4.518 0 0 1-4.51 4.51h-5.48a.75.75 0 0 1 0-1.5h5.48a3.018 3.018 0 0 0 3.01-3.01v-.44h-1.15c-1.41 0-2.777-1.03-2.907-2.553a2.758 2.758 0 0 1 .817-2.227 2.743 2.743 0 0 1 1.97-.82h1.27v-.69a3.018 3.018 0 0 0-3.01-3.01H5.244Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.084 2.655a1.15 1.15 0 0 0-1.554-1.078l-7.94 3a2.098 2.098 0 0 0-1.356 1.968v4.57a.75.75 0 0 1-1.5 0v-4.57c0-1.5.922-2.84 2.325-3.371l7.94-3c1.732-.657 3.585.629 3.585 2.481v3.8a.75.75 0 0 1-1.5 0v-3.8ZM18.463 12.405c-.359 0-.675.14-.902.374l-.014.013c-.266.26-.415.63-.377 1.022v.01c.053.634.664 1.181 1.413 1.181h1.943a.276.276 0 0 0 .267-.27v-2.06a.276.276 0 0 0-.267-.27h-2.063Zm-1.97-.68a2.743 2.743 0 0 1 1.97-.82h2.107a1.777 1.777 0 0 1 1.723 1.77v2.06a1.777 1.777 0 0 1-1.75 1.77h-1.96c-1.41 0-2.777-1.03-2.907-2.553a2.758 2.758 0 0 1 .816-2.227Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.234 10.705a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75ZM1.234 15.205a.75.75 0 0 1 .75-.75h5.34a1.91 1.91 0 0 1 1.91 1.91v1.28a.75.75 0 0 1-1.5 0v-1.28a.41.41 0 0 0-.41-.41h-5.34a.75.75 0 0 1-.75-.75Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.735 13.455a.75.75 0 0 1 0 1.06l-.69.69.69.69a.75.75 0 1 1-1.061 1.06l-1.22-1.22a.75.75 0 0 1 0-1.06l1.22-1.22a.75.75 0 0 1 1.06 0ZM1.984 17.296a.75.75 0 0 1 .75.75v1.28c0 .225.185.41.41.41h5.34a.75.75 0 0 1 0 1.5h-5.34a1.91 1.91 0 0 1-1.91-1.91v-1.28a.75.75 0 0 1 .75-.75Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.735 18.735a.75.75 0 0 1 1.061 0l1.22 1.22a.75.75 0 0 1 0 1.061l-1.22 1.22a.75.75 0 1 1-1.06-1.06l.689-.69-.69-.69a.75.75 0 0 1 0-1.06Z"
        />
      </SvgWithFillColor>
    );
  }
);

export default SwapWallet;
