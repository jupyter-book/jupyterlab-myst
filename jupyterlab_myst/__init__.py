import json
from pathlib import Path
from importlib.metadata import version

__all__ = ["__version__"]
__version__ = version(__name__)

HERE = Path(__file__).parent.resolve()

with (HERE / "labextension" / "package.json").open() as fid:
    data = json.load(fid)


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": data["name"]}]
