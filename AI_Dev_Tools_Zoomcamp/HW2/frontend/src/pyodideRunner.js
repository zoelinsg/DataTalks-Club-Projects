let pyodideInstance = null;

async function ensurePyodideScriptLoaded() {
  if (window.loadPyodide) {
    return;
  }

  const existing = document.getElementById("pyodide-script");
  if (existing) {
    await new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Pyodide script")),
        { once: true }
      );
    });
    return;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "pyodide-script";
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Pyodide script"));
    document.body.appendChild(script);
  });
}

export async function initPyodide() {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  await ensurePyodideScriptLoaded();

  pyodideInstance = await window.loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.0/full/",
  });

  return pyodideInstance;
}

export async function runPython(code) {
  const pyodide = await initPyodide();

  const wrapped = `
import sys, io
_stdout = sys.stdout
_buffer = io.StringIO()
sys.stdout = _buffer
try:
    exec(${JSON.stringify(code)}, {})
finally:
    sys.stdout = _stdout
_output = _buffer.getvalue()
`;

  await pyodide.runPython(wrapped);
  const output = pyodide.globals.get("_output");
  return output || "(no output)";
}
