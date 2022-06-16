import json
from pathlib import Path
from importlib_metadata import version

__all__ = ["__version__"]
# Distribution name, not package name!
__version__ = version("jupyterlab-myst") 


def _jupyter_labextension_paths():
    here = Path(__file__).parent.resolve()
    with (here / "labextension" / "package.json").open() as fid:
        data = json.load(fid)
    return [{"src": "labextension", "dest": data["name"]}]
