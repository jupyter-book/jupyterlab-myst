import React, { createContext, useContext } from 'react';
import { IUserExpressionMetadata } from './metadata';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

type UserExpressionsState = {
  expressions?: IUserExpressionMetadata[];
  rendermime?: IRenderMimeRegistry;
};

const UserExpressionsContext = createContext<UserExpressionsState | undefined>(
  undefined
);

// Create a provider for components to consume and subscribe to changes
export function UserExpressionsProvider({
  expressions,
  rendermime,
  children
}: {
  expressions?: IUserExpressionMetadata[];
  rendermime?: IRenderMimeRegistry;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <UserExpressionsContext.Provider value={{ expressions, rendermime }}>
      {children}
    </UserExpressionsContext.Provider>
  );
}

export function useUserExpressions(): UserExpressionsState {
  return useContext(UserExpressionsContext) ?? {};
}
