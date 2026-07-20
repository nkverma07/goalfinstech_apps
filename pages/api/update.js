import fs from 'fs'
import path from 'path'

// Returns the current latest version + download URL for a single app.
// The metadata is kept fresh by each app repo's CI, which commits the new
// version and downloadUrl into data/apps.json on every release.
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { appId } = req.body || {}
  if (!appId) return res.status(400).json({ error: 'missing appId' })

  const file = path.join(process.cwd(), 'data', 'apps.json')
  let apps
  try {
    apps = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    console.error('failed to read app metadata', err)
    return res.status(500).json({ error: 'metadata unavailable' })
  }

  const app = apps.find((a) => a.id === appId)
  if (!app) return res.status(404).json({ error: 'unknown appId' })

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({ newVersion: app.version, downloadUrl: app.downloadUrl })
}
