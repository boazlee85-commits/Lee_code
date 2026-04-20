// Build a nested folder/file tree from a flat list of File objects (from a folder upload)
export function buildTreeFromFiles(files) {
  if (!files || files.length === 0) return null;

  // Determine root name
  const firstPath = files[0].webkitRelativePath || files[0].name;
  const rootName = firstPath.split('/')[0] || 'project';

  const root = {
    name: rootName,
    path: rootName,
    type: 'folder',
    children: [],
  };

  const folderMap = new Map();
  folderMap.set(rootName, root);

  for (const file of files) {
    const relPath = file.webkitRelativePath || file.name;
    const parts = relPath.split('/');

    let currentPath = parts[0];
    let parent = folderMap.get(currentPath);
    if (!parent) continue;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      currentPath = `${currentPath}/${part}`;

      if (isLast) {
        parent.children.push({
          name: part,
          path: currentPath,
          type: 'file',
          file,
        });
      } else {
        let folder = folderMap.get(currentPath);
        if (!folder) {
          folder = {
            name: part,
            path: currentPath,
            type: 'folder',
            children: [],
          };
          folderMap.set(currentPath, folder);
          parent.children.push(folder);
        }
        parent = folder;
      }
    }
  }

  // Sort: folders first, then files, alphabetically
  const sortNode = (node) => {
    if (node.type !== 'folder' || !node.children) return;
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNode);
  };
  sortNode(root);

  return root;
}

// Check if a file looks like a text/code file we can display
const TEXT_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'json', 'html', 'htm', 'css', 'scss', 'sass', 'less',
  'md', 'markdown', 'txt', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go', 'rs',
  'php', 'rb', 'swift', 'kt', 'sh', 'bash', 'zsh', 'yml', 'yaml', 'toml', 'xml',
  'svg', 'vue', 'svelte', 'sql', 'gitignore', 'env', 'dockerfile', 'lock',
]);

export function isTextFile(file) {
  const name = file.name.toLowerCase();
  const ext = name.split('.').pop();
  if (TEXT_EXTENSIONS.has(ext)) return true;
  if (!name.includes('.')) return true; // likely a config file
  return false;
}

export async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Insert a virtual (AI-created) file node into an existing tree by path
// e.g. path = "myproject/src/newFile.js"
export function insertNodeIntoTree(root, filePath, content) {
  if (!root) return root;
  const parts = filePath.split('/');
  // If root name matches first segment, skip it; otherwise treat full path
  const startIdx = parts[0] === root.name ? 1 : 0;
  const segments = parts.slice(startIdx);
  if (segments.length === 0) return root;

  const cloneTree = (node) => ({ ...node, children: node.children ? [...node.children] : undefined });

  const newRoot = cloneTree(root);

  const insert = (node, segs) => {
    if (segs.length === 1) {
      // Add file node
      const exists = node.children?.find((c) => c.name === segs[0]);
      if (!exists) {
        node.children = [...(node.children || []), {
          name: segs[0],
          path: filePath,
          type: 'file',
          file: null, // virtual file — content lives in fileContents
          virtual: true,
        }];
        // Re-sort
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      }
      return;
    }
    // Find or create folder
    let folder = node.children?.find((c) => c.type === 'folder' && c.name === segs[0]);
    if (!folder) {
      const folderPath = parts.slice(0, parts.length - segs.length + 1).join('/');
      folder = { name: segs[0], path: folderPath, type: 'folder', children: [] };
      node.children = [...(node.children || []), folder];
      node.children.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    } else {
      // Clone the folder so we don't mutate
      const idx = node.children.indexOf(folder);
      folder = { ...folder, children: [...(folder.children || [])] };
      node.children = [...node.children];
      node.children[idx] = folder;
    }
    insert(folder, segs.slice(1));
  };

  insert(newRoot, segments);
  return newRoot;
}