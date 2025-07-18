const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const open = require('open');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS, etc.)

// MongoDB connection
mongoose.connect('mongodb+srv://myuser:Recruit_Ease@cluster0.bqrv1f9.mongodb.net/RecruitEase?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Proxy route for Hugging Face API
app.post('/api/chat', async (req, res) => {
  const userText = req.body.text;
  if (!userText) {
    return res.status(400).json({ error: 'No text provided' });
  }

  console.log('Requesting AI response for:', userText);
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', 
      {
        inputs: `You are a helpful recruitment assistant for the RecruitEase system. Assist users with resume tips, interview advice, job application guidance, or recruitment-related queries. User: ${userText}`,
        parameters: { max_new_tokens: 100, temperature: 0.7 }
      },
      {
        headers: {
          Authorization: 'Bearer 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', 
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Hugging Face response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Hugging Face API error:', error.message, error.response?.status, error.response?.data);
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
});

// Existing routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send(`
        <script>
          if (confirm('User not found. Do you want to register?')) {
            window.location.href = '/register.html';
          } else {
            window.location.href = '/login.html';
          }
        </script>
      `);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send(`
        <script>
          alert('Invalid password');
          window.location.href = '/login.html';
        </script>
      `);
    }

    const username = email.split('@')[0];
    res.redirect(`/index.html?user=${encodeURIComponent(username)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send(`
        <script>
          alert('User already exists');
          window.location.href = '/login.html';
        </script>
      `);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    const username = email.split('@')[0];
    res.send(`
      <script>
        alert('User registered successfully!');
        window.location.href = '/index.html?user=${encodeURIComponent(username)}';
      </script>
    `);
  } catch (err) {
    console.error(err);
    res.status(400).send('Error registering user');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});