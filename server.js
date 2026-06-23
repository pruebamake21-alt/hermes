const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API simple para simular endpoints del mensajero Hermes
app.post('/api/send', (req, res) => {
  const { message, recipient } = req.body;
  if (!message || !recipient) {
    return res.status(400).json({ error: 'Message and recipient are required' });
  }
  // Simulamos velocidad de Hermes
  res.json({
    success: true,
    messageId: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    deliveryTimeMs: Math.floor(Math.random() * 300) + 50
  });
});

app.listen(PORT, () => {
  console.log(`Hermes running on port ${PORT}`);
});
