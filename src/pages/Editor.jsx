import React from 'react'

export default function Editor() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b">
        <div className="px-4 py-2">
          <h1 className="text-xl font-bold">Code Editor</h1>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4">
          <p>Welcome to the Game Code Editor</p>
        </div>
      </div>
    </div>
  )
}
