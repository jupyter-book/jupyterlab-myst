from ._version import __version__
from .notary import MySTNotebookNotary


def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": "jupyterlab-myst"
    }]


def _load_jupyter_server_extension(app):  # pragma: no cover
    contents = app.contents_manager
    if not isinstance(contents.notary, MySTNotebookNotary):
        contents.notary = MySTNotebookNotary(parent=contents)


def _jupyter_server_extension_points():
    """
    Returns a list of dictionaries with metadata describing
    where to find the `_load_jupyter_server_extension` function.
    """
    return [{"module": "jupyterlab_myst"}]

