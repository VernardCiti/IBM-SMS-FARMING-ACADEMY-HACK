document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatContainer = document.getElementById('chat-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const connectionToggle = document.getElementById('connection-toggle');
    const phoneNumber = document.getElementById('phone-number');
    const statusIndicator = document.getElementById('status-indicator');
    const clearChatButton = document.getElementById('clear-chat');
    const currentTimeElement = document.getElementById('current-time');
    
    // State Variables
    let isOnline = true;
    let isTyping = false;
    let networkSpeed = 'normal'; // normal, slow
    let isRequestInProgress = false;
    let userProgress = {
        lessons: {},
        quizzes: {},
        certificateEarned: false
    };
    
    // Certificate info
    const certificateData = {
        name: "Farmer",
        phone: phoneNumber.value,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        id: generateCertificateId()
    };
    
    // Load chat history from localStorage
    loadChatHistory();
    
    // Update clock
    updateClock();
    setInterval(updateClock, 60000);
    
    // Event Listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', function() {
        if (messageInput.value.trim() === '') {
            sendButton.setAttribute('disabled', 'disabled');
        } else {
            sendButton.removeAttribute('disabled');
        }
    });
    
    // Initially disable send button
    if (messageInput.value.trim() === '') {
        sendButton.setAttribute('disabled', 'disabled');
    }
    
    connectionToggle.addEventListener('change', function() {
        const status = this.value;
        document.body.className = status;
        
        if (status === 'online') {
            isOnline = true;
            statusIndicator.textContent = 'Online';
            networkSpeed = 'normal';
        } else if (status === 'offline') {
            isOnline = false;
            statusIndicator.textContent = 'Offline';
        } else if (status === 'slow') {
            isOnline = true;
            statusIndicator.textContent = 'Poor Connection';
            networkSpeed = 'slow';
        }
    });
    
    clearChatButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the chat history? This will reset your progress.')) {
            chatContainer.innerHTML = '';
            localStorage.removeItem('smsChat');
            localStorage.removeItem('userProgress');
            userProgress = {
                lessons: {},
                quizzes: {},
                certificateEarned: false
            };
            
            // Add welcome message
            const welcomeMsg = document.createElement('div');
            welcomeMsg.className = 'message service-message';
            welcomeMsg.textContent = 'SMS Farming Academy activated. Send "farm" to get started with IBM-certified training.';
            chatContainer.appendChild(welcomeMsg);
            
            // Add animation
            welcomeMsg.style.animation = 'none';
            welcomeMsg.offsetHeight; // Trigger reflow
            welcomeMsg.style.animation = null;
        }
    });
    
    // Functions
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message || isRequestInProgress) return;
        
        // Set flag to prevent multiple requests
        isRequestInProgress = true;
        
        // Disable send button
        sendButton.disabled = true;
        
        // Add user message to chat
        addMessage(message, 'user');
        messageInput.value = '';
        
        if (!isOnline) {
            // Show message failed notification
            setTimeout(() => {
                const failedMsg = document.createElement('div');
                failedMsg.className = 'message service-message';
                failedMsg.textContent = 'Message not sent. You are offline.';
                chatContainer.appendChild(failedMsg);
                scrollToBottom();
                saveChatHistory();
                isRequestInProgress = false;
                sendButton.disabled = true;
            }, 1000);
            return;
        }
        
        // Check for special commands
        if (message.toLowerCase() === 'certificate' && hasCompletedAllLessons()) {
            showCertificate();
            isRequestInProgress = false;
            sendButton.disabled = false;
            return;
        }
        
        // Show typing indicator
        showTypingIndicator();
        
        // Determine delay based on network speed
        const networkDelay = networkSpeed === 'slow' ? getRandom(3000, 6000) : getRandom(500, 1500);
        
        // Send to backend with simulated network delay
        setTimeout(() => {
            // For demo purposes, handle certain commands locally
            if (message.toLowerCase() === 'farm') {
                // Remove typing indicator
                hideTypingIndicator();
                
                setTimeout(() => {
                    const response = `👋 Welcome to the IBM SMS Farming Academy! 🌱\n\nI'm your virtual farming assistant, powered by IBM watsonx.ai.\n\nI can help you learn about sustainable farming practices, resource efficiency, and modern agricultural techniques.\n\nTo get started, reply with a topic:\n- "water" for water conservation\n- "soil" for soil management\n- "crops" for crop selection\n- "topics" for all available lessons\n\n🌍 Aligns with SDG 8.2 - Achieving higher economic productivity through technology`;
                    addMessage(response, 'bot');
                    updateProgress('started', true);
                    
                    isRequestInProgress = false;
                    sendButton.disabled = false;
                }, networkSpeed === 'slow' ? getRandom(1000, 2000) : getRandom(500, 1000));
                
                return;
            }
            
            if (message.toLowerCase() === 'certificate') {
                // Remove typing indicator
                hideTypingIndicator();
                
                setTimeout(() => {
                    const response = `I'm sorry, but you need to complete all the lessons before receiving your certificate. Try learning about water conservation, soil management, or crop selection first.`;
                    addMessage(response, 'bot');
                    
                    isRequestInProgress = false;
                    sendButton.disabled = false;
                }, networkSpeed === 'slow' ? getRandom(1000, 2000) : getRandom(500, 1000));
                
                return;
            }
            
            // For demonstration purposes, we're using a mock API call
            // In a real application, this would connect to the IBM watsonx.ai API
            simulateAPICall(message).then(data => {
                // Remove typing indicator
                hideTypingIndicator();
                
                // Add response to chat with a brief delay to simulate reading/typing
                setTimeout(() => {
                    addMessage(data.response, 'bot');
                    
                    // IBM Judging Requirement: Add SDG badges
                    if (data.response.includes('🌍 Aligns with')) {
                        const sdgText = data.response.split('🌍 Aligns with ')[1];
                        addSDGBadge(sdgText);
                    }
                    
                    // Update progress
                    if (data.lesson) {
                        updateProgress(data.lesson, true);
                    }
                    
                    isRequestInProgress = false;
                    sendButton.disabled = false;
                }, networkSpeed === 'slow' ? getRandom(1000, 2000) : getRandom(500, 1000));
            }).catch(error => {
                console.error('Error:', error);
                hideTypingIndicator();
                
                // Show error message
                const errorMessage = "Sorry, there was an error connecting to the IBM server. This might be due to API key configuration or network issues. Please check your setup and try again.";
                
                setTimeout(() => {
                    addMessage(errorMessage, 'bot');
                    isRequestInProgress = false;
                    sendButton.disabled = false;
                }, getRandom(500, 1000));
            });
        }, networkDelay);
    }
    
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        // Create text element with preserved newlines
        const textElement = document.createElement('div');
        textElement.className = 'message-text';
        
        // Add IBM logo for bot messages
        if (type === 'bot' && !messageDiv.querySelector('.ibm-logo')) {
            const logoSpan = document.createElement('span');
            logoSpan.className = 'ibm-logo';
            logoSpan.innerHTML = '<img src="/static/favicon (1).ico" alt="IBM" width="18" height="18"> ';
            textElement.appendChild(logoSpan);
        }
        
        // Check if this is a certificate message
        if (type === 'bot' && text.includes('IBM Blockchain Certificate')) {
            messageDiv.className = 'message bot-message';
            textElement.innerHTML = createCertificateHTML();
        } else {
            // Replace newlines with <br> tags
            textElement.innerHTML += text.replace(/\n/g, '<br>');
            
            // Check for audio links and make them clickable
            if (text.includes('🎧 Audio lesson:')) {
                const audioUrl = text.split('🎧 Audio lesson: ')[1].trim();
                const audioLink = document.createElement('div');
                audioLink.className = 'audio-link';
                audioLink.innerHTML = `<a href="${audioUrl}" target="_blank" class="audio-button">Play Audio</a>`;
                textElement.appendChild(audioLink);
            }
        }
        
        messageDiv.appendChild(textElement);
        
        // Add timestamp
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = formatTime(new Date());
        messageDiv.appendChild(timeSpan);
        
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
        
        // Save chat history
        saveChatHistory();
    }
    
    // IBM Judging Requirement: Add SDG badges
    function addSDGBadge(sdgTarget) {
        const sdgBadge = document.createElement('div');
        sdgBadge.className = 'sdg-badge';
        sdgBadge.innerHTML = `
            <img src="/static/Sustainable_Development_Goal_8.png" 
                 alt="SDG Badge" 
                 title="${sdgTarget}">
            <div class="sdg-badge-text">${sdgTarget}</div>
        `;
        chatContainer.appendChild(sdgBadge);
        scrollToBottom();
        saveChatHistory();
    }
    
    function showTypingIndicator() {
        if (isTyping) return;
        
        isTyping = true;
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            indicator.appendChild(dot);
        }
        
        chatContainer.appendChild(indicator);
        scrollToBottom();
    }
    
    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
        isTyping = false;
    }
    
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    function updateClock() {
        const now = new Date();
        currentTimeElement.textContent = formatTime(now);
    }
    
    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function saveChatHistory() {
        localStorage.setItem('smsChat', chatContainer.innerHTML);
        localStorage.setItem('userProgress', JSON.stringify(userProgress));
    }
    
    function loadChatHistory() {
        const savedChat = localStorage.getItem('smsChat');
        const savedProgress = localStorage.getItem('userProgress');
        
        if (savedChat) {
            chatContainer.innerHTML = savedChat;
        } else {
            // Add welcome message if no history
            const welcomeMsg = document.createElement('div');
            welcomeMsg.className = 'message service-message';
            welcomeMsg.textContent = 'SMS Farming Academy activated. Send "farm" to start IBM-certified training 🌱';
            chatContainer.appendChild(welcomeMsg);
        }
        
        if (savedProgress) {
            userProgress = JSON.parse(savedProgress);
        }
    }
    
    function updateProgress(lesson, completed) {
        userProgress.lessons[lesson] = completed;
        saveChatHistory();
    }
    
    function hasCompletedAllLessons() {
        // For demo purposes, consider at least three lessons completed
        const requiredLessons = ['water', 'soil', 'crops'];
        return requiredLessons.every(lesson => userProgress.lessons[lesson]);
    }
    
    function showCertificate() {
        userProgress.certificateEarned = true;
        saveChatHistory();
        
        const certificateMessage = 'Congratulations! You have successfully completed the IBM SMS Farming Academy training. Here is your blockchain-verified certificate:';
        addMessage(certificateMessage, 'bot');
        
        // The certificate is added via the createCertificateHTML function in the addMessage function
        addMessage('IBM Blockchain Certificate', 'bot');
    }
    
    function createCertificateHTML() {
        return `
        <div class="certificate-container">
            <div class="certificate-header">
                <img src="/static/favicon (1).ico" alt="IBM Logo" class="certificate-ibm-logo">
                <h3 class="certificate-title">IBM Blockchain Certificate</h3>
            </div>
            <div class="certificate-content">
                <div class="certificate-name">${certificateData.phone}</div>
                <div class="certificate-achievement">
                    Has successfully completed the IBM SMS Farming Academy training on<br>
                    <strong>Sustainable Agriculture and Resource Efficiency</strong>
                </div>
                <div class="certificate-date">Issued on ${certificateData.date}</div>
                <div class="certificate-verification">Verified on IBM Blockchain • Certificate ID: ${certificateData.id}</div>
            </div>
            <div class="certificate-blockchain">
                Blockchain Verified • Tamper-proof • Globally Recognized
            </div>
            <div class="certificate-seal"></div>
            <div class="certificate-cta">
                <button class="certificate-button" onclick="alert('Certificate verification link would open here')">Verify Certificate</button>
            </div>
        </div>
        `;
    }
    
    function generateCertificateId() {
        return 'IBM-' + Math.random().toString(36).substring(2, 8).toUpperCase() + 
               '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    // Mock API call for demonstration
    function simulateAPICall(message) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let response = "";
                let lesson = null;
                
                const msgLower = message.toLowerCase();
                
                // Topic responses
                if (msgLower === 'water') {
                    lesson = 'water';
                    response = `🌊 *Water Conservation Techniques* 🌊\n\nWater is vital for agriculture. Here are 3 techniques to conserve water:\n\n1. Drip irrigation: Delivers water directly to plant roots, reducing waste by up to 60%\n\n2. Rainwater harvesting: Collect rainwater in tanks or ponds for later use\n\n3. Mulching: Apply organic material around plants to retain soil moisture\n\nTo test your knowledge, which technique is most efficient for water delivery?\n\na) Flood irrigation\nb) Drip irrigation\nc) Sprinkler systems\n\n🎧 Audio lesson: https://ibm.watsonx.ai/audio/water-lesson\n\n🌍 Aligns with SDG 8.4 - Improving resource efficiency in consumption`;
                } 
                else if (msgLower === 'soil') {
                    lesson = 'soil';
                    response = `🌱 *Soil Management Practices* 🌱\n\nHealthy soil is the foundation of sustainable farming. Key practices include:\n\n1. Crop rotation: Alternating crops to maintain soil nutrients\n\n2. Cover cropping: Planting beneficial crops during off-seasons\n\n3. Composting: Converting organic waste into rich fertilizer\n\nWhich practice helps prevent soil erosion?\n\na) Cover cropping\nb) Deep tilling\nc) Mono-cropping\n\n🎧 Audio lesson: https://ibm.watsonx.ai/audio/soil-lesson\n\n🌍 Aligns with SDG 8.2 - Achieving higher economic productivity through technology`;
                } 
                else if (msgLower === 'crops') {
                    lesson = 'crops';
                    response = `🌾 *Crop Selection & Rotation* 🌾\n\nSelecting the right crops increases yield and sustainability:\n\n1. Climate-appropriate varieties: Choose crops suited to your local conditions\n\n2. Drought-resistant crops: Varieties that require less water\n\n3. Intercropping: Growing multiple crops together for better resource use\n\nWhat is a benefit of intercropping?\n\na) Simplified harvesting\nb) Reduced pest problems\nc) Decreased labor requirements\n\n🎧 Audio lesson: https://ibm.watsonx.ai/audio/crops-lesson\n\n🌍 Aligns with SDG 8.4 - Improving resource efficiency in consumption`;
                }
                else if (msgLower === 'topics') {
                    response = `📚 *Available Training Topics* 📚\n\nChoose from these sustainable farming topics:\n\n• "water" - Water conservation techniques\n• "soil" - Soil management practices\n• "crops" - Crop selection and rotation\n• "market" - Market access strategies\n• "tools" - Low-cost farming tools\n\nTo start a lesson, simply reply with the topic name. Complete all core lessons (water, soil, crops) to earn your IBM Blockchain Certificate.\n\nNeed help? Text "help" anytime.`;
                }
                else if (msgLower === 'help') {
                    response = `ℹ️ *Help Guide* ℹ️\n\nWelcome to IBM SMS Farming Academy! Here's how to use this service:\n\n• Text "farm" to start\n• Text "topics" to see available lessons\n• Answer quiz questions with "a", "b", or "c"\n• Complete all core lessons to earn a certificate\n• Text "certificate" to view your earned certificate\n• Text "progress" to check your lesson completion\n\nThis service works with any mobile network and uses minimal data.`;
                }
                // Quiz answers
                else if (['a', 'b', 'c'].includes(msgLower)) {
                    const correctAnswers = {
                        'water': 'b',
                        'soil': 'a', 
                        'crops': 'b'
                    };
                    
                    // Determine which lesson this is answering
                    let currentLesson = null;
                    const messages = chatContainer.querySelectorAll('.message');
                    for (let i = messages.length - 1; i >= 0; i--) {
                        const text = messages[i].textContent;
                        if (text.includes('Water Conservation')) {
                            currentLesson = 'water';
                            break;
                        } else if (text.includes('Soil Management')) {
                            currentLesson = 'soil';
                            break;
                        } else if (text.includes('Crop Selection')) {
                            currentLesson = 'crops';
                            break;
                        }
                    }
                    
                    if (currentLesson && correctAnswers[currentLesson] === msgLower) {
                        response = `✅ Correct! Great job understanding ${currentLesson} management.\n\nYou've completed the ${currentLesson} lesson. This knowledge will help you improve your farm's productivity while using resources efficiently.\n\nReady for another lesson? Try "soil", "water", or "crops" if you haven't completed them yet.`;
                        updateProgress(currentLesson, true);
                    } else if (currentLesson) {
                        response = `❌ That's not quite right. The correct answer is ${correctAnswers[currentLesson]}.\n\nLet's review the key points about ${currentLesson} management again. You can text "${currentLesson}" to restart this lesson, or try another topic.`;
                    } else {
                        response = `I see you've sent an answer, but I'm not sure which question you're answering. Please text "water", "soil", or "crops" to start a lesson first.`;
                    }
                }
                else {
                    response = `I don't understand that command. Here are some options:\n\n• "farm" to start\n• "topics" to see available lessons\n• "water", "soil", or "crops" for specific lessons\n• "help" for assistance\n\nRemember to answer quiz questions with "a", "b", or "c".`;
                }
                
                resolve({
                    response: response,
                    lesson: lesson
                });
            }, 1000);
        });
    }
});

// Add IBM Plex font
(function() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Serif:wght@500;700&display=swap';
    document.head.appendChild(link);
})();