document.addEventListener('DOMContentLoaded', () => {
    const chatUI = {
        inputField: document.getElementById('user-input'),
        chatMessages: document.getElementById('chat-messages'),
        sendBtn: document.getElementById('send-btn'),
        isProcessing: false,

        init() {
            this.addEventListeners();
            //this.restoreHistory();
            
        },

        addEventListeners() {
            this.sendBtn.addEventListener('click', () => this.handleSend());
            this.inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!this.isProcessing) this.handleSend();
                }
            });
        },

        async handleSend() {
            if (this.isProcessing || !this.inputField.value.trim()) return;

            try {
                this.toggleProcessingState(true);
                const message = this.inputField.value.trim();
                this.addMessage(message, 'user');
                this.clearInput();

                const response = await this.sendToBackend(message);
                this.addMessage(response.parts, 'bot');
                this.saveHistory();
            } catch (error) {
                console.error('API Error:', error);
                this.showErrorMessage();
            } finally {
                this.toggleProcessingState(false);
            }
        },

        async sendToBackend(message) {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        },

        toggleProcessingState(isProcessing) {
            this.isProcessing = isProcessing;
            this.sendBtn.disabled = isProcessing;
            this.inputField.disabled = isProcessing;
            this.sendBtn.innerHTML = isProcessing 
                ? '<i class="fas fa-spinner fa-spin"></i>'
                : '<i class="fas fa-paper-plane"></i>';
        },

        addMessage(content, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            messageDiv.innerHTML = `
                <div class="message-content">
                    <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'} message-icon"></i>
                    <div class="message-text">${this.sanitizeInput(content)}</div>
                </div>
            `;
            this.chatMessages.appendChild(messageDiv);
            this.scrollToBottom();
        },

        sanitizeInput(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        clearInput() {
            this.inputField.value = '';
        },

        scrollToBottom() {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        },
        

        showErrorMessage() {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message system-message';
            errorDiv.innerHTML = `
                <div class="message-content">
                    <i class="fas fa-exclamation-triangle message-icon"></i>
                    <div class="message-text">Connection error. Please try again.</div>
                </div>
            `;
            this.chatMessages.appendChild(errorDiv);
            this.scrollToBottom();
        },

        saveHistory() {
            const messages = Array.from(this.chatMessages.children)
                .map(el => ({
                    role: el.classList.contains('user-message') ? 'user' : 'bot',
                    content: el.querySelector('.message-text').textContent
                }));
            localStorage.setItem('chatHistory', JSON.stringify(messages));
        },

        scrollToBottom() {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        },
        

        restoreHistory() {
            const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            this.chatMessages.innerHTML = '';
            history.forEach(msg => this.addMessage(msg.content, msg.role));
        }
    };

    chatUI.init();
});
