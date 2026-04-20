import React, { useRef } from 'react';
import { FolderUp, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileTree from './FileTree';

export default function FileExplorer({ tree, onFolderUpload, onFileSelect, activePath, fileInputRef }) {
  const localInputRef = useRef(null);
  const inputRef = fileInputRef || localInputRef;

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFolderUpload(files);
    e.target.value = '';
  };

  return (
    <div className="h-full flex flex-col bg-card/50">
      <div className="h-9 px-3 flex items-center justify-between border-b border-border shrink-0">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
          Explorer
        </span>
        <button
          onClick={() => inputRef.current?.click()}
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Open folder"
        >
          <FolderUp className="w-3.5 h-3.5" />
        </button>
        <input
          ref={inputRef}
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </div>

      <div className="flex-1 overflow-auto">
        {!tree ? (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4">
              <FileCode className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground font-medium mb-1">No folder opened</p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Upload a project folder to start editing with AI
            </p>
            <Button
              onClick={() => inputRef.current?.click()}
              size="sm"
              className="h-8 text-xs gap-2"
            >
              <FolderUp className="w-3.5 h-3.5" />
              Open Folder
            </Button>
          </div>
        ) : (
          <div className="px-1">
            <FileTree tree={tree} onSelect={onFileSelect} activePath={activePath} />
          </div>
        )}
      </div>
    </div>
  );
}