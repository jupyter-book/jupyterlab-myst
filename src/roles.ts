import { GenericNode, ParseTypesEnum, RoleData, RoleSpec } from 'myst-common';

export const evalRole: RoleSpec = {
  name: 'eval',
  body: {
    type: ParseTypesEnum.string,
    required: true
  },
  run(data: RoleData): GenericNode[] {
    const value = data.body as string;
    return [{ type: 'inlineExpression', value }];
  }
};
