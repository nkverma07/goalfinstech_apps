import { useEffect, useState } from 'react'

// Shared app-listing UI, rendered on both `/` (home) and `/apps`.
// Reads the app records from /api/apps (backed by data/apps.json).
// The download button links straight to each app's downloadUrl
// (e.g. https://dl.goalfinstech.app/release.apk), so the click opens the
// APK directly with no API round-trip or popup-blocker issues.

function Stars({ rating }) {
  const rounded = Math.round(rating || 0)
  return (
    <span className="stars" aria-label={`${rating || 0} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? 'on' : 'off'}>★</span>
      ))}
    </span>
  )
}

export default function AppListing() {
  const [apps, setApps] = useState([])

  useEffect(() => {
    fetch('/api/apps')
      .then((r) => r.json())
      .then(setApps)
      .catch(console.error)
  }, [])

  return (
    <div className="container">
      <header>
        <h1>App Update Portal</h1>
        <p>Download the latest approved builds for both apps.</p>
      </header>

      <main>
        {apps.map((app) => (
          <div key={app.id} className="card">
            <img src={app.icon} alt={app.name} className="icon" />
            <div className="meta">
              <h2>{app.name}</h2>
              <p className="muted">Version {app.version}</p>
              <div className="stats">
                {app.rating > 0 ? (
                  <span className="stat">
                    <Stars rating={app.rating} />
                    <span className="num">{Number(app.rating).toFixed(1)}</span>
                  </span>
                ) : (
                  <span className="stat muted">No ratings yet</span>
                )}
                <span className="dot">·</span>
                <span className="stat">
                  <strong>{Number(app.downloads || 0).toLocaleString()}+</strong>
                  <span className="sub">downloads</span>
                </span>
              </div>
            </div>
            <div className="actions">
              <a className="dlbtn" href={app.downloadUrl} rel="noreferrer">
                Download / Update
              </a>
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
        .muted { color:#666 }
        p.muted { margin:6px 0 }
        .stats { display:flex; align-items:center; gap:10px; margin-top:4px; font-size:14px; color:#444 }
        .stat { display:inline-flex; align-items:center; gap:6px }
        .stars .on { color:#f5b301 }
        .stars .off { color:#d0d0d0 }
        .num { font-weight:600 }
        .sub { color:#888 }
        .dot { color:#bbb }
        .actions .dlbtn { display:inline-block; background:#0ea5a4; color:white; text-decoration:none; padding:8px 14px; border-radius:9999px; cursor:pointer; box-shadow: 0 1px 0 rgba(0,0,0,0.05) }
        .actions .dlbtn:hover { background:#0c8f8e }
      `}</style>
    </div>
  )
}
