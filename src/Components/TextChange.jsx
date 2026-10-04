import { useEffect, useMemo, useRef, useState } from 'react';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import { useTextHistory } from '../hooks/useTextHistory';
import { copyTextToClipboard } from '../utils/clipboard';
import {
  ALL_CASE_ACTIONS,
  CASE_GROUPS,
  SAMPLE_TEXT,
  getCaseActionById,
} from '../utils/caseConverters';
import { downloadTextFile } from '../utils/downloadText';
import { QUICK_ACTIONS } from '../utils/quickActions';
import {
  addRecentItem,
  formatRelativeTime,
  loadRecentItems,
} from '../utils/recent';
import { getTextStats } from '../utils/textStats';
import './TextChange.css';

const COPY_RESET_MS = 1800;
const GITHUB_URL = 'https://github.com/mrhassansaif/change-text-case';

const tooltipTheme = createTheme({
  palette: { mode: 'dark' },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'var(--surface-elevated)',
          color: 'var(--text-primary)',
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        },
        arrow: {
          color: 'var(--surface-elevated)',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: 'var(--surface-elevated)',
          backgroundImage: 'none',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-elevated)',
        },
      },
    },
  },
});

function getModifierKeyLabel() {
  if (typeof navigator === 'undefined') return 'Ctrl';
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || '') ? '⌘' : 'Ctrl';
}

function renderActionIconButton({
  title,
  ariaLabel,
  onClick,
  disabled,
  className = '',
  children,
}) {
  return (
    <Tooltip title={title} arrow enterDelay={300}>
      <span>
        <button
          type="button"
          className={`icon-button ${className}`.trim()}
          onClick={onClick}
          disabled={disabled}
          aria-label={ariaLabel || title}
        >
          {children}
        </button>
      </span>
    </Tooltip>
  );
}

