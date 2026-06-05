const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gorilla2024';
const RATES_FILE = path.join(__dirname, 'rates.json');
const HISTORY_FILE = path.join(__dirname, 'history.json');

app.use(express.json());
app.use(express.static(__dirname));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/rates', (req, res) => {
  try {
    const rates = JSON.parse(fs.readFileSync(RATES_FILE, 'utf8'));
    res.json(rates);
  } catch {
    res.status(500).json({ error: 'Не удалось загрузить курсы' });
  }
});

app.post('/api/rates', (req, res) => {
  const { password, rates } = req.body || {};
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }
  if (!rates || typeof rates !== 'object') {
    return res.status(400).json({ error: 'Неверный формат данных' });
  }
  try {
    fs.writeFileSync(RATES_FILE, JSON.stringify(rates, null, 2));
    saveHistory(rates);
    res.json({ ok: true, updatedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: 'Не удалось сохранить курсы' });
  }
});

app.get('/api/history', (req, res) => {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return res.json([]);
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    res.json(history.slice(-30));
  } catch {
    res.json([]);
  }
});

function saveHistory(rates) {
  let history = [];
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch {}
  history.push({ ts: Date.now(), rates });
  if (history.length > 90) history = history.slice(-90);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gorilla Exchange запущен на порту ${PORT}`);
  console.log(`Listening on 0.0.0.0:${PORT}`);
});
