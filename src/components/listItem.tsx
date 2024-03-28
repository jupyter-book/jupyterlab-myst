import React from 'react';
import { useTaskItemController } from '../providers';
import { MyST } from 'myst-to-react';

function TaskItem({
  checked,
  line,
  children
}: {
  checked?: boolean;
  children?: React.ReactNode;
  line?: number;
}) {
  // The rendering waiting on promises from Jupyter is slow
  // By keeping state here we can render fast & optimistically
  const [local, setLocal] = React.useState(checked ?? false);
  const { controller } = useTaskItemController();
  return (
    <li className="task-list-item">
      <input
        type="checkbox"
        disabled={!controller}
        className="task-list-item-checkbox"
        checked={local}
        onClick={() => {
          // Bail if no line number was found
          if (!controller || line === undefined) {
            return;
          }
          controller({ line: line - 1, checked: !local });
          setLocal(!local);
        }}
      />
      {children}
    </li>
  );
}

export function ListItem({
  checked,
  line,
  children
}: {
  checked?: boolean;
  line?: number;
  children?: any[];
}): JSX.Element {
  if (typeof checked === 'boolean') {
    return (
      <TaskItem checked={checked} line={line}>
        <MyST ast={children} />
      </TaskItem>
    );
  }
  return (
    <li>
      <MyST ast={children} />
    </li>
  );
}
