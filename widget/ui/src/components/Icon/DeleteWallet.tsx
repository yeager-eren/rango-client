import * as React from 'react';
import { IconProps } from './types';

export const DeleteWallet = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 50, ...props }) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.627 7.205a3.018 3.018 0 0 0-3.01 3.01v3.076a4.749 4.749 0 0 1 6.5 4.414c0 .808-.205 1.579-.573 2.25h8.563a3.018 3.018 0 0 0 3.01-3.01v-.44h-1.15c-1.41 0-2.777-1.03-2.907-2.553a2.759 2.759 0 0 1 .817-2.227 2.743 2.743 0 0 1 1.97-.82h1.27v-.69a3.018 3.018 0 0 0-3.01-3.01H6.627Zm-4.51 3.01a4.518 4.518 0 0 1 4.51-4.51h11.48a4.518 4.518 0 0 1 4.51 4.51v1.44a.75.75 0 0 1-.75.75h-2.02c-.359 0-.675.14-.902.373l-.014.014c-.266.26-.415.63-.377 1.022v.009c.054.635.664 1.182 1.413 1.182h1.9a.75.75 0 0 1 .75.75v1.19a4.518 4.518 0 0 1-4.51 4.51H7.997a.75.75 0 0 1-.482-1.325c.243-.203.457-.456.624-.743l.01-.016a3.17 3.17 0 0 0 .468-1.666 3.249 3.249 0 0 0-5.282-2.533.75.75 0 0 1-1.218-.587v-4.37Z"
          fill="#000"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.467 2.655a1.15 1.15 0 0 0-1.554-1.079l-7.94 3a2.098 2.098 0 0 0-1.356 1.97v4.569a.75.75 0 1 1-1.5 0v-4.57c0-1.5.922-2.84 2.325-3.371l7.94-3c1.732-.657 3.585.629 3.585 2.481v3.8a.75.75 0 0 1-1.5 0v-3.8ZM19.846 12.405c-.359 0-.675.14-.903.373l-.013.014c-.266.26-.415.63-.377 1.022v.009c.053.635.664 1.182 1.413 1.182h1.943a.276.276 0 0 0 .267-.27v-2.06a.276.276 0 0 0-.267-.27h-2.063Zm-1.97-.68a2.743 2.743 0 0 1 1.97-.82h2.107a1.777 1.777 0 0 1 1.723 1.77v2.06a1.777 1.777 0 0 1-1.75 1.77h-1.96c-1.41 0-2.778-1.03-2.907-2.553a2.759 2.759 0 0 1 .816-2.227Z"
          fill="#000"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.617 10.705a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75ZM5.367 14.455c-.761 0-1.468.267-2.032.717h-.002a3.22 3.22 0 0 0-1.216 2.533c0 .61.17 1.183.469 1.666l.006.01a3.22 3.22 0 0 0 2.775 1.574 3.155 3.155 0 0 0 2.148-.825c.243-.203.457-.456.624-.743l.01-.016a3.17 3.17 0 0 0 .468-1.666 3.249 3.249 0 0 0-3.25-3.25ZM2.4 13.998a4.749 4.749 0 0 1 7.717 3.707 4.67 4.67 0 0 1-.687 2.446c-.25.427-.57.808-.94 1.12a4.655 4.655 0 0 1-3.123 1.184 4.72 4.72 0 0 1-4.061-2.301 4.67 4.67 0 0 1-.689-2.449A4.72 4.72 0 0 1 2.4 13.998Z"
          fill="#000"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.785 16.106a.75.75 0 0 1 1.06-.003l2.12 2.11a.75.75 0 1 1-1.058 1.064l-2.12-2.11a.75.75 0 0 1-.002-1.061Z"
          fill="#000"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.948 16.136a.75.75 0 0 1-.002 1.06l-2.12 2.11a.75.75 0 0 1-1.058-1.063l2.12-2.11a.75.75 0 0 1 1.06.003Z"
          fill="#000"
        />
      </svg>
    );
  }
);

export default DeleteWallet;
