import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const distDir = path.join(__dirname, 'dist');
const saveDir = path.join(__dirname, 'saved-projects');

app.use(express.json({ limit: '25mb' }));

app.post('/api/save', async (req, res) => {
  const { projectName = 'project', files = {} } = req.body;
  try {
    await fs.mkdir(saveDir, { recursive: true });
    const fileName = `${projectName}-${Date.now()}.json`;
    const filePath = path.join(saveDir, fileName);
    await fs.writeFile(filePath, JSON.stringify({ projectName, files, savedAt: new Date().toISOString() }, null, 2), 'utf8');
    return res.status(200).json({ success: true, path: fileName });
  } catch (error) {
    console.error('Save API error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save project.' });
  }
});

app.get('/api/ping', (req, res) => {
  res.json({ ok: true, message: 'Backend is running' });
});

app.use(express.static(distDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
