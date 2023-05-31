import React, { createContext, useContext } from 'react';
import { IUserExpressionMetadata } from './metadata';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

type UserExpressionsState = {
  expressions?: IUserExpressionMetadata[];
  rendermime?: IRenderMimeRegistry;
  trusted?: boolean;
};

const UserExpressionsContext = createContext<UserExpressionsState | undefined>(
  undefined
);

// Create a provider for components to consume and subscribe to changes
export function UserExpressionsProvider({
  expressions,
  rendermime,
  trusted,
  children
}: {
  expressions?: IUserExpressionMetadata[];
  rendermime?: IRenderMimeRegistry;
  trusted?: boolean;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <UserExpressionsContext.Provider
      value={{ expressions, rendermime, trusted }}
    >
      {children}
    </UserExpressionsContext.Provider>
  );
}

export function useUserExpressions(): UserExpressionsState {
  return useContext(UserExpressionsContext) ?? {};
}
