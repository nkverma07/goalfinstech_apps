import fs from 'fs'
import path from 'path'

// The app records live in data/apps.json. CI in each app repo pushes updated
// `version` + `downloadUrl` into that file whenever a new APK is published, so
// this endpoint always reflects the latest released build.
export default function handler(req, res) {
  const file = path.join(process.cwd(), 'data', 'apps.json')
  let apps
  try {
    apps = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    console.error('failed to read app metadata', err)
    return res.status(500).json({ error: 'metadata unavailable' })
  }
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json(apps)
}
