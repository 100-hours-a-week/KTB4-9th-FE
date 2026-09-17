import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { indentMore, indentWithTab } from "@codemirror/commands";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { indentUnit } from "@codemirror/language";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";

const LANGUAGE_EXTENSIONS = {
  Python: python,
  JavaScript: javascript,
  Java: java,
  "C++": cpp,
};

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#06060E",
    color: "#E2E0F0",
    fontSize: "13px",
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: "1.75",
  },
  ".cm-content": {
    padding: "12px 0",
    caretColor: "#C084FC",
  },
  ".cm-line": {
    padding: "0 12px",
  },
  ".cm-gutters": {
    backgroundColor: "#06060E",
    color: "#4A4870",
    borderRight: "1px solid #1E1D35",
    minWidth: "34px",
  },
  ".cm-activeLine, .cm-activeLineGutter": {
    backgroundColor: "rgba(124, 58, 237, 0.08)",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(124, 58, 237, 0.28) !important",
  },
  ".cm-cursor": {
    borderLeftColor: "#C084FC",
  },
  "&.cm-focused": {
    outline: "none",
  },
}, { dark: true });

export default function CodeEditor({ value, onChange, lang }) {
  const hostRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const languageCompartment = useRef(new Compartment());
  const initialValueRef = useRef(value);
  const initialLangRef = useRef(lang);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!hostRef.current) return undefined;

    const language = LANGUAGE_EXTENSIONS[initialLangRef.current] || python;
    const state = EditorState.create({
      doc: initialValueRef.current,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        indentUnit.of("    "),
        oneDark,
        editorTheme,
        languageCompartment.current.of(language()),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const language = LANGUAGE_EXTENSIONS[lang] || python;
    view.dispatch({
      effects: languageCompartment.current.reconfigure(language()),
    });
  }, [lang]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === value) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
  }, [value]);

  const insertText = (text) => {
    const view = viewRef.current;
    if (!view) return;
    const selection = view.state.selection.main;
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: text },
      selection: { anchor: selection.from + text.length },
    });
    view.focus();
  };

  const indentCode = () => {
    const view = viewRef.current;
    if (!view) return;
    indentMore(view);
    view.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#06060E]">
      <div ref={hostRef} className="min-h-0 flex-1 overflow-hidden" />
      <div className="flex shrink-0 items-center gap-2 border-t border-[#1E1D35] bg-[#0A0A16] px-3 py-2">
        {["()", "[]", ":", "="].map((token) => (
          <button
            key={token}
            type="button"
            onClick={() => insertText(token)}
            className="min-w-9 rounded-lg border border-[#2A2845] bg-[#121222] px-2 py-1.5 text-[11px] text-[#A89EC4] active:bg-[#1A1A2E]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {token}
          </button>
        ))}
        <button
          type="button"
          onClick={indentCode}
          className="rounded-lg border border-[#2A2845] bg-[#121222] px-2.5 py-1.5 text-[11px] text-[#A89EC4] active:bg-[#1A1A2E]"
        >
          들여쓰기
        </button>
      </div>
    </div>
  );
}
