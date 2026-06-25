import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import IssuePermitView from './views/IssuePermitView.jsx'
import IssuedPermitsView from './views/IssuedPermitsView.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/issue"  element={<IssuePermitView />} />
        <Route path="/issued" element={<IssuedPermitsView />} />
        <Route path="*"       element={<Navigate to="/issue" replace />} />
      </Routes>
    </AppShell>
  )
}
