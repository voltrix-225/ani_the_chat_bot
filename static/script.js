document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // Function to handle user input and bot response
    const sendMessage = () => {
        const message = userInput.value.trim();
        if (message === '') return;  // Prevent sending empty messages

        // Add user message to chat
        const userMessage = document.createElement('div');
        userMessage.classList.add('chat-message', 'user-message');
        userMessage.innerHTML = `<p>${message}</p>`;
        chatBox.appendChild(userMessage);

        // Clear input field
        userInput.value = '';

        // Scroll to bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight;

        // Send the message to Flask backend and get the bot's response
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            const botMessage = document.createElement('div');
            botMessage.classList.add('chat-message', 'bot-message');
            botMessage.innerHTML = `<p>${data.parts}</p>`;  // Display the bot's response
            chatBox.appendChild(botMessage);

            // Scroll to bottom after adding bot message
            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(error => console.error('Error:', error));
    };

    // Event listener for the send button
    sendButton.addEventListener('click', sendMessage);

    // Optional: Allow pressing "Enter" to send the message
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
