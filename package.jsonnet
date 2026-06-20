{
  name: 'jupyterlab-myst',
  version: '2.4.2',
  description: 'Use MyST in JupyterLab',
  keywords: [
    'jupyter',
    'jupyterlab',
    'jupyterlab-extension',
  ],
  homepage: 'https://github.com/jupyter-book/jupyterlab-myst',
  bugs: {
    url: 'https://github.com/jupyter-book/jupyterlab-myst/issues',
  },
  license: 'MIT',
  files: [
    'lib/**/*.{d.ts,eot,gif,html,jpg,js,js.map,json,png,svg,woff2,ttf}',
    'style/**/*.{css,js,eot,gif,html,jpg,json,png,svg,woff2,ttf}',
    'style/index.js',
  ],
  main: 'lib/index.js',
  types: 'lib/index.d.ts',
  style: 'style/index.css',
  repository: {
    type: 'git',
    url: 'https://github.com/jupyter-book/jupyterlab-myst.git',
  },
  scripts: {
    build: 'pnpm run build:css && pnpm run build:lib && pnpm run build:labextension:dev',
    'build:css': 'tailwindcss -m -i ./style/tailwind.css -o style/app.css',
    'build:labextension': 'jupyter-builder build .',
    'build:labextension:dev': 'jupyter-builder build --development True .',
    'build:lib': 'tsc --sourceMap',
    'build:lib:prod': 'tsc',
    'build:prod': 'pnpm run clean && pnpm run build:css && pnpm run build:lib:prod && pnpm run build:labextension',
    clean: 'pnpm run clean:lib',
    'clean:all': 'pnpm run clean:lib && pnpm run clean:labextension && pnpm run clean:lintcache',
    'clean:labextension': 'rimraf jupyterlab_myst/labextension jupyterlab_myst/_version.py',
    'clean:lib': 'rimraf lib tsconfig.tsbuildinfo',
    'clean:lintcache': 'rimraf .eslintcache',
    eslint: 'pnpm run eslint:check --fix',
    'eslint:check': 'eslint . --cache --ext .ts,.tsx',
    'install:extension': 'pnpm run build',
    lint: 'pnpm run prettier && pnpm run eslint',
    'lint:check': 'pnpm run prettier:check && pnpm run eslint:check',
    prettier:'pnpm run prettier:base --write --list-different',
    'prettier:base': 'prettier "**/*{.ts,.tsx,.js,.jsx,.css,.json,.md}"',
    'prettier:check': 'pnpm run prettier:base --check',
    test: 'jest --coverage',
    watch: 'run-p watch:css watch:src watch:labextension',
    'watch:css': 'tailwindcss -w -i ./style/tailwind.css -o style/app.css',
    'watch:labextension': 'jupyter-builder watch .',
    'watch:src': 'tsc -w --sourceMap',
  },
  engines: {
      node: ">=10",
      pnpm: ">=6.0.0"
  },
  packageManager: "pnpm@11",
  // Define grouped dependencies
  local groups = [
    {
      version: '^4.0.0',
      dependencies: [
        '@jupyterlab/application',
        '@jupyterlab/apputils',
        '@jupyterlab/codeeditor',
        '@jupyterlab/markdownviewer',
        '@jupyterlab/notebook',
        '@jupyterlab/rendermime',
        '@jupyterlab/translation',
        '@jupyterlab/attachments',
        '@jupyterlab/cells',
        '@jupyterlab/settingregistry',
        '@jupyterlab/ui-components',

      ],
    },
    {
      version: '1.3.0',
      dependencies: [
        '@myst-theme/diagrams',
        '@myst-theme/frontmatter',
        '@myst-theme/providers',
        // These types are needed for now
        '@myst-theme/search',
        'myst-to-react',

      ],
    },
    {
      version: '1.10.0',
      dependencies: [

        'myst-common',
        'myst-config',
        'myst-frontmatter',
        'myst-spec-ext'
      ],
    },
    {
      version: '1.7.3',
      dependencies: [
        'myst-parser',
        'myst-to-html',
      ],
    },
  ],
  dependencies: {
    [n]: g.version
    for g in groups
    for n in g.dependencies
  } + {
    katex: '^0.16.22',
    // Individually versioned extensions
    'myst-ext-button': '0.0.1',
    'myst-ext-card': '1.0.9',
    'myst-ext-exercise': '1.0.9',
    'myst-ext-grid': '1.1.0',
    'myst-ext-icon': '0.0.2',
    'myst-ext-proof': '1.0.12',
    'myst-ext-reactive': '1.0.9',
    'myst-ext-tabs': '1.0.9',
    'myst-spec': '0.0.5',
    // Floating transforms
    'myst-transforms': '1.3.44',
    // Interfaces
    '@jupyterlab/rendermime-interfaces': '^3.8.0',
    '@jupyterlab/coreutils': '^6.0.0',
    '@jupyterlab/services': '^7.0.0',
    // Lumino
    '@lumino/coreutils': '^2.2.2',
    '@lumino/signaling': '^2.1.5',
    '@lumino/widgets': '^2.8.0',
    // Collaboration
    '@jupyter/ydoc': '^3.0.0',
    // Unified
    'unified': '^10.1.0',
    'unist-util-select': '^4.0.3',
    '@types/mdast': '^3.0.0',
    vfile: '^5.0.0',
    // React
    react: "^18.3.1"
  },
  devDependencies: {
    '@babel/core': '^7.0.0',
    '@babel/preset-env': '^7.0.0',
    // Lab
    '@jupyter/builder': '^1.0.0',
    '@jupyterlab/testutils': '^4.0.0',
    '@module-federation/runtime-tools': '^2.0.0',
    //
    '@myst-theme/styles': '>=0.9.0 <1.0.0',
    '@tailwindcss/typography': '^0.5.8',
    //
    '@types/jest': '^29.2.0',
    '@types/json-schema': '^7.0.11',
    '@types/react': '^18.0.26',
    '@types/react-addons-linked-state-mixin': '^0.14.22',
    '@types/react-dom': '^18.0.9',
    //
    '@typescript-eslint/eslint-plugin': '^6.1.0',
    '@typescript-eslint/parser': '^6.1.0',
    'css-loader': '^6.7.1',
    eslint: '^8.36.0',
    'eslint-config-prettier': '^8.8.0',
    'eslint-plugin-prettier': '^5.0.0',
    jest: '^29.2.0',
    mkdirp: '^1.0.3',
    'npm-run-all': '^4.1.5',
    prettier: '^3.0.0',
    rimraf: '^5.0.1',
    'source-map-loader': '^1.0.2',
    'style-loader': '^3.3.1',
    tailwindcss: '^3.2.4',
    'ts-jest': '^29.1.0',
    typescript: '~5.5.4',
    yjs: '^13.5.40',
  },
  sideEffects: [
    'style/*.css',
    'style/index.js',
  ],
  styleModule: 'style/index.js',
  publishConfig: {
    access: 'public',
  },
  jupyterlab: {
    extension: true,
    outputDir: 'jupyterlab_myst/labextension',
  },
  eslintConfig: {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: 'tsconfig.json',
      sourceType: 'module',
    },
    plugins: [
      '@typescript-eslint',
    ],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: [
            'PascalCase',
          ],
          custom: {
            regex: '^I[A-Z]',
            match: true,
          },
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: false,
        },
      ],
      curly: [
        'error',
        'all',
      ],
      eqeqeq: 'error',
      'prefer-arrow-callback': 'error',
    },
  },
  eslintIgnore: [
    'node_modules',
    'dist',
    'coverage',
    '**/*.d.ts',
    'tests',
    '**/__tests__',
    'ui-tests',
  ],
  prettier: {
    singleQuote: true,
    trailingComma: 'none',
    arrowParens: 'avoid',
    endOfLine: 'auto',
    overrides: [
      {
        files: 'package.json',
        options: {
          tabWidth: 4,
        },
      },
    ],
  }
}
