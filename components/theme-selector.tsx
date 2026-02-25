"use client";

import { useCanvas } from '@/context/canvas-provider';

const ThemeSelector = () => {
  const { themes, theme: currentTheme, setTheme } = useCanvas();
  return (
    <div>ThemeSelector</div>
  )
}

export default ThemeSelector;