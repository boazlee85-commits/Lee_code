import React, { useState } from 'react';
import { Code2, FolderOpen, Save, Sparkles, FilePlus2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TopBar({ onOpenFolder, onSave, onNewProject, hasActiveFile, projectName }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleNewProject = () => {
    if (projectName) {
      setShowConfirm(true);
    } else {
      onNewProject();
    }
  };

  const confirmNew = () => {
    setShowConfirm(false);
    onNewProject();
  };

  return (
    <>
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight">Atelier</span>
            <span className="text-xs text-muted-foreground">— AI Code Editor</span>
          </div>
          {projectName && (
            <>
              <div className="w-px h-4 bg-border mx-2" />
              <span className="text-xs text-muted-foreground font-mono">{projectName}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewProject}
            className="h-8 text-xs gap-2 text-muted-foreground hover:text-foreground"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            New Project
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenFolder}
            className="h-8 text-xs gap-2 text-muted-foreground hover:text-foreground"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Open Folder
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={!hasActiveFile}
            className="h-8 text-xs gap-2 text-muted-foreground hover:text-foreground"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-medium text-primary">AI Ready</span>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl p-6 w-80 flex flex-col gap-4">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-3 right-3 p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Start new project?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  "{projectName}" will be closed. Unsaved changes will be lost.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={confirmNew} className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white border-0">
                Start New
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}