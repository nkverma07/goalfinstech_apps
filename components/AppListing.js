import { useEffect, useState } from 'react'

// Shared app-listing UI, rendered on both `/` (home) and `/apps`.
// Reads the app records from /api/apps (backed by data/apps.json).
export default function AppListing() {
  const [apps, setApps] = useState([])
  const [status, setStatus] = useState({})

  useEffect(() => {
    fetch('/api/apps')
      .then((r) => r.json())
      .then(setApps)
      .catch(console.error)
  }, [])

  async function handleUpdate(appId) {
    setStatus((s) => ({ ...s, [appId]: 'updating' }))
    try {
      const res = await fetch('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId })
      })
      const json = await res.json()
      setApps((prev) => prev.map(a => a.id === appId ? { ...a, version: json.newVersion, downloadUrl: json.downloadUrl } : a))
      setStatus((s) => ({ ...s, [appId]: 'updated' }))
      // automatically trigger download (optional)
      window.open(json.downloadUrl, '_blank')
    } catch (err) {
      console.error(err)
      setStatus((s) => ({ ...s, [appId]: 'error' }))
    }
    setTimeout(() => setStatus((s) => ({ ...s, [appId]: undefined })), 3000)
  }

  return (
    <div className="container">
      <header>
        <h1>App Update Portal</h1>
        <p>Download the latest approved builds for both apps.</p>
      </header>

      <main>
        {apps.map((app) => (
          <div key={app.id} className="card">
            <img src={app.icon} alt="icon" className="icon" />
            <div className="meta">
              <h2>{app.name}</h2>
              <p className="muted">Version {app.version}</p>
              <div className="links">
                <a href={app.webUrl} target="_blank" rel="noreferrer">Open</a>
              </div>
            </div>
            <div className="actions">
              <button onClick={() => handleUpdate(app.id)}>
                {status[app.id] === 'updating' ? 'Updating…' : 'Download / Update'}
              </button>
            </div>
          </div>
        ))}
      </main>

      <style jsx>{`
        .container { max-width: 900px; margin: 40px auto; padding: 0 16px; font-family: Inter, system-ui, Arial; }
        header { display:flex; align-items:baseline; justify-content:space-between }
        h1 { margin:0 }
        p { margin:0; color:#666 }
        .card { display:flex; align-items:center; gap:16px; border:1px solid rgba(0,0,0,0.06); padding:12px 16px; border-radius:14px; margin-top:16px; box-shadow: 0 6px 18px rgba(3,102,214,0.06); background: var(--card-bg) }
        .icon { width:64px; height:64px; border-radius:12px; object-fit:cover; border:1px solid rgba(0,0,0,0.05) }
        .meta { flex:1 }
        .muted { color:#666; margin:6px 0 }
        .links a { margin-right:12px; color:#0366d6 }
        .actions button { background:#0ea5a4; color:white; border:none; padding:8px 14px; border-radius:9999px; cursor:pointer; box-shadow: 0 1px 0 rgba(0,0,0,0.05) }
        .actions button:disabled { opacity:0.6 }
      `}</style>
    </div>
  )
}
