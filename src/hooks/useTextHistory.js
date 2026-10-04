import { useCallback, useMemo, useState } from 'react';

const MAX_HISTORY = 80;

const initialEntry = {
  text: '',
  actionId: null,
  label: null,
};

export function useTextHistory() {
  const [state, setState] = useState({
    entries: [initialEntry],
    index: 0,
  });

  const present = state.entries[state.index] ?? initialEntry;
  const canUndo = state.index > 0;
  const canRedo = state.index < state.entries.length - 1;

  const replaceCurrent = useCallback((text, { keepAction = false } = {}) => {
    setState((prev) => {
      const base = prev.entries.slice(0, prev.index + 1);
      const current = base[base.length - 1] ?? initialEntry;
      if (current.text === text) {
        if (base.length === prev.entries.length) return prev;
        return { entries: base, index: base.length - 1 };
      }

      const nextEntry = keepAction
        ? { ...current, text }
        : { ...current, text, actionId: null, label: null };

      const entries = [...base.slice(0, -1), nextEntry];
      return { entries, index: entries.length - 1 };
    });
  }, []);

  const commit = useCallback((text, { actionId = null, label = null } = {}) => {
    setState((prev) => {
      const base = prev.entries.slice(0, prev.index + 1);
      const current = base[base.length - 1] ?? initialEntry;

      if (current.text === text && current.actionId === actionId) {
        if (base.length === prev.entries.length) return prev;
        return { entries: base, index: base.length - 1 };
      }

      const entries = [...base, { text, actionId, label }].slice(-MAX_HISTORY);
      return { entries, index: entries.length - 1 };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) =>
      prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev,
    );
  }, []);

  const redo = useCallback(() => {
    setState((prev) =>
      prev.index < prev.entries.length - 1
        ? { ...prev, index: prev.index + 1 }
        : prev,
    );
  }, []);

  return useMemo(
    () => ({
      text: present.text,
      actionId: present.actionId,
      label: present.label,
      canUndo,
      canRedo,
      replaceCurrent,
      commit,
      undo,
      redo,
    }),
    [
      present.text,
      present.actionId,
      present.label,
      canUndo,
      canRedo,
      replaceCurrent,
      commit,
      undo,
      redo,
    ],
  );
}
