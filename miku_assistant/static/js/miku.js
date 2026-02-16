// Miku AI Client Logic

const API_BASE = window.location.origin;
let room = null;
let currentMicTrack = null;
let isRecording = false;

// DOM Elements
const chatContainer = document.getElementById('chat-container');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const avatarContainer = document.getElementById('miku-avatar');
const visualizerBars = document.querySelectorAll('.bar');

// Helper: Add Message to Chat
function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Web Speech API for STT
const recognition = 'webkitSpeechRecognition' in window ? new webkitSpeechRecognition() : null;
if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN'; // Suggesting Hinglish but starting with Hindi/Indian base

    recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        addMessage("Sun rahi hoon... 🎤", "system");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        textInput.value = transcript;
        sendText();
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        stopRecording();
    };

    recognition.onend = () => {
        stopRecording();
    };
}

function stopRecording() {
    isRecording = false;
    micBtn.classList.remove('recording');
}

// 2. Microphone Logic
micBtn.addEventListener('click', async () => {
    if (!recognition) {
        alert("Aapka browser voice input support nahi karta. Please use Chrome.");
        return;
    }

    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

// Helper: Update Avatar Emotion
function setEmotion(emotion) {
    const img = avatarContainer.querySelector('img');
    const avatar = document.getElementById('miku-avatar');

    // Remove all emotion classes
    avatar.classList.remove('emo-happy', 'emo-blush', 'emo-comfort', 'emo-excited', 'emo-thoughtful');

    if (emotion) {
        avatar.classList.add(`emo-${emotion}`);
    }

    // Visual feedback
    if (emotion === 'happy' || emotion === 'excited') {
        avatarContainer.style.borderColor = '#FF66CC';
        img.style.transform = 'scale(1.1)';
    } else if (emotion === 'blush') {
        avatarContainer.style.borderColor = '#FF99CC';
        avatar.style.boxShadow = '0 0 40px #FF99CC';
    } else if (emotion === 'thoughtful') {
        avatarContainer.style.borderColor = '#00FFFF';
    } else {
        avatarContainer.style.borderColor = '#00FFFF';
    }

    setTimeout(() => {
        img.style.transform = 'scale(1)';
    }, 2000);
}

// 3. Text Chat Logic
async function sendText() {
    const text = textInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    textInput.value = '';

    // Show thinking state
    const avatar = document.getElementById('miku-avatar');
    avatar.classList.add('thinking');

    try {
        const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        avatar.classList.remove('thinking');
        const data = await res.json();

        if (data.reply) {
            console.log("Miku Reply:", data.reply);
            addMessage(data.reply, 'miku');
            if (data.emotion) setEmotion(data.emotion);

            // Play Audio
            if (data.audio) {
                console.log("Audio received, playing...");
                const audioBlob = b64toBlob(data.audio, "audio/mpeg");
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);

                // Visualizer effect while playing
                const avatar = document.getElementById('miku-avatar');
                avatar.classList.add('speaking');

                audio.play().then(() => {
                    console.log("Audio playing started.");
                }).catch(e => {
                    console.error("Audio play failed:", e);
                });

                audio.onended = () => {
                    avatar.classList.remove('speaking');
                    URL.revokeObjectURL(audioUrl);
                };
            } else {
                console.warn("No audio data received from server. Using browser fallback TTS...");
                speakFallback(data.reply);
            }
        }
    } catch (e) {
        console.error("Fetch error:", e);
        addMessage("Error communicating with Miku.", "system");
        avatar.classList.remove('thinking');
    }
}

function speakFallback(text) {
    if (!window.speechSynthesis) return;

    // Clean text for speaking (remove emotion tags)
    const cleanText = text.replace(/\[.*?\]/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN'; // Fallback to Hindi voice
    utterance.rate = 1.1;
    utterance.pitch = 1.2; // Slightly higher for cute feel

    const avatar = document.getElementById('miku-avatar');
    avatar.classList.add('speaking');

    utterance.onend = () => {
        avatar.classList.remove('speaking');
    };

    window.speechSynthesis.speak(utterance);
}

// Helper: Base64 to Blob
function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
}

sendBtn.addEventListener('click', sendText);
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendText();
});

// 4. Audio Visualization (Simple CSS Animation Trigger)
function startVisualizer(track) {
    // In a real app, use Web Audio API AnalyzerNode
    // Here we just simulate activity based on track attaching
    // Since we can't easily access raw audio level without AudioContext setup in this snippet
    // We'll rely on the CSS animation or LiveKit's AudioAnalyser
}

// Initialize
window.addEventListener('load', () => {
    // Optionally auto-connect or wait for user interaction
});
