import React, { useState } from 'react'
import FileExplorer from '@/components/editor/FileExplorer'
import CodeEditor from '@/components/editor/CodeEditor'
import EditorTabs from '@/components/editor/EditorTabs'
import TopBar from '@/components/editor/TopBar'
import AIAssistant from '@/components/editor/AIAssistant'
import FileTree from '@/components/editor/FileTree'

export default function Editor() {
  const [projectTree, setProjectTree] = useState(null)
  const [activeFile, setActiveFile] = useState(null)
  const [fileContents, setFileContents] = useState({})
  const [projectName, setProjectName] = useState('')
  const [openTabs, setOpenTabs] = useState([])

  const handleFolderUpload = async (files) => {
    const tree = FileTree.buildFromFiles(files)
    setProjectTree(tree)
    
    const contents = {}
    for (const file of files) {
      if (file.type && file.type.startsWith('text/')) {
        contents[file.webkitRelativePath] = await file.text()
      }
    }
    setFileContents(contents)
    setProjectName(files[0]?.webkitRelativePath?.split('/')[0] || 'Project')
  }

  const handleFileSelect = (file) => {
    setActiveFile(file)
    if (!openTabs.find(t => t.path === file.path)) {
      setOpenTabs([...openTabs, file])
    }
  }

  const handleTabClose = (path) => {
    setOpenTabs(openTabs.filter(t => t.path !== path))
    if (activeFile?.path === path) {
      setActiveFile(openTabs.find(t => t.path !== path) || null)
    }
  }

  const handleFileChange = (content) => {
    if (activeFile) {
      setFileContents({
        ...fileContents,
        [activeFile.path]: content
      })
    }
  }

  const handleNewProject = () => {
    setProjectTree(null)
    setActiveFile(null)
    setFileContents({})
    setProjectName('')
    setOpenTabs([])
  }

  const handleSave = () => {
    // Save functionality would go here
    console.log('Saving files...', fileContents)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar 
        onOpenFolder={handleFolderUpload}
        onNewProject={handleNewProject}
        onSave={handleSave}
        projectName={projectName}
        hasActiveFile={!!activeFile}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <FileExplorer 
          tree={projectTree}
          onFolderUpload={handleFolderUpload}
          onFileSelect={handleFileSelect}
          activePath={activeFile?.path}
        />
        
        <div className="flex flex-col flex-1 bg-background">
          <EditorTabs 
            openFiles={openTabs}
            activePath={activeFile?.path}
            onSelect={(path) => setActiveFile(openTabs.find(t => t.path === path))}
            onClose={handleTabClose}
            dirtyPaths={new Set()}
          />
          <CodeEditor 
            file={activeFile}
            content={fileContents[activeFile?.path] || ''}
            onChange={handleFileChange}
          />
        </div>
        
        <AIAssistant 
          activeFile={activeFile}
          activeContent={fileContents[activeFile?.path] || ''}
          fileContents={fileContents}
          projectTree={projectTree}
          onApplyEdit={(path, content) => {
            setFileContents({...fileContents, [path]: content})
          }}
          onOpenFile={handleFileSelect}
          onCreateFile={(path, content) => {
            setFileContents({...fileContents, [path]: content})
          }}
        />
      </div>
    </div>
  )
}
