import React, { useMemo, useRef, useEffect } from 'react';
import { FileCode2 } from 'lucide-react';

export default function CodeEditor({ file, content = '', onChange = () => {} }) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lineCount = useMemo(() => {
    if (content == null) return 1;
    return content.split('\n').length;
  }, [content]);

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const currentContent = content ?? '';
      const newValue = currentContent.substring(0, start) + '  ' + currentContent.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  useEffect(() => {
    // Reset scroll when file changes
    if (textareaRef.current) textareaRef.current.scrollTop = 0;
  }, [file?.path]);

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <div className="w-14 h-14 rounded-xl bg-accent/40 flex items-center justify-center mb-4">
          <FileCode2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1">No file open</h3>
        <p className="text-sm text-muted-foreground max-w-xs text-center">
          Select a file from the explorer to begin editing, or ask the AI for help.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-background overflow-hidden font-mono text-sm">
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="shrink-0 overflow-hidden select-none py-4 pr-3 pl-4 text-right text-muted-foreground/60 border-r border-border/50 bg-card/20"
        style={{ lineHeight: '1.6rem' }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="text-xs tabular-nums">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Editor textarea */}
      <textarea
        ref={textareaRef}
        value={content ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="flex-1 resize-none bg-transparent outline-none py-4 px-4 text-foreground leading-[1.6rem] font-mono text-[13px]"
        style={{ tabSize: 2 }}
        placeholder="// Start typing..."
      />
    </div>
  );
}