# jupyterlab-myst

![Github Actions Status](https://github.com/executablebooks/jupyterlab-myst/workflows/Build/badge.svg)[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/executablebooks/jupyterlab-myst/main?urlpath=lab)

A Myst renderer for JupyterLab.

This is a repository to track to-do items and potentially infrastructure around integrating the MyST language with JupyterLab (or potentially other Jupyter interfaces).

🛑🛑EXPERIMENTAL🛑🛑 - this repository is in the early stages and may evolve rapidly. Please do try it out, and provide feedback if you like, but it is not production ready.

## Requirements

* JupyterLab >= 3.0

## Install

To install the extension, execute:

```bash
pip install jupyterlab-myst
```

To enable `eval` rendering, install the `eval` extra:
```bash
pip install "jupyterlab-myst[eval]"
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab-myst
```


## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab-myst directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall jupyterlab-myst
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlab-myst` within that folder.
