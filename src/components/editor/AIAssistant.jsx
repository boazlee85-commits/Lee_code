import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Loader2, Wand2, CheckCheck, FolderSearch, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  { label: 'Explain this file', prompt: 'Explain what this code does, step by step.' },
  { label: 'Find bugs', prompt: 'Review this code for bugs, issues, or improvements.' },
  { label: 'Add comments', prompt: 'Add clear, helpful inline comments throughout this file. Return ONLY the full updated file content inside a code block, no explanation.' },
  { label: 'Refactor', prompt: 'Refactor this code to be cleaner and more maintainable. Return ONLY the full updated file content inside a code block, no explanation.' },
];

function flattenFiles(node, result = []) {
  if (!node) return result;
  if (node.type === 'file') {
    result.push(node);
  } else if (node.children) {
    for (const child of node.children) flattenFiles(child, result);
  }
  return result;
}

export default function AIAssistant({ activeFile, activeContent, fileContents, projectTree, onApplyEdit, onOpenFile, onCreateFile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetPath, setTargetPath] = useState(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const scrollRef = useRef(null);
  const filePickerRef = useRef(null);

  const allFiles = flattenFiles(projectTree);

  // Sync targetPath to active file when it changes
  useEffect(() => {
    if (activeFile) setTargetPath(activeFile.path);
  }, [activeFile?.path]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // Close file picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filePickerRef.current && !filePickerRef.current.contains(e.target)) {
        setShowFilePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const targetNode = allFiles.find((f) => f.path === targetPath) || null;
  const targetContent = targetPath ? (fileContents[targetPath] ?? null) : null;

  // Read all project files that haven't been loaded yet
  const readAllFiles = async () => {
    const { readFileAsText } = await import('@/lib/fileTree');
    const loaded = { ...fileContents };
    for (const f of allFiles) {
      if (loaded[f.path] === undefined && f.file && !f.virtual) {
        try {
          const text = await readFileAsText(f.file);
          loaded[f.path] = text;
          onOpenFile(f, text);
        } catch {
          loaded[f.path] = '(unreadable)';
        }
      }
    }
    return loaded;
  };

  // Parse multi-file response: sections separated by @@FILE: path\n```...```
  const parseMultiFileResponse = (response) => {
    const filePattern = /@@FILE:\s*([^\n]+)\n```[a-zA-Z0-9]*\n([\s\S]*?)```/g;
    const files = [];
    let match;
    while ((match = filePattern.exec(response)) !== null) {
      files.push({ path: match[1].trim(), content: match[2] });
    }
    return files;
  };

  const send = async (prompt) => {
    const text = (prompt ?? input).trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    // Read ALL project files for full context
    const allContents = projectTree ? await readAllFiles() : {};

    // Build full project context
    let projectContext = '';
    for (const f of allFiles) {
      const c = allContents[f.path];
      if (c !== undefined) {
        projectContext += `\n\n--- FILE: ${f.path} ---\n\`\`\`\n${c}\n\`\`\``;
      }
    }

    const targetInfo = targetNode
      ? `The user's current target file is: ${targetNode.path}`
      : 'No specific target file is selected.';

    const fullPrompt = `You are an expert coding assistant inside an AI code editor. You have access to the ENTIRE project.

${targetInfo}

PROJECT FILES:${projectContext || '\n(no files loaded)'}

---

RESPONSE FORMAT RULES:
- If editing or creating ONE file: return ONLY the complete file content in a single fenced code block. No explanation.
- If you need to CREATE or EDIT MULTIPLE files (e.g. adding a new component and updating an import): use this format for EACH file:

@@FILE: path/to/file.js
\`\`\`js
// full file content here
\`\`\`

@@FILE: path/to/another.js
\`\`\`js
// full file content here
\`\`\`

- NEW files: use the same project root prefix as existing files (e.g. if files start with "myproject/src/", new files should too).
- For questions or explanations (no code changes), respond in plain markdown.

User request: ${text}`;

    // AI functionality has been disabled
    const response = "AI assistance is not available. The AI integration has been removed.";

    // Try multi-file format first
    const multiFiles = parseMultiFileResponse(response);
    let autoApplied = false;

    if (multiFiles.length > 0) {
      for (const { path, content } of multiFiles) {
        const exists = allFiles.find((f) => f.path === path);
        if (exists) {
          onApplyEdit(path, content);
        } else {
          onCreateFile(path, content);
        }
      }
      autoApplied = true;
    } else {
      // Single file code block
      const code = extractCodeBlock(response);
      if (code && targetPath) {
        onApplyEdit(targetPath, code);
        autoApplied = true;
      }
    }

    setMessages((m) => [...m, { role: 'assistant', content: response, targetPath, autoApplied, filesChanged: multiFiles.map(f => f.path) }]);
    setLoading(false);
  };

  const extractCodeBlock = (text) => {
    const match = text.match(/```(?:[a-zA-Z0-9]*)\n([\s\S]*?)```/);
    return match ? match[1] : null;
  };

  return (
    <div className="h-full flex flex-col bg-card/50 border-l border-border">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            AI Assistant
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {/* Target file picker */}
      {allFiles.length > 0 && (
        <div className="px-3 py-2 border-b border-border shrink-0">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
            Target file
          </p>
          <div className="relative" ref={filePickerRef}>
            <button
              onClick={() => setShowFilePicker((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md border border-border bg-background hover:border-primary/40 transition-colors text-xs font-mono"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FolderSearch className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {targetNode ? targetNode.path : 'No file selected'}
                </span>
              </div>
              <ChevronDown className={cn("w-3 h-3 text-muted-foreground shrink-0 transition-transform", showFilePicker && "rotate-180")} />
            </button>
            {showFilePicker && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl max-h-56 overflow-y-auto">
                {allFiles.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => {
                      setTargetPath(f.path);
                      setShowFilePicker(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-[11px] font-mono hover:bg-accent transition-colors truncate",
                      f.path === targetPath && "bg-primary/10 text-primary"
                    )}
                  >
                    {f.path}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-5">
            <div className="text-center pt-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Wand2 className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-medium">Ask anything about your code</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Pick a target file above, then chat or use a quick action.
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground px-1">
                Quick actions
              </p>
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => send(a.prompt)}
                  disabled={!targetNode}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs border border-border hover:border-primary/40 hover:bg-accent/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              extractCodeBlock={extractCodeBlock}
            />
          ))
        )}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={targetNode ? `Ask about ${targetNode.name} or the whole project...` : 'Ask anything about your project...'}
            rows={2}
            className="w-full resize-none text-sm bg-background border border-border rounded-lg px-3 py-2 pr-10 outline-none focus:border-primary/50 placeholder:text-muted-foreground/60"
          />
          <Button
            size="icon"
            onClick={() => send()}
            disabled={!input.trim() || loading || !projectTree}
            className="absolute right-1.5 bottom-1.5 h-7 w-7"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Message({ msg, extractCodeBlock }) {
  const isUser = msg.role === 'user';
  const code = !isUser ? extractCodeBlock(msg.content) : null;

  return (
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      <div className={cn(
        "w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5",
        isUser ? "bg-accent" : "bg-primary/15"
      )}>
        {isUser ? (
          <User className="w-3 h-3 text-muted-foreground" />
        ) : (
          <Sparkles className="w-3 h-3 text-primary" />
        )}
      </div>
      <div className={cn("flex-1 min-w-0", isUser && "text-right")}>
        <div className={cn(
          "inline-block text-left max-w-full rounded-lg px-3 py-2 text-xs leading-relaxed",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent/50 text-foreground"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none [&_pre]:bg-background [&_pre]:border [&_pre]:border-border [&_pre]:rounded-md [&_pre]:text-[11px] [&_code]:text-[11px] [&_code]:font-mono [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {msg.autoApplied && (
          <div className="mt-1.5 space-y-0.5">
            {msg.filesChanged && msg.filesChanged.length > 0 ? (
              msg.filesChanged.map((fp) => (
                <div key={fp} className="flex items-center gap-1.5 text-[11px] text-green-400 font-mono">
                  <CheckCheck className="w-3 h-3 shrink-0" />
                  {fp}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-green-400">
                <CheckCheck className="w-3 h-3" />
                Applied to file
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}