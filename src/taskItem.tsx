import React from 'react';
import { NodeRenderer } from '@myst-theme/providers';
import type { ListItem } from 'myst-spec-ext';
import { useJupyterCell } from './JupyterCellProvider';

function TaskItem({
  checked,
  line,
  children
}: {
  checked?: boolean;
  children: React.ReactNode;
  line?: number;
}) {
  // The rendering waiting on promises from Jupyter is slow
  // By keeping state here we can render fast & optimistically
  const [local, setLocal] = React.useState(checked ?? false);
  const { cell } = useJupyterCell();
  return (
    <li className="task-list-item">
      <input
        type="checkbox"
        disabled={!cell}
        className="task-list-item-checkbox"
        checked={local}
        onClick={() => {
          // Bail if no line number was found
          if (!cell || line == null) return;
          const text = cell.model.value.text;
          // This is a pretty cautious replacement for the identified line
          const lines = text.split('\n');
          lines[line] = lines[line].replace(
            /^(\s*(?:-|\*)\s*)(\[[\s|x]\])/,
            local ? '$1[ ]' : '$1[x]'
          );
          setLocal(!local);
          // Update the Jupyter cell markdown value
          cell.model.value.text = lines.join('\n');
        }}
      />
      {children}
    </li>
  );
}

export const listItem: NodeRenderer<ListItem> = (node, children) => {
  if (node.checked == null) {
    return <li key={node.key}>{children}</li>;
  }
  return (
    <TaskItem
      key={node.key}
      checked={node.checked}
      line={node.position?.start.line}
    >
      {children}
    </TaskItem>
  );
};
