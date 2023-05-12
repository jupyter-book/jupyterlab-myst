---
title: Working with MyST Markdown
subtitle: In JupyterLab
doi: 10.14288/1.0362383
license: CC-BY-4.0
github: https://github.com/executablebooks/myst
subject: Tutorial
venue: Jupyter Journal
biblio:
  volume: '1'
  issue: '1'
authors:
  - name: Rowan Cockett
    email: rowan@curvenote.com
    corresponding: true
    orcid: 0000-0002-7859-8394
    affiliations:
      - Curvenote
      - ExecutableBooks
  - name: Steve Purves
    affiliations:
      - Curvenote
      - ExecutableBooks
math:
  '\dobs': '\mathbf{d}_\text{obs}'
  '\dpred': '\mathbf{d}_\text{pred}\left( #1 \right)'
  '\mref': '\mathbf{m}_\text{ref}'
---

:::{note}
:class: dropdown
This is MyST in a notebook rendered by `jupyterlab-myst`!!
:::

```{figure} https://source.unsplash.com/random/800x200?sunset
:name: hello
:width: 40%
A nice sunset 🌅!!
```

```{figure} https://source.unsplash.com/random/800x200?beach,ocean
:name: fig4
:width: 40%
Relaxing at the beach 🏖
```

This chart shows an example of `using` an interval **selection**[^1] to filter the contents of an attached histogram, allowing the user to see the proportion of items in each category within the selection. See more in the [Altair Documentation](https://altair-viz.github.io/gallery/selection_histogram.html)

[^1]: Footnote text

```{figure} https://source.unsplash.com/random/800x300?beach,ocean
:name: fig3
:width: 80%
Relaxing at the beach
```

```{math}
:label: ok
Ax=b
```

[hello](https://en.wikipedia.org/wiki/OK) or [code](https://github.com/executablebooks/mystjs/blob/main/packages/myst-directives/src/admonition.ts#L5)

[](#ok) [](#hello) [](#cross)

```{warning}
:class: dropdown
ok
```

The residual is the predicted data for the model, $\dpred{m}$, minus the observed data, $\dobs$. You can also calculate the predicted data for the reference model $\dpred{\mref}$.

For example, this [](#cross):

```{math}
:label: equation
\sqrt{\frac{5}{2}}
```

For example, this equation:

```{math}
:label: cross
\mathbf{u} \times \mathbf{v}=\left|\begin{array}{ll}u_{2} & u_{3} \\ v_{2} & v_{3}\end{array}\right| \mathbf{i}+\left|\begin{array}{ll}u_{3} & u_{1} \\ v_{3} & v_{1}\end{array}\right| \mathbf{j}+\left|\begin{array}{ll}u_{1} & u_{2} \\ v_{1} & v_{2}\end{array}\right| \mathbf{k}
```

<div><img src="https://source.unsplash.com/random/800x300?beach,ocean" width="100px"></div>

<!-- just a comment! -->

## Tabs

````{tab-set}
```{tab-item} Tab 1
:sync: tab1
Tab one can sync (see below)!
```
```{tab-item} Tab 2
:sync: tab2
Tab two
```
````

These tabs are set to sync:

````{tab-set}
```{tab-item} Tab 1 - Sync!
:sync: tab1
Tab one can sync!
```
```{tab-item} Tab 2
:sync: tab2
Tab two
```
````

## Grids

::::{grid} 1 1 2 3

:::{grid-item-card}
Text content ✏️
^^^
Structure books with text files and Jupyter Notebooks with minimal configuration.
:::

:::{grid-item-card}
MyST Markdown ✨
^^^
Write MyST Markdown to create enriched documents with publication-quality features.
:::

:::{grid-item-card}
Executable content 🔁
^^^
Execute notebook cells, store results, and insert outputs across pages.
:::
::::

## Cards

:::{card}
MyST Markdown 🚀
^^^
Write content in JupyterLab!
:::
