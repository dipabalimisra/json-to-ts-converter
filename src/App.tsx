import { useState, useEffect, useCallback } from "react";
import { convertJsonToTs } from "./utils/jsonToTs";
import "./App.css";

const PLACEHOLDER = `{
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "isActive": true,
    "address": null,
    "tags": ["admin", "editor"],
    "settings": {
      "theme": "dark",
      "notifications": true
    }
  }
}`;

export default function App() {
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("RootObject");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const convert = useCallback(() => {
    const { output, error } = convertJsonToTs(input, rootName || "RootObject");
    setOutput(output);
    setError(error);
  }, [input, rootName]);

  useEffect(() => {
    const timer = setTimeout(convert, 150);
    return () => clearTimeout(timer);
  }, [convert]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = output;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const lineCount = output ? output.split("\n").length : 0;

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-icon">{"{}"}</span>
          <div>
            <h1 className="title">JSON → TypeScript</h1>
            <p className="subtitle">Paste JSON, get typed interfaces instantly</p>
          </div>
        </div>
        <div className="root-name-field">
          <label htmlFor="root-name" className="root-label">Root interface name</label>
          <input
            id="root-name"
            className="root-input"
            type="text"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            placeholder="RootObject"
            spellCheck={false}
          />
        </div>
      </header>

      <main className="panels">
        {/* LEFT PANEL */}
        <section className="panel panel-left">
          <div className="panel-header">
            <span className="panel-label">JSON Input</span>
            <div className="panel-actions">
              {input && (
                <button className="btn-ghost" onClick={handleClear}>
                  Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            className="editor input-editor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
          <div className="panel-footer">
            {error ? (
              <span className="status-error">⚠ {error}</span>
            ) : input ? (
              <span className="status-ok">✓ Valid JSON</span>
            ) : (
              <span className="status-idle">Paste JSON to begin</span>
            )}
          </div>
        </section>

        <div className="divider">
          <span className="arrow">→</span>
        </div>

        {/* RIGHT PANEL */}
        <section className="panel panel-right">
          <div className="panel-header">
            <span className="panel-label">TypeScript Output</span>
            <div className="panel-actions">
              <button
                className={`btn-copy ${copied ? "copied" : ""} ${!output ? "disabled" : ""}`}
                onClick={handleCopy}
                disabled={!output}
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <pre className="editor output-editor">
            {output || (
              <span className="output-placeholder">
                // TypeScript interfaces will appear here...
              </span>
            )}
          </pre>
          <div className="panel-footer">
            {output ? (
              <span className="status-ok">{lineCount} lines generated</span>
            ) : (
              <span className="status-idle">Waiting for input</span>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}