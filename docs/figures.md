---
title: Images and figures
description: MyST Markdown allows you to create images and figures in your documents, including cross-referencing content throughout your pages.
thumbnail: ./thumbnails/todo.png
---

MyST Markdown can be used to include images and figures in your notebooks as well as referencing those images easily in other cells of the notebook.

```{tip}
For a general description of the MyST figures and image directives see the [main MyST docs](https://myst-tools.org/docs/mystjs/figures) at https://myst-tools.org, read on for notebook specific consideratons
```

## Simple images

Adding an imge to your notebook using the standard Markdown syntax will work as usual with the standard markdown syntax:

```md
![alt](link 'title')
```

## Figure Directives

By switching to MyST Directives or figures (and images) can be inserted with some additional control. `figure`s can also be cross-referenced in other places in the notebook. For example, the following `figure`:

````{myst}
```{figure} https://source.unsplash.com/random/400x200?beach,ocean
:name: myFigure
:alt: Random image of the beach or ocean!
:align: center

Randomized beach and ocean images from Unsplash 🏖
```
````

Has a `name` attribute which can then be cross-referenced any other markdown cell in the notebook using the familiar markdown link syntax:

```{myst}
Check out [](#myFigure)!!
```

The `figure` directive is similar to `image` but allows for a caption and sequential figure numbering.

## Cell attachments

Notebooks allow images to be added as cell attachments. This is typically acheived via drag and drop in the ntoebook interface and results in the image being added to the notebook itself as a base64 encoded string.

Cell attachements are inserted into the notebook using standard markdown syntax such as:

```{md}
![image.png](attachment:7c0e625d-6238-464f-8100-8d008f30848b.png)
```

These links are inserted automatically by jupyter when an attachement is added. Once the link syntax is known these can be changed to `image` or `figure` directives where captions can be added attributes can be used to, for example control the image size

````{myst}
```{image} attachment:7c0e625d-6238-464f-8100-8d008f30848b.png
:alt: MysST Tools
:width: 800px
```
````

Attachments are cell specific, so this will only work in the same cell that the attachment was added.