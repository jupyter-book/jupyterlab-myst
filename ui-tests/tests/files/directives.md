---
title: Directives
date: 2024-04-26
authors:
  - name: Angus Hollands
    affiliations:
      - 2i2c
---

```{note}
:class: dropdown

This is MyST in a notebook rendered by `jupyterlab-myst`!!
```

:::{pull-quote}
We know what we are, but know not what we may be.
:::

They say the owl was a baker’s daughter. Lord, we know what we are, but know not what we may be. God be at your table.

:::{prf:proof}
:label: full-proof
Let $z$ be any other point in $S$ and use the fact that $S$ is a linear subspace to deduce

```{math}
\| y - z \|^2
= \| (y - \hat y) + (\hat y - z) \|^2
= \| y - \hat y \|^2  + \| \hat y - z  \|^2
```

Hence $\| y - z \| \geq \| y - \hat y \|$, which completes the proof.
:::

```{mermaid}
flowchart LR
  A[Jupyter Notebook] --> C
  B[MyST Markdown] --> C
  C(mystmd) --> D{AST}
  D <--> E[LaTeX]
  E --> F[PDF]
  D --> G[Word]
  D --> H[React]
  D --> I[HTML]
  D <--> J[JATS]
```
