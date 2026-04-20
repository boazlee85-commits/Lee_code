import React from 'react';
import { X, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EditorTabs({ openFiles = [], activePath, onSelect, onClose, dirtyPaths = new Set() }) {
  if (!openFiles || openFiles.length === 0) return null;

  return (
    <div className="h-9 border-b border-border bg-card/30 flex items-stretch overflow-x-auto shrink-0">
      {openFiles.map((file) => {
        const isActive = file.path === activePath;
        const isDirty = dirtyPaths.has(file.path);
        return (
          <div
            key={file.path}
            className={cn(
              "group flex items-center gap-2 pl-3 pr-2 text-xs border-r border-border cursor-pointer transition-colors shrink-0",
              isActive
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
            )}
            onClick={() => onSelect(file.path)}
          >
            <span className="font-mono">{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(file.path);
              }}
              className="w-4 h-4 flex items-center justify-center rounded hover:bg-accent"
            >
              {isDirty ? (
                <Circle className="w-2 h-2 fill-current opacity-70 group-hover:hidden" />
              ) : null}
              <X className={cn("w-3 h-3", isDirty && "hidden group-hover:block")} />
              {!isDirty && <X className="w-3 h-3" />}
            </button>
          </div>
        );
      })}
    </div>
  );
}