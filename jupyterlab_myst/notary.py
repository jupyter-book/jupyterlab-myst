from nbformat.sign import NotebookNotary, yield_code_cells
from nbformat import NotebookNode



def yield_markdown_cells(nb: NotebookNode):
    """Iterator that yields all cells in a notebook
    nbformat version independent
    """
    if nb.nbformat >= 4:  # noqa
        for cell in nb["cells"]:
            if cell["cell_type"] == "markdown":
                yield cell
    elif nb.nbformat == 3:  # noqa
        for ws in nb["worksheets"]:
            for cell in ws["cells"]:
                if cell["cell_type"] == "markdown":
                    yield cell


class MySTNotebookNotary(NotebookNotary):
    def _check_markdown_cell(self, cell, nbformat_version) -> bool:
        """Do we trust an individual Markdown cell?
        Return True if:
        - cell is explicitly trusted
        - cell has no inline expressions
        """
        # explicitly trusted
        if cell["metadata"].pop("trusted", False):
            return True

        # Any expression with a non-error output is considered untrusted
        expressions = cell["metadata"].get("user_expressions", [])
        return all([e.get("result", {}).get("status") == "error" for e in expressions])

    def check_cells(self, nb: NotebookNode) -> bool:
        """Return whether all code/markdown cells are trusted.
        A cell is trusted if the 'trusted' field in its metadata is truthy, or
        if it has no potentially unsafe outputs.
        If there are no code or markdown cells, return True.
        This function is the inverse of mark_cells.
        """
        self.log.debug("Checking if cells are trusted")

        if nb.nbformat < 3:  # noqa
            return False
        trusted = True
        for cell in yield_code_cells(nb):
            # only distrust a cell if it actually has some output to distrust
            if not self._check_cell(cell, nb.nbformat):
                trusted = False
        for cell in yield_markdown_cells(nb):
            # only distrust a cell if it actually has some output to distrust
            if not self._check_markdown_cell(cell, nb.nbformat):
                trusted = False
        return trusted

    def mark_cells(self, nb: NotebookNode, trusted: bool):
        """Mark cells as trusted if the notebook's signature can be verified
        Sets ``cell.metadata.trusted = True | False`` on all code/markdown cells,
        depending on the *trusted* parameter. This will typically be the return
        value from ``self.check_signature(nb)``.
        This function is the inverse of check_cells
        """
        if nb.nbformat < 3:  # noqa
            return

        self.log.debug("Marking cells as trusted")

        for cell in yield_code_cells(nb):
            cell["metadata"]["trusted"] = trusted

        for cell in yield_markdown_cells(nb):
            cell["metadata"]["trusted"] = trusted
