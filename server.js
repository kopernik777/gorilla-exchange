const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gorilla2024';
const RATES_FILE = path.join(__dirname, 'rates.json');

app.use(express.json());
app.use(express.static(__dirname));

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
    res.json({ ok: true, updatedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: 'Не удалось сохранить курсы' });
  }
});

app.listen(PORT, () => {
  console.log(`Gorilla Exchange запущен на порту ${PORT}`);
});
