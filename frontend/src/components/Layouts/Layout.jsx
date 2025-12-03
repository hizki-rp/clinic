import React from 'react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {/* optional header */}
      <div className="max-w-screen-xl mx-auto p-4">
        {children}
      </div>
    </div>
  )
}