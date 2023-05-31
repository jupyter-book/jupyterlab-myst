import React, { createContext, useContext } from 'react';

export interface ITextModel {
  getSource(): string;
  setSource(source: string): void;
}

type TextModelState = {
  model?: ITextModel;
};

const TextModelContext = createContext<TextModelState | undefined>(undefined);

// Create a provider for components to consume and subscribe to changes
export function TextModelProvider({
  model,
  children
}: {
  model?: ITextModel;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <TextModelContext.Provider value={{ model }}>
      {children}
    </TextModelContext.Provider>
  );
}

export function useTextModel(): TextModelState {
  return useContext(TextModelContext) ?? {};
}
