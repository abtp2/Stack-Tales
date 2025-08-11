"use client";
import React, { useEffect, useRef, type FC, type ReactNode } from 'react';
import { annotate } from 'rough-notation';

type RoughAnnotationTypeLocal =
  | 'underline'
  | 'box'
  | 'circle'
  | 'highlight'
  | 'strike-through'
  | 'crossed-off'
  | 'bracket';

interface RoughNotationProps {
  children: ReactNode;
  type?: RoughAnnotationTypeLocal;
  color?: string;
  animate?: boolean;
  animationDuration?: number;
  multiline?: boolean;
  show?: boolean;
  padding?: number;
}

const RoughNotation: FC<RoughNotationProps> = ({
  children,
  type = 'underline',
  color = 'rgb(var(--theme))',
  animate = true,
  animationDuration = 1000,
  multiline = false,
  show = true,
  padding = 5
}) => {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (ref.current && show) {
      // Resolve CSS variable if used
      let resolvedColor = color;
      if (color.startsWith('var(')) {
        resolvedColor = getComputedStyle(document.documentElement).getPropertyValue(
          color.slice(4, -1).trim()
        );
      }

      const annotation = annotate(ref.current as HTMLElement, {
        type,
        color: resolvedColor.trim(),
        animate,
        animationDuration,
        multiline,
        padding
      });
      annotation.show();
    }
  }, [type, color, animate, animationDuration, multiline, show, padding]);

  return <span ref={ref}>{children}</span>;
};

export default RoughNotation;