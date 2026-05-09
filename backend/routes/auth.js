const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  const ownerPass = process.env.ADMIN_OWNER_PASS;
  const editorPass = process.env.ADMIN_EDITOR_PASS;

  if (ownerPass && password === ownerPass) {
    return res.json({ role: 'owner' });
  }
  if (editorPass && password === editorPass) {
    return res.json({ role: 'editor' });
  }

  res.status(401).json({ error: 'Invalid password' });
});

module.exports = router;
