// AI API Configuration
// استخدام Cohere API (مجاني وقوي!)
// احصل على API Key من: https://dashboard.cohere.com/api-keys
const COHERE_API_KEY = 'radI4orV6TnlrEfh1sWrl60jfrAaX6A4irafoaB5';

// Chat state
let conversationHistory = [];

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChat');
const quickQuestionBtns = document.querySelectorAll('.quick-question-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Clear chat history on page load
    localStorage.removeItem('doctorAI_chatHistory');
    conversationHistory = [];
    
    setupEventListeners();
    autoResizeTextarea();
});

function setupEventListeners() {
    chatForm.addEventListener('submit', handleSubmit);
    clearChatBtn.addEventListener('click', clearChat);
    messageInput.addEventListener('input', autoResizeTextarea);
    
    quickQuestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.dataset.question;
            messageInput.value = question;
            handleSubmit(new Event('submit'));
        });
    });
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Check API key
    if (COHERE_API_KEY === 'YOUR_COHERE_API_KEY_HERE' || !COHERE_API_KEY) {
        showToast('⚠️ يرجى إضافة Cohere API Key في ملف doctor-ai.js', 'error');
        return;
    }
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Hide welcome message
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.style.display = 'none';
    }
    
    // Add user message
    addMessage(message, 'user');
    
    // Show typing indicator
    const typingId = showTypingIndicator();
    
    // Disable send button
    sendBtn.disabled = true;
    
    try {
        const response = await sendToCohere(message);
        removeTypingIndicator(typingId);
        addMessage(response, 'assistant');
    } catch (error) {
        removeTypingIndicator(typingId);
        const errorMsg = error.message || 'حدث خطأ في الاتصال';
        addMessage(`عذراً، ${errorMsg}. يرجى المحاولة مرة أخرى.`, 'assistant');
        showToast(`❌ ${errorMsg}`, 'error');
        console.error('Error details:', error);
    } finally {
        sendBtn.disabled = false;
    }
}

// Cohere API (مجاني وقوي!)
async function sendToCohere(userMessage) {
    conversationHistory.push({
        role: 'user',
        content: userMessage
    });
    
    const systemPrompt = `أنت دكتور متخصص في الصيدلة والطب العام. اسمك "الدكتور AI" وتعمل في صيدلية هشام.

مهمتك:
- الإجابة على الأسئلة الطبية والصحية بشكل دقيق ومفيد
- تقديم معلومات عن الأدوية واستخداماتها
- تقديم نصائح صحية عامة
- التحدث باللغة العربية بشكل واضح ومهني

قواعد مهمة:
- دائماً انصح المريض باستشارة الطبيب للحالات الخطيرة
- لا تصف أدوية محددة بدون استشارة طبية
- كن متعاطفاً ومهنياً
- اجعل إجاباتك واضحة ومختصرة
- استخدم رموز تعبيرية مناسبة`;

    // Build chat history for Cohere
    const chatHistory = [];
    for (let i = 0; i < conversationHistory.length - 1; i++) {
        const msg = conversationHistory[i];
        chatHistory.push({
            role: msg.role === 'user' ? 'USER' : 'CHATBOT',
            message: msg.content
        });
    }
    
    const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${COHERE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: userMessage,
            preamble: systemPrompt,
            chat_history: chatHistory,
            model: 'command-r-08-2024',
            temperature: 0.7,
            max_tokens: 500
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `خطأ في API: ${response.status}`);
    }
    
    const data = await response.json();
    const assistantMessage = data.text.trim();
    
    conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
    });
    
    saveChatHistory();
    return assistantMessage;
}

function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'user' 
        ? '<i class="fas fa-user"></i>' 
        : '<i class="fas fa-user-md"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-user-md"></i>';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'message-content';
    typingContent.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typingContent);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return 'typing-indicator';
}

function removeTypingIndicator(id) {
    const typingDiv = document.getElementById(id);
    if (typingDiv) {
        typingDiv.remove();
    }
}

function clearChat() {
    if (confirm('هل تريد مسح المحادثة؟')) {
        conversationHistory = [];
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">👨‍⚕️</div>
                <h3>مرحباً بك في عيادة الدكتور AI</h3>
                <p>أنا هنا للإجابة على أسئلتك الطبية والصحية</p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="ما هي أعراض نزلات البرد؟">
                        <i class="fas fa-thermometer"></i>
                        أعراض نزلات البرد
                    </button>
                    <button class="quick-question-btn" data-question="ما هي فوائد فيتامين د؟">
                        <i class="fas fa-sun"></i>
                        فوائد فيتامين د
                    </button>
                    <button class="quick-question-btn" data-question="كيف أعالج الصداع؟">
                        <i class="fas fa-head-side-cough"></i>
                        علاج الصداع
                    </button>
                </div>
            </div>
        `;
        
        document.querySelectorAll('.quick-question-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                messageInput.value = question;
                handleSubmit(new Event('submit'));
            });
        });
        
        localStorage.removeItem('doctorAI_chatHistory');
        showToast('✅ تم مسح المحادثة', 'success');
    }
}

function saveChatHistory() {
    try {
        localStorage.setItem('doctorAI_chatHistory', JSON.stringify(conversationHistory));
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}

function loadChatHistory() {
    try {
        const saved = localStorage.getItem('doctorAI_chatHistory');
        if (saved) {
            conversationHistory = JSON.parse(saved);
            
            if (conversationHistory.length > 0) {
                const welcomeMsg = document.querySelector('.welcome-message');
                if (welcomeMsg) {
                    welcomeMsg.style.display = 'none';
                }
                
                conversationHistory.forEach(msg => {
                    addMessage(msg.content, msg.role);
                });
            }
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
});
