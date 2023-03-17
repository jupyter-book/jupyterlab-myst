import pytest
import nbformat
import jupyterlab_myst.notary
import pathlib
import tempfile


@pytest.fixture
def notary():
    with tempfile.TemporaryDirectory() as d:
        yield jupyterlab_myst.notary.MySTNotebookNotary(data_dir=d)


@pytest.fixture
def notebooks_path():
    return pathlib.Path(__file__).parent / "notebooks"


def test_inline_markdown(notebooks_path, notary):
    nb = nbformat.read(notebooks_path / "inline-markdown.ipynb", as_version=nbformat.NO_CONVERT)
    assert not notary.check_cells(nb)


def test_simple_code(notebooks_path, notary):
    nb = nbformat.read(notebooks_path / "simple-code.ipynb", as_version=nbformat.NO_CONVERT)
    assert notary.check_cells(nb)


def test_simple_markdown(notebooks_path, notary):
    nb = nbformat.read(notebooks_path / "simple-markdown.ipynb", as_version=nbformat.NO_CONVERT)
    assert notary.check_cells(nb)


def test_rich_code(notebooks_path, notary):
    nb = nbformat.read(notebooks_path / "rich-code.ipynb", as_version=nbformat.NO_CONVERT)
    assert not notary.check_cells(nb)
