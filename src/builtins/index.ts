import { frontMatter } from './front-matter';
import { docutils } from './docutils';
import { amsmath } from './amsmath';
import { mystExtras } from './myst-extras';
import { sphinxMath } from './sphinx-math';

/**
 * Builtin plugins provided by this labextension
 */
export const BUILTINS = [
  frontMatter,
  docutils,
  amsmath,
  mystExtras,
  sphinxMath
];
