import { useState, useRef, useCallback } from 'react';
import './App.css';
import MarkdownRenderer from './components/MarkdownRenderer';

/* ── Config ──────────────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/* ── SVG icon helpers ────────────────────────────────────────────── */
const Icon = {
  GitHub: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.511.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.338c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.337-.012 2.417-.012 2.747 0 .268.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
    </svg>
  ),
  Search: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Repo: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S9 17.5 9 18v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  GitBranch: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  ),
  FileCode: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 17 2-2-2-2" />
    </svg>
  ),
  Sparkle: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5z" />
    </svg>
  ),
  Database: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  ChevronDown: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Alert: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Layers: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  InboxEmpty: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M22 12h-6l-2 3H10L8 12H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function extractRepoName(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/^\//, '').split('/');
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  } catch {
    // invalid URL
  }
  return url;
}

function isGitHubRateLimit(msg) {
  return (
    typeof msg === 'string' &&
    (msg.toLowerCase().includes('rate limit') ||
      msg.toLowerCase().includes('403') ||
      msg.toLowerCase().includes('api rate'))
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="empty-state">
      <Icon.InboxEmpty className="empty-icon" />
      <div>
        <h2>No analysis yet</h2>
        <p>Enter a public GitHub repository URL, type your question, and click Analyze Repository.</p>
      </div>
      <div className="empty-steps">
        {[
          'Paste a public GitHub repo URL',
          'Ask a specific question about the code',
          'Click Analyze — results appear here',
        ].map((step, i) => (
          <div key={i} className="empty-step">
            <span className="empty-step-num">{i + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState({ repoUrl }) {
  const name = repoUrl ? extractRepoName(repoUrl) : 'repository';
  return (
    <div className="loading-state">
      <div className="loading-pulse">
        <span className="pulse-dot" />
        <span className="pulse-dot" />
        <span className="pulse-dot" />
      </div>
      <div className="loading-steps">
        <p>Analyzing <strong style={{ color: 'var(--text-primary)' }}>{name}</strong></p>
        <span>Cloning files · Building embeddings · Running RAG · Querying LLM&hellip;</span>
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  const isRateLimit = isGitHubRateLimit(message);
  return (
    <div className="error-banner" role="alert">
      <Icon.Alert className="error-icon" />
      <div className="error-content">
        <h3>{isRateLimit ? 'GitHub Rate Limit Exceeded' : 'Analysis Failed'}</h3>
        <p>
          {isRateLimit
            ? 'The GitHub API rate limit has been reached. Add a GITHUB_TOKEN to the backend .env file to increase your limit, then try again.'
            : message}
        </p>
      </div>
    </div>
  );
}

function ContextAccordion({ context }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion">
      <button
        className="accordion-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        type="button"
      >
        <span className="accordion-trigger-left">
          <Icon.Database style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
          Retrieved Repository Context
        </span>
        <Icon.ChevronDown className={`accordion-chevron${open ? ' open' : ''}`} />
      </button>
      {open && (
        <div className="accordion-body">
          <pre className="context-pre">{context}</pre>
        </div>
      )}
    </div>
  );
}

function RepoCard({ data }) {
  return (
    <div className="result-card">
      <div className="card-header">
        <Icon.Repo className="card-icon" />
        <span className="card-title">Repository</span>
      </div>
      <div className="repo-info">
        <span className="repo-name">
          {data.owner}/{data.repo}
        </span>
        <div className="repo-meta">
          <span className="repo-meta-item">
            <Icon.GitBranch className="meta-icon" />
            <span className="branch-badge">{data.branch}</span>
          </span>
          <span className="repo-meta-item">
            <Icon.FileCode className="meta-icon" />
            {data.files?.length ?? 0} files indexed
          </span>
        </div>
      </div>
    </div>
  );
}

function FilesCard({ files }) {
  return (
    <div className="result-card">
      <div className="card-header">
        <Icon.FileCode className="card-icon" />
        <span className="card-title">Indexed Files</span>
      </div>
      <div className="files-wrapper">
        <table className="files-table" aria-label="Indexed repository files">
          <thead>
            <tr>
              <th>File Path</th>
              <th>Chunks</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, i) => (
              <tr key={i}>
                <td>
                  <span className="file-path">{file.path}</span>
                </td>
                <td>
                  <span className="chunk-badge">{file.chunks}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="files-summary">
          {files.length} file{files.length !== 1 ? 's' : ''} &middot;{' '}
          {files.reduce((sum, f) => sum + (f.chunks || 0), 0)} total chunks
        </div>
      </div>
    </div>
  );
}

function AnswerCard({ answer, task }) {
  return (
    <div className="result-card">
      <div className="card-header">
        <Icon.Sparkle className="card-icon" />
        <span className="card-title">AI Answer</span>
      </div>
      {task && (
        <p
          style={{
            fontStyle: 'italic',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-4)',
            borderLeft: '2px solid var(--border)',
            paddingLeft: 'var(--space-3)',
          }}
        >
          {task}
        </p>
      )}
      <div className="answer-body">
        <MarkdownRenderer content={answer} />
      </div>
    </div>
  );
}

/* ── Main App ────────────────────────────────────────────────────── */
export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [task, setTask] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const isLoading = status === 'loading';
  const abortRef = useRef(null);

  const analyzeRepository = useCallback(async () => {
    const url = repoUrl.trim();
    const question = task.trim();

    if (!url || !question) return;
    if (isLoading) return;

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setResult(null);
    setErrorMsg('');

    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: url, task: question }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        // Surface server-side error messages
        throw new Error(data?.message || data?.error || `Server error ${response.status}`);
      }

      setResult({ ...data, _task: question });
      setStatus('success');
    } catch (err) {
      if (err.name === 'AbortError') return; // user navigated away / re-submitted
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  }, [repoUrl, task, isLoading]);

  const handleKeyDown = useCallback(
    (e) => {
      // Ctrl+Enter or Cmd+Enter submits the form
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        analyzeRepository();
      }
    },
    [analyzeRepository]
  );

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-brand">
          <Icon.GitHub className="header-icon" />
          <div>
            <div className="header-title">GitHub AI Analyzer</div>
            <div className="header-subtitle">RAG · MiniLM · Ollama Qwen2.5</div>
          </div>
        </div>
        <span className="header-badge">Local LLM</span>
      </header>

      {/* ── Two-column layout ── */}
      <main className="main">
        {/* ──── Sidebar / Input ──── */}
        <aside className="sidebar" aria-label="Analysis controls">
          {/* Repository URL */}
          <div className="sidebar-section">
            <div className="section-label">Repository</div>
            <div className="field">
              <label htmlFor="repo-url" className="field-label">
                GitHub Repository URL
              </label>
              <input
                id="repo-url"
                type="url"
                className="field-input"
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                autoComplete="url"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Question */}
          <div className="sidebar-section">
            <div className="section-label">Question</div>
            <div className="field">
              <label htmlFor="task-input" className="field-label">
                What would you like to know?
              </label>
              <textarea
                id="task-input"
                className="field-input"
                placeholder={
                  'e.g. "Explain the authentication flow"\n"What does the API handler do?"\n"List the main dependencies and their purpose"'
                }
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={5}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Ctrl+Enter to submit
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="sidebar-section">
            <button
              className="btn-analyze"
              onClick={analyzeRepository}
              disabled={isLoading || !repoUrl.trim() || !task.trim()}
              type="button"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Icon.Search className="btn-icon" aria-hidden="true" />
                  Analyze Repository
                </>
              )}
            </button>
          </div>

          {/* Tech stack info */}
          <div className="sidebar-section">
            <div className="section-label">Stack</div>
            <div className="tech-stack">
              {['MiniLM', 'Vectra', 'Qwen2.5', 'Ollama', 'RAG', 'GitHub API'].map((t) => (
                <span key={t} className="tech-pill">{t}</span>
              ))}
            </div>
          </div>
        </aside>

        {/* ──── Content / Results ──── */}
        <section className="content" aria-label="Analysis results" aria-live="polite">
          {status === 'idle' && <EmptyState />}
          {status === 'loading' && <LoadingState repoUrl={repoUrl} />}
          {status === 'error' && <ErrorBanner message={errorMsg} />}
          {status === 'success' && result && (
            <div className="results">
              <RepoCard data={result} />
              {result.files?.length > 0 && <FilesCard files={result.files} />}
              {result.answer && <AnswerCard answer={result.answer} task={result._task} />}
              {result.retrievedContext && (
                <div className="result-card">
                  <div className="card-header">
                    <Icon.Layers className="card-icon" />
                    <span className="card-title">Context</span>
                  </div>
                  <ContextAccordion context={result.retrievedContext} />
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>GitHub AI Analyzer</p>
        <span className="footer-dot" aria-hidden="true" />
        <p>Powered by local LLM &amp; RAG</p>
        <span className="footer-dot" aria-hidden="true" />
        <p>No data leaves your machine</p>
      </footer>
    </div>
  );
}