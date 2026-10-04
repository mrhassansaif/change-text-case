import { useEffect, useRef, useState } from 'react';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import {
  CASE_GROUPS,
  SAMPLE_TEXT,
  countLines,
  countWords,
} from '../utils/caseConverters';
import './TextChange.css';

const COPY_RESET_MS = 1800;

const tooltipTheme = createTheme({
  palette: { mode: 'dark' },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#27272a',
          color: '#fafafa',
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        },
        arrow: {
          color: '#27272a',
        },
      },
    },
  },
});

function TextChange() {
  const [text, setText] = useState('');
  const [activeCase, setActiveCase] = useState(null);
  const [copyState, setCopyState] = useState('idle');
  const copyResetTimer = useRef(null);

  const characterCount = text.length;
  const wordCount = countWords(text);
  const lineCount = countLines(text);
  const hasText = text.length > 0;
  const isCopied = copyState === 'copied';

  useEffect(() => {
    return () => {
      if (copyResetTimer.current) {
        clearTimeout(copyResetTimer.current);
      }
    };
  }, []);

  const handleChange = (event) => {
    setText(event.target.value);
    setActiveCase(null);
    if (copyState !== 'idle') {
      setCopyState('idle');
    }
  };

  const handleCaseClick = (actionId, transform) => {
    setText(transform(text));
    setActiveCase(actionId);
  };

  const handleClear = () => {
    setText('');
    setActiveCase(null);
    setCopyState('idle');
  };

  const handleSample = () => {
    setText(SAMPLE_TEXT);
    setActiveCase(null);
  };

  const resetCopyStateSoon = (nextState) => {
    setCopyState(nextState);
    if (copyResetTimer.current) {
      clearTimeout(copyResetTimer.current);
    }
    copyResetTimer.current = setTimeout(() => {
      setCopyState('idle');
    }, COPY_RESET_MS);
  };

  const copyWithFallback = (value) => {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const succeeded = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (!succeeded) {
      throw new Error('execCommand copy failed');
    }
  };

  const handleCopy = async () => {
    if (!hasText) return;

    try {
      if (navigator.clipboard?.writeText) {
        await Promise.race([
          navigator.clipboard.writeText(text),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('clipboard timeout')), 1200);
          }),
        ]);
      } else {
        copyWithFallback(text);
      }

      resetCopyStateSoon('copied');
    } catch {
      try {
        copyWithFallback(text);
        resetCopyStateSoon('copied');
      } catch {
        resetCopyStateSoon('error');
      }
    }
  };

  const copyTooltip =
    copyState === 'error'
      ? 'Copy failed'
      : isCopied
        ? 'Copied'
        : 'Copy text';

  return (
    <ThemeProvider theme={tooltipTheme}>
      <div className="app-shell">
        <div className="app-glow" aria-hidden="true" />
        <div className="app-noise" aria-hidden="true" />

        <main className="app-main">
          <header className="app-header">
            <h1 className="app-brand">ReactCase Wizard</h1>
            <p className="app-tagline">Transform text instantly.</p>
          </header>

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
                onChange={handleChange}
                placeholder="Start typing, or paste text to transform…"
                spellCheck="true"
                rows={10}
              />
            </div>

            <div className="editor-footer">
              <p className="editor-stats" aria-live="polite">
                <span>
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
                <span className="stat-dot" aria-hidden="true">
                  ·
                </span>
                <span>
                  {characterCount}{' '}
                  {characterCount === 1 ? 'character' : 'characters'}
                </span>
                <span className="stat-dot" aria-hidden="true">
                  ·
                </span>
                <span>
                  {lineCount} {lineCount === 1 ? 'line' : 'lines'}
                </span>
              </p>

              <div className="editor-actions">
                <Tooltip title="Clear text" arrow enterDelay={300}>
                  <span>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={handleClear}
                      disabled={!hasText}
                      aria-label="Clear text"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </button>
                  </span>
                </Tooltip>

                <Tooltip title={copyTooltip} arrow enterDelay={300}>
                  <span>
                    <button
                      type="button"
                      className={`icon-button copy-button${isCopied ? ' is-copied' : ''}${copyState === 'error' ? ' is-error' : ''}`}
                      onClick={handleCopy}
                      disabled={!hasText}
                      aria-label={copyTooltip}
                    >
                      {isCopied ? (
                        <CheckRoundedIcon fontSize="small" />
                      ) : (
                        <ContentCopyRoundedIcon fontSize="small" />
                      )}
                      <span className="copy-label">
                        {isCopied
                          ? 'Copied'
                          : copyState === 'error'
                            ? 'Failed'
                            : 'Copy'}
                      </span>
                    </button>
                  </span>
                </Tooltip>
              </div>
            </div>
          </section>

          <section className="case-panel" aria-label="Case conversion controls">
            {CASE_GROUPS.map((group) => (
              <div key={group.id} className="case-group">
                <h2 className="case-group-label">{group.label}</h2>
                <div
                  className="case-button-row"
                  role="group"
                  aria-label={group.label}
                >
                  {group.actions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      className={`case-button${activeCase === action.id ? ' is-active' : ''}`}
                      onClick={() => handleCaseClick(action.id, action.transform)}
                      disabled={!hasText}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <footer className="app-footer">
            <span>Client-side text utility</span>
            <span className="footer-dot" aria-hidden="true">
              ·
            </span>
            <span>Nothing leaves your browser</span>
          </footer>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default TextChange;
