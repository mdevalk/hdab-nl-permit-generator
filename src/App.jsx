import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import GeneratePermitView from './views/GeneratePermitView.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<GeneratePermitView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
