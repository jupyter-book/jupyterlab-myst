import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import React, { createContext, useContext } from 'react';
import { IUserExpressionMetadata } from './metadata';

type MetadataState = {
  metadata?: IUserExpressionMetadata[];
  trusted?: boolean;
  rendermime?: IRenderMimeRegistry;
};

const MetadataContext = createContext<MetadataState | undefined>(undefined);

// Create a provider for components to consume and subscribe to changes
export function CellMetadataProvider({
  metadata,
  trusted,
  rendermime,
  children
}: {
  metadata: IUserExpressionMetadata[] | undefined;
  trusted: boolean;
  rendermime: IRenderMimeRegistry;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <MetadataContext.Provider value={{ metadata, trusted, rendermime }}>
      {children}
    </MetadataContext.Provider>
  );
}

export function useCellMetadata(): MetadataState {
  const state = useContext(MetadataContext) ?? {};
  return state;
}
