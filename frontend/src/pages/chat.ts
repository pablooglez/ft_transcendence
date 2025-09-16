import { getConversations, sendMessage } from "../services/api";

export function Chat(): string {
    return `
        <div class="whatsapp-container">
            <!-- Left sidebar: Conversations list -->
            <div class="conversations-sidebar">
                <div class="sidebar-header">
                    <h2>Chats</h2>
                    <button id="load-conversations" class="refresh-btn">
                        <span>↻</span>
                    </button>
                </div>
                
                <div class="conversations-list" id="conversations-list">
                    <!-- Conversations will be loaded here dynamically -->
                    <div class="no-conversations">
                        <p>Click ↻ to load conversations</p>
                    </div>
                </div>
            </div>

            <!-- Main chat area -->
            <div class="chat-area">
                <!-- Chat header -->
                <div class="chat-header">
                    <div class="contact-info">
                        <div class="contact-avatar">👤</div>
                        <div class="contact-details">
                            <h3 id="contact-name">Select a conversation</h3>
                            <span id="contact-status">Online</span>
                        </div>
                    </div>
                </div>

                <!-- Messages area -->
                <div class="messages-container" id="messages-container">
                    <div class="welcome-message">
                        <div class="welcome-icon">💬</div>
                        <h3>Welcome to Chat</h3>
                        <p>Select a conversation or start a new one to begin chatting.</p>
                    </div>
                </div>

                <!-- Message input area -->
                <div class="message-input-area">
                    <form id="message-form" class="message-form">
                        <input 
                            type="number" 
                            id="recipient-id" 
                            placeholder="ID destinatario" 
                            class="recipient-input"
                            required 
                        />
                        <div class="input-with-button">
                            <input 
                                type="text" 
                                id="message-content" 
                                placeholder="Write a message..." 
                                class="message-input"
                                required 
                            />
                            <button type="submit" class="send-button">
                                ➤
                            </button>
                        </div>
                    </form>
                    <div id="message-result" class="message-result"></div>
                </div>
            </div>
        </div>
    `;
}

export function chatHandlers() {
    // Get DOM elements with TypeScript types
    const messageForm = document.getElementById('message-form') as HTMLFormElement;
    const loadButton = document.getElementById('load-conversations') as HTMLButtonElement;
    const messageResult = document.getElementById('message-result') as HTMLDivElement;
    const conversationsList = document.getElementById('conversations-list') as HTMLDivElement;

    if (!messageForm || !loadButton || !messageResult || !conversationsList) {
        console.error('Chat elements not found in DOM');
        return;
    }

    // Handle message form submission
    messageForm.addEventListener('submit', async (e: Event) => {
        e.preventDefault();
        
        const recipientIdInput = document.getElementById('recipient-id') as HTMLInputElement;
        const messageContentInput = document.getElementById('message-content') as HTMLInputElement;
        
        if (!recipientIdInput || !messageContentInput) {
            messageResult.innerHTML = '<span class="error">Form elements not found</span>';
            messageResult.className = 'message-result error';
            return;
        }

        const recipientId = parseInt(recipientIdInput.value);
        const content = messageContentInput.value;

        if (isNaN(recipientId) || !content.trim()) {
            messageResult.innerHTML = '<span class="error">Please fill all fields correctly</span>';
            messageResult.className = 'message-result error';
            return;
        }

        try {
            messageResult.innerHTML = 'Sending message...';
            messageResult.className = 'message-result';
            
            const result = await sendMessage(recipientId, content);
            
            messageResult.innerHTML = `<span class="success">✅ Message sent successfully!</span>`;
            messageResult.className = 'message-result success';
            
            // Clear form
            messageContentInput.value = '';
            
            console.log('Message sent:', result);
            
        } catch (error) {
            console.error('Error sending message:', error);
            messageResult.innerHTML = `<span class="error">❌ Error sending message: ${error}</span>`;
            messageResult.className = 'message-result error';
        }
    });

    // Handle load conversations button
    loadButton.addEventListener('click', async () => {
        try {
            conversationsList.innerHTML = '<div class="loading">Loading conversations...</div>';
            
            const result = await getConversations();
            
            if (result.conversations && result.conversations.length > 0) {
                conversationsList.innerHTML = result.conversations
                    .map((conv: any) => `
                        <div class="conversation-item" data-conversation-id="${conv.id}">
                            <div class="conversation-avatar">${conv.otherUserId.toString().slice(-1)}</div>
                            <div class="conversation-info">
                                <div class="conversation-name">User ${conv.otherUserId}</div>
                                <div class="conversation-preview">Last updated: ${new Date(conv.updatedAt).toLocaleString()}</div>
                            </div>
                        </div>
                    `).join('');
                    
                console.log('Conversations loaded:', result);
            } else {
                conversationsList.innerHTML = `
                    <div class="no-conversations">
                        <p>No conversations found. Send a message to start chatting!</p>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Error loading conversations:', error);
            conversationsList.innerHTML = `
                <div class="no-conversations">
                    <p style="color: red;">❌ Error loading conversations: ${error}</p>
                </div>
            `;
        }
    });
}