const messages = document.getElementById('chat-messages');
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');

function addMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message');
  msg.classList.add(sender === 'You' ? 'user' : 'ai');
  msg.innerHTML = `<strong>${sender}</strong>: ${text}`;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  addMessage('You', userText);
  input.value = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: userText }),
    });
    const data = await response.json();
    console.log('Proxy response:', data);
    const aiReply = data[0]?.generated_text || (data.error ? `Error: ${data.error}` : 'No response from AI.');
    addMessage('RecruitEase AI', aiReply);
  } catch (error) {
    console.error('Fetch error:', error);
    addMessage('RecruitEase AI', 'Error reaching the assistant.');
  }
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

micBtn.addEventListener('click', () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    sendMessage();
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    addMessage('RecruitEase AI', 'Voice input error.');
  };
});