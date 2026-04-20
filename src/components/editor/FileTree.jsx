import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

function getFileIconColor(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  const map = {
    js: 'text-yellow-400', jsx: 'text-sky-400', ts: 'text-blue-400', tsx: 'text-sky-400',
    json: 'text-orange-400', css: 'text-pink-400', html: 'text-orange-500',
    md: 'text-slate-400', py: 'text-green-400', java: 'text-red-400',
    go: 'text-cyan-400', rs: 'text-orange-400', php: 'text-indigo-400',
  };
  return map[ext] || 'text-muted-foreground';
}

function TreeNode({ node, depth, onSelect, activePath, expandedPaths, toggleExpand }) {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedPaths.has(node.path);
  const isActive = activePath === node.path;

  const handleClick = () => {
    if (isFolder) toggleExpand(node.path);
    else onSelect(node);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1 text-xs rounded-md text-left transition-colors group",
          isActive ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 shrink-0" />
            ) : (
              <ChevronRight className="w-3 h-3 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 shrink-0 text-sky-400/80" />
            ) : (
              <Folder className="w-3.5 h-3.5 shrink-0 text-sky-400/80" />
            )}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <File className={cn("w-3.5 h-3.5 shrink-0", getFileIconColor(node.name))} />
          </>
        )}
        <span className="truncate font-mono">{node.name}</span>
      </button>

      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              activePath={activePath}
              expandedPaths={expandedPaths}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ tree, onSelect, activePath }) {
  const [expandedPaths, setExpandedPaths] = useState(() => {
    const set = new Set();
    if (tree) set.add(tree.path);
    return set;
  });

  const toggleExpand = (path) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  if (!tree) return null;

  return (
    <div className="py-1">
      <TreeNode
        node={tree}
        depth={0}
        onSelect={onSelect}
        activePath={activePath}
        expandedPaths={expandedPaths}
        toggleExpand={toggleExpand}
      />
    </div>
  );
}