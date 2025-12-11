import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import { runPython } from "./pyodideRunner";

const BACKEND_URL = "http://localhost:4000";

const appStyle = {
  minHeight: "100vh",
  background: "#020617",
  color: "#e5e7eb",
  padding: "24px",
  boxSizing: "border-box",
  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const cardStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  background: "rgba(15,23,42,0.98)",
  borderRadius: "16px",
  boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
  padding: "20px 24px 24px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  border: "1px solid rgba(148,163,184,0.25)",
};

const toolbarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const buttonPrimary = {
  padding: "8px 16px",
  borderRadius: "999px",
  border: "none",
  background:
    "linear-gradient(135deg, rgb(59,130,246), rgb(129,140,248), rgb(236,72,153))",
  color: "#f9fafb",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(59,130,246,0.4)",
};

const buttonSecondary = {
  padding: "6px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(148,163,184,0.6)",
  background: "rgba(15,23,42,0.9)",
  color: "#e5e7eb",
  fontSize: "0.85rem",
  cursor: "pointer",
};

const selectStyle = {
  padding: "6px 10px",
  borderRadius: "999px",
  border: "1px solid rgba(148,163,184,0.7)",
  background: "#020617",
  color: "#e5e7eb",
};

function App() {
  const [sessionId, setSessionId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("sessionId") || "";
  });

  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState("// Start coding here...\n");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const createSession = async () => {
    const res = await fetch(`${BACKEND_URL}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (data.id) {
      setSessionId(data.id);

      const newUrl = `${window.location.pathname}?sessionId=${data.id}`;
      window.history.replaceState(null, "", newUrl);
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    const s = io(BACKEND_URL, {
      transports: ["websocket"],
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("Connected to backend", s.id);
      s.emit("join-session", { sessionId });
    });

    s.on("init-code", ({ code }) => {
      setCode(code || "");
    });

    s.on("code-change", ({ code }) => {
      setCode(code || "");
    });

    s.on("disconnect", () => {
      console.log("Disconnected from backend");
    });

    return () => {
      s.disconnect();
    };
  }, [sessionId]);

  const handleCodeChange = (value) => {
    const newCode = value ?? "";
    setCode(newCode);

    if (socket && sessionId) {
      socket.emit("code-change", { sessionId, code: newCode });
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      if (language === "javascript") {
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.join(" "));
          originalLog(...args);
        };

        try {
          const fn = new Function(code);
          const result = fn();
          if (result !== undefined) {
            logs.push(String(result));
          }
        } catch (err) {
          logs.push(String(err));
        } finally {
          console.log = originalLog;
        }

        setOutput(logs.join("\n") || "(no output)");
      } else if (language === "python") {
        const result = await runPython(code);
        setOutput(String(result ?? "(no output)"));
      } else if (language === "java") {
        setOutput(
          "Java execution is not supported yet.\n" +
            "You can still collaborate and use syntax highlighting for Java."
        );
      }
    } catch (err) {
      setOutput(`Error: ${err.message || String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const shareLink = sessionId
    ? `${window.location.origin}${window.location.pathname}?sessionId=${sessionId}`
    : "";

  const copyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <div style={appStyle}>
      <div style={{ maxWidth: "1100px", margin: "0 auto 16px" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 700, marginBottom: 4 }}>
          Online Coding Interview
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>
          Real-time collaborative editor with JavaScript, Python (Pyodide) and
          Java syntax highlighting.
        </p>
      </div>

      <div style={cardStyle}>
        <div style={toolbarStyle}>
          <button style={buttonPrimary} onClick={createSession}>
            Create new session
          </button>

          <div>
            <label style={{ fontSize: "0.9rem", color: "#cbd5f5" }}>
              Language:&nbsp;
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={selectStyle}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </label>
          </div>

          {sessionId && (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.8rem",
              }}
            >
              <span style={{ color: "#22c55e" }}>● Live</span>
              <button style={buttonSecondary} onClick={copyLink}>
                Copy share link
              </button>
              {linkCopied && (
                <span style={{ color: "#a5b4fc" }}>Copied!</span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={runCode}
            disabled={isRunning || !sessionId}
            style={{
              ...buttonSecondary,
              padding: "6px 16px",
              opacity: isRunning || !sessionId ? 0.5 : 1,
              cursor: isRunning || !sessionId ? "default" : "pointer",
            }}
          >
            {isRunning ? "Running..." : "Run code"}
          </button>
          {!sessionId && (
            <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
              Create or join a session first
            </span>
          )}
        </div>

        <div
          style={{
            marginTop: "4px",
            display: "grid",
            gridTemplateRows: "minmax(0, 1fr) 180px",
            gap: "12px",
            height: "70vh",
          }}
        >
          <div
            style={{
              background: "#020617",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(30,64,175,0.8)",
            }}
          >
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                padding: { top: 10 },
              }}
            />
          </div>

          <div
            style={{
              background: "rgba(15,23,42,0.95)",
              borderRadius: "12px",
              border: "1px solid rgba(148,163,184,0.35)",
              padding: "8px 10px",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#9ca3af",
                marginBottom: "4px",
              }}
            >
              Output
            </div>
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                height: "100%",
                overflow: "auto",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
                fontSize: "0.85rem",
              }}
            >
              {output || " "}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
