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