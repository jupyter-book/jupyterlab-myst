import { LabIcon } from '@jupyterlab/ui-components';

import mystIconSvg from '../style/mystlogo.svg';

export const mystIcon = new LabIcon({
  name: 'jupyterlab-myst:mystIcon',
  svgstr: mystIconSvg
});
