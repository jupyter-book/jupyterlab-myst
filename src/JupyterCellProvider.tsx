import React, { createContext, useContext } from 'react';
import type { MySTMarkdownCell } from './MySTMarkdownCell';

type JupyterCellState = {
  cell?: MySTMarkdownCell;
};

const JupyterCellContext = createContext<JupyterCellState | undefined>(
  undefined
);

// Create a provider for components to consume and subscribe to changes
export function JupyterCellProvider({
  cell,
  children
}: {
  cell?: MySTMarkdownCell;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <JupyterCellContext.Provider value={{ cell }}>
      {children}
    </JupyterCellContext.Provider>
  );
}

export function useJupyterCell(): JupyterCellState {
  const state = useContext(JupyterCellContext) ?? {};
  return state;
}
