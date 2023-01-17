import * as React from 'react';
import { IconProps } from './types';
import { SvgWithStrokeColor } from './common';

export const InfoCircle = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 16, color, ...props }) => {
    return (
      <SvgWithStrokeColor
        width={size}
        height={size}
        viewBox="0 0 24 24"
        color={color}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10ZM12 8v5"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.994 16h.01"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgWithStrokeColor>
    );
  }
);

export default InfoCircle;