function TextChange() {
  const {
    text,
    actionId,
    label,
    canUndo,
    canRedo,
    replaceCurrent,
    commit,
    undo,
    redo,
  } = useTextHistory();

  const [mode, setMode] = useState('inplace');
  const [recentItems, setRecentItems] = useState([]);
  const [recentOpen, setRecentOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [copyState, setCopyState] = useState('idle');
  const [resultCopyState, setResultCopyState] = useState('idle');
  const [downloadState, setDownloadState] = useState('idle');
  const [surprisePulse, setSurprisePulse] = useState(false);
  const [shortcutsAnchor, setShortcutsAnchor] = useState(null);
  const [now, setNow] = useState(Date.now());

  const copyTimer = useRef(null);
  const resultCopyTimer = useRef(null);
  const downloadTimer = useRef(null);
  const surpriseTimer = useRef(null);

  const isPreserve = mode === 'preserve';
  const activeAction = getCaseActionById(actionId);
  const resultText = useMemo(() => {
    if (!isPreserve) return text;
    if (!activeAction) return '';
    return activeAction.transform(text);
  }, [isPreserve, activeAction, text]);

  const outputText = isPreserve ? resultText : text;
  const statsSource = isPreserve && resultText ? resultText : text;
  const stats = useMemo(() => getTextStats(statsSource), [statsSource]);
  const hasText = text.length > 0;
  const hasOutput = outputText.length > 0;
  const modKey = getModifierKeyLabel();

  useEffect(() => {
    setRecentItems(loadRecentItems());
  }, []);

  useEffect(() => {
    if (!recentOpen) return undefined;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, [recentOpen]);

  useEffect(() => {
    return () => {
      [copyTimer, resultCopyTimer, downloadTimer, surpriseTimer].forEach((ref) => {
        if (ref.current) clearTimeout(ref.current);
      });
    };
  }, []);

  const rememberRecent = (nextText, nextLabel, nextActionId) => {
    if (!nextText?.trim() || !nextLabel) return;
    setRecentItems(
      addRecentItem({
        text: nextText,
        label: nextLabel,
        actionId: nextActionId,
      }),
    );
  };

  const scheduleState = (setter, timerRef, nextState) => {
    setter(nextState);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setter('idle'), COPY_RESET_MS);
  };

  const handleCopyValue = async (value, setter, timerRef) => {
    if (!value) return;
    try {
      await copyTextToClipboard(value);
      scheduleState(setter, timerRef, 'copied');
    } catch {
      scheduleState(setter, timerRef, 'error');
    }
  };

  const handleEditorChange = (event) => {
    replaceCurrent(event.target.value, { keepAction: isPreserve });
    if (copyState !== 'idle') setCopyState('idle');
    if (resultCopyState !== 'idle') setResultCopyState('idle');
  };

  const applyTransform = (action) => {
    if (!hasText) return;

    if (isPreserve) {
      commit(text, { actionId: action.id, label: action.label });
      rememberRecent(action.transform(text), action.label, action.id);
      return;
    }

    const next = action.transform(text);
    commit(next, { actionId: action.id, label: action.label });
    rememberRecent(next, action.label, action.id);
  };

  const applyQuickAction = (action) => {
    if (!hasText) return;
    const next = action.transform(text);
    if (next === text) return;

    // In Keep original mode, keep the selected case so the result pane stays useful.
    const nextActionId = isPreserve ? actionId : action.id;
    commit(next, { actionId: nextActionId, label: action.label });

    const recentText =
      isPreserve && activeAction ? activeAction.transform(next) : next;
    rememberRecent(recentText, action.label, action.id);
  };

  const handleClear = () => {
    if (!hasText && !actionId) return;
    commit('', { actionId: null, label: null });
    setCopyState('idle');
    setResultCopyState('idle');
  };

  const handleSample = () => {
    commit(SAMPLE_TEXT, { actionId: null, label: null });
  };

  const handleDownload = () => {
    if (!hasOutput) return;
    const ok = downloadTextFile(outputText, 'reactcase-output.txt');
    scheduleState(setDownloadState, downloadTimer, ok ? 'done' : 'error');
  };

  const handleSurprise = () => {
    if (!hasText) return;
    const action =
      ALL_CASE_ACTIONS[Math.floor(Math.random() * ALL_CASE_ACTIONS.length)];
    applyTransform(action);
    setSurprisePulse(true);
    if (surpriseTimer.current) clearTimeout(surpriseTimer.current);
    surpriseTimer.current = setTimeout(() => setSurprisePulse(false), 700);
  };

  const handleRestoreRecent = (item) => {
    commit(item.text, {
      actionId: item.actionId ?? null,
      label: item.label ?? 'Recent',
    });
    setRecentOpen(false);
  };

  const handleReapplyActive = () => {
    if (!activeAction || !hasText) return;
    applyTransform(activeAction);
  };

  const shortcutStateRef = useRef({});
  shortcutStateRef.current = {
    outputText,
    canUndo,
    canRedo,
    undo,
    redo,
    activeAction,
    hasText,
    actionId,
    shortcutsAnchor,
    handleClear,
    handleReapplyActive,
    handleCopyValue,
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;
      const target = event.target;
      const tag = target?.tagName?.toLowerCase();
      const isFormField =
        tag === 'textarea' ||
        tag === 'input' ||
        target?.isContentEditable;
      const current = shortcutStateRef.current;

      if (mod && event.shiftKey && key === 'c') {
        event.preventDefault();
        current.handleCopyValue(current.outputText, setCopyState, copyTimer);
        return;
      }

      if (mod && event.shiftKey && key === 'z') {
        event.preventDefault();
        if (current.canRedo) current.redo();
        return;
      }

      if (mod && key === 'z' && !event.shiftKey) {
        // Controlled textarea undo is limited; use app history.
        event.preventDefault();
        if (current.canUndo) current.undo();
        return;
      }

      if (mod && key === 'enter') {
        if (!current.activeAction || !current.hasText) return;
        event.preventDefault();
        current.handleReapplyActive();
        return;
      }

      if (key === 'escape') {
        if (current.shortcutsAnchor) {
          setShortcutsAnchor(null);
          return;
        }
        if (isFormField && (current.hasText || current.actionId)) {
          event.preventDefault();
          current.handleClear();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const copyTooltip =
    copyState === 'error'
      ? 'Copy failed'
      : copyState === 'copied'
        ? 'Copied'
        : `Copy text (${modKey}+Shift+C)`;

  const resultCopyTooltip =
    resultCopyState === 'error'
      ? 'Copy failed'
      : resultCopyState === 'copied'
        ? 'Copied'
        : 'Copy result';

  const downloadTooltip =
    downloadState === 'done'
      ? 'Downloaded'
      : downloadState === 'error'
        ? 'Download failed'
        : 'Download .txt';

  const primaryStats = (
    <>
      <span>
        {stats.words} {stats.words === 1 ? 'word' : 'words'}
      </span>
      <span className="stat-dot" aria-hidden="true">
        ·
      </span>
      <span>
        {stats.characters}{' '}
        {stats.characters === 1 ? 'character' : 'characters'}
      </span>
      <span className="stat-dot" aria-hidden="true">
        ·
      </span>
      <span>
        {stats.lines} {stats.lines === 1 ? 'line' : 'lines'}
      </span>
    </>
  );

  return (
    <ThemeProvider theme={tooltipTheme}>
      <div className="app-shell">
        <div className="app-glow" aria-hidden="true" />
        <div className="app-noise" aria-hidden="true" />

        <main className={`app-main${isPreserve ? ' is-split' : ''}`}>
          <header className="app-header">
            <h1 className="app-brand">ReactCase Wizard</h1>
            <p className="app-tagline">Transform text instantly.</p>
          </header>

          <div className="mode-bar">
            <div className="mode-switch" role="group" aria-label="Editor mode">
              <button
                type="button"
                className={`mode-button${mode === 'inplace' ? ' is-active' : ''}`}
                onClick={() => setMode('inplace')}
                aria-pressed={mode === 'inplace'}
              >
                Transform in place
              </button>
              <button
                type="button"
                className={`mode-button${mode === 'preserve' ? ' is-active' : ''}`}
                onClick={() => setMode('preserve')}
                aria-pressed={mode === 'preserve'}
              >
                Keep original
              </button>
            </div>

            <div className="mode-bar-actions">
              {renderActionIconButton({
                title: 'Shortcuts',
                onClick: (event) => setShortcutsAnchor(event.currentTarget),
                children: <KeyboardRoundedIcon fontSize="small" />,
              })}
            </div>
          </div>

          {!isPreserve ? (
            <section className="editor-card" aria-label="Text editor">
              <div className="editor-toolbar">
                <div className="editor-labels">
                  <label htmlFor="text-editor" className="editor-label">
                    Your text
                  </label>
                  <span className="editor-helper">Type or paste anything.</span>
                </div>

                {!hasText && (
                  <button
                    type="button"
                    className="sample-button"
                    onClick={handleSample}
                  >
                    Try sample
                  </button>
                )}
              </div>

              <div className="editor-surface">
                <textarea
                  id="text-editor"
                  className="editor-textarea"
                  value={text}
                  onChange={handleEditorChange}
                  placeholder="Start typing, or paste text to transform…"
                  spellCheck="true"
                  rows={10}
                />
              </div>

              <div className="editor-footer">
                <div className="stats-cluster">
                  <p className="editor-stats" aria-live="polite">
                    {primaryStats}
                  </p>
                  <button
                    type="button"
                    className={`stats-toggle${statsOpen ? ' is-open' : ''}`}
                    onClick={() => setStatsOpen((open) => !open)}
                    aria-expanded={statsOpen}
                  >
                    More
                    <ExpandMoreRoundedIcon fontSize="inherit" />
                  </button>
                </div>

                <div className="editor-actions">
                  {renderActionIconButton({
                    title: `Undo (${modKey}+Z)`,
                    onClick: undo,
                    disabled: !canUndo,
                    children: <UndoRoundedIcon fontSize="small" />,
                  })}
                  {renderActionIconButton({
                    title: `Redo (${modKey}+Shift+Z)`,
                    onClick: redo,
                    disabled: !canRedo,
                    children: <RedoRoundedIcon fontSize="small" />,
                  })}
                  {renderActionIconButton({
                    title: 'Clear text',
                    onClick: handleClear,
                    disabled: !hasText && !actionId,
                    children: <DeleteOutlineRoundedIcon fontSize="small" />,
                  })}
                  {renderActionIconButton({
                    title: downloadTooltip,
                    onClick: handleDownload,
                    disabled: !hasOutput,
                    className: downloadState === 'done' ? 'is-success' : '',
                    children: <DownloadRoundedIcon fontSize="small" />,
                  })}
                  {renderActionIconButton({
                    title: copyTooltip,
                    onClick: () =>
                      handleCopyValue(outputText, setCopyState, copyTimer),
                    disabled: !hasOutput,
                    className: `copy-button${copyState === 'copied' ? ' is-copied' : ''}${copyState === 'error' ? ' is-error' : ''}`,
                    children: (
                      <>
                        {copyState === 'copied' ? (
                          <CheckRoundedIcon fontSize="small" />
                        ) : (
                          <ContentCopyRoundedIcon fontSize="small" />
                        )}
                        <span className="copy-label">
                          {copyState === 'copied'
                            ? 'Copied'
                            : copyState === 'error'
                              ? 'Failed'
                              : 'Copy'}
                        </span>
                      </>
                    ),
                  })}
                </div>
              </div>

              {statsOpen && (
                <div className="stats-details" aria-live="polite">
                  <span>
                    {stats.charactersNoSpaces} without spaces
                  </span>
                  <span className="stat-dot" aria-hidden="true">
                    ·
                  </span>
                  <span>
                    {stats.sentences}{' '}
                    {stats.sentences === 1 ? 'sentence' : 'sentences'}
                  </span>
                </div>
              )}
            </section>
          ) : (
            <section className="split-editor" aria-label="Original and result editors">
              <div className="editor-card pane-card">
                <div className="editor-toolbar">
                  <div className="editor-labels">
                    <label htmlFor="original-editor" className="editor-label">
                      Original
                    </label>
                    <span className="editor-helper">Editable source text.</span>
                  </div>
                  {!hasText && (
                    <button
                      type="button"
                      className="sample-button"
                      onClick={handleSample}
                    >
                      Try sample
                    </button>
                  )}
                </div>
                <div className="editor-surface">
                  <textarea
                    id="original-editor"
                    className="editor-textarea is-compact"
                    value={text}
                    onChange={handleEditorChange}
                    placeholder="Type or paste original text…"
                    spellCheck="true"
                    rows={8}
                  />
                </div>
                <div className="editor-footer is-compact">
                  <div className="editor-actions">
                    {renderActionIconButton({
                      title: `Undo (${modKey}+Z)`,
                      onClick: undo,
                      disabled: !canUndo,
                      children: <UndoRoundedIcon fontSize="small" />,
                    })}
                    {renderActionIconButton({
                      title: `Redo (${modKey}+Shift+Z)`,
                      onClick: redo,
                      disabled: !canRedo,
                      children: <RedoRoundedIcon fontSize="small" />,
                    })}
                    {renderActionIconButton({
                      title: 'Clear text',
                      onClick: handleClear,
                      disabled: !hasText && !actionId,
                      children: <DeleteOutlineRoundedIcon fontSize="small" />,
                    })}
                  </div>
                </div>
              </div>

              <div className="split-indicator" aria-hidden="true">
                <span className="split-arrow">↓</span>
                <span className="split-action-label">
                  {label || activeAction?.label || 'Choose a case'}
                </span>
              </div>

              <div className="editor-card pane-card result-card">
                <div className="editor-toolbar">
                  <div className="editor-labels">
                    <span className="editor-label" id="result-label">
                      Result
                    </span>
                    <span className="editor-helper">
                      Generated from the original.
                    </span>
                  </div>
                </div>
                <div className="editor-surface">
                  <textarea
                    className="editor-textarea is-compact is-readonly"
                    value={resultText}
                    readOnly
                    aria-labelledby="result-label"
                    placeholder={
                      hasText
                        ? 'Select a transformation to see the result…'
                        : 'Result appears here…'
                    }
                    rows={8}
                  />
                </div>
                <div className="editor-footer">
                  <div className="stats-cluster">
                    <p className="editor-stats" aria-live="polite">
                      {primaryStats}
                    </p>
                    <button
                      type="button"
                      className={`stats-toggle${statsOpen ? ' is-open' : ''}`}
                      onClick={() => setStatsOpen((open) => !open)}
                      aria-expanded={statsOpen}
                    >
                      More
                      <ExpandMoreRoundedIcon fontSize="inherit" />
                    </button>
                  </div>
                  <div className="editor-actions">
                    {renderActionIconButton({
                      title: downloadTooltip,
                      onClick: handleDownload,
                      disabled: !hasOutput,
                      className: downloadState === 'done' ? 'is-success' : '',
                      children: <DownloadRoundedIcon fontSize="small" />,
                    })}
                    {renderActionIconButton({
                      title: resultCopyTooltip,
                      onClick: () =>
                        handleCopyValue(
                          resultText,
                          setResultCopyState,
                          resultCopyTimer,
                        ),
                      disabled: !hasOutput,
                      className: `copy-button${resultCopyState === 'copied' ? ' is-copied' : ''}${resultCopyState === 'error' ? ' is-error' : ''}`,
                      children: (
                        <>
                          {resultCopyState === 'copied' ? (
                            <CheckRoundedIcon fontSize="small" />
                          ) : (
                            <ContentCopyRoundedIcon fontSize="small" />
                          )}
                          <span className="copy-label">
                            {resultCopyState === 'copied'
                              ? 'Copied'
                              : resultCopyState === 'error'
                                ? 'Failed'
                                : 'Copy'}
                          </span>
                        </>
                      ),
                    })}
                  </div>
                </div>
                {statsOpen && (
                  <div className="stats-details" aria-live="polite">
                    <span>
                      {stats.charactersNoSpaces} without spaces
                    </span>
                    <span className="stat-dot" aria-hidden="true">
                      ·
                    </span>
                    <span>
                      {stats.sentences}{' '}
                      {stats.sentences === 1 ? 'sentence' : 'sentences'}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="case-panel" aria-label="Case conversion controls">
            {CASE_GROUPS.map((group) => (
              <div key={group.id} className="case-group">
                <div className="case-group-header">
                  <h2 className="case-group-label">{group.label}</h2>
                  {group.id === 'fun' && (
                    <button
                      type="button"
                      className={`surprise-button${surprisePulse ? ' is-pulse' : ''}`}
                      onClick={handleSurprise}
                      disabled={!hasText}
                    >
                      <AutoAwesomeRoundedIcon fontSize="inherit" />
                      Surprise me
                    </button>
                  )}
                </div>
                <div
                  className="case-button-row"
                  role="group"
                  aria-label={group.label}
                >
                  {group.actions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      className={`case-button${actionId === action.id ? ' is-active' : ''}`}
                      onClick={() => applyTransform(action)}
                      disabled={!hasText}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="utility-panel" aria-label="Quick actions">
            <h2 className="case-group-label">Quick actions</h2>
            <div className="case-button-row" role="group" aria-label="Quick actions">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={`case-button${actionId === action.id ? ' is-active' : ''}`}
                  onClick={() => applyQuickAction(action)}
                  disabled={!hasText}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </section>

          <section className="recent-panel">
            <button
              type="button"
              className={`recent-toggle${recentOpen ? ' is-open' : ''}`}
              onClick={() => setRecentOpen((open) => !open)}
              aria-expanded={recentOpen}
            >
              <span className="case-group-label">Recent</span>
              <ExpandMoreRoundedIcon fontSize="small" />
            </button>

            {recentOpen && (
              <div className="recent-list">
                {recentItems.length === 0 ? (
                  <p className="recent-empty">No recent transformations yet.</p>
                ) : (
                  recentItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="recent-item"
                      onClick={() => handleRestoreRecent(item)}
                    >
                      <span className="recent-text">
                        {item.text.replace(/\s+/g, ' ').trim()}
                      </span>
                      <span className="recent-meta">
                        {item.label}
                        <span className="stat-dot" aria-hidden="true">
                          ·
                        </span>
                        {formatRelativeTime(item.timestamp, now)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </section>

          <footer className="app-footer">
            <div className="footer-brand">ReactCase Wizard</div>
            <div className="footer-line">
              <span>Client-side · Private by design</span>
            </div>
            <div className="footer-line">
              <span>Made with React + Vite</span>
              <span className="footer-dot" aria-hidden="true">
                ·
              </span>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="footer-link"
              >
                GitHub
              </a>
            </div>
          </footer>
        </main>

        <Popover
          open={Boolean(shortcutsAnchor)}
          anchorEl={shortcutsAnchor}
          onClose={() => setShortcutsAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <div className="shortcuts-popover">
            <p className="shortcuts-title">Shortcuts</p>
            <ul className="shortcuts-list">
              <li>
                <span>Copy output</span>
                <kbd>{modKey}+Shift+C</kbd>
              </li>
              <li>
                <span>Undo</span>
                <kbd>{modKey}+Z</kbd>
              </li>
              <li>
                <span>Redo</span>
                <kbd>{modKey}+Shift+Z</kbd>
              </li>
              <li>
                <span>Reapply last case</span>
                <kbd>{modKey}+Enter</kbd>
              </li>
              <li>
                <span>Clear editor</span>
                <kbd>Esc</kbd>
              </li>
            </ul>
          </div>
        </Popover>
      </div>
    </ThemeProvider>
  );
}

export default TextChange;
