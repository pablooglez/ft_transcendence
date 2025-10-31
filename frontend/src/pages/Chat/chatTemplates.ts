export function getChatHtml(): string {
    return `
        <div class="whatsapp-container">
            <!-- Left sidebar: Conversations list -->
            <div class="conversations-sidebar">
                <div class="sidebar-header">
                    <h2>Chats</h2>
                    <div id="connection-status" class="connection-status">
                        <span class="status-indicator">●</span>
                        <span class="status-text">Connecting...</span>
                    </div>
                </div>
                
                <!-- New Chat Button - Always visible -->
                <div class="new-chat-section">
                    <button id="sidebar-new-chat" class="sidebar-new-chat-btn">
                        <span>+</span> New Chat
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
                            <span id="contact-status"></span>
                        </div>
                    </div>
                    <div class="chat-actions">
                        <button id="view-profile-btn" class="view-profile-btn" title="View profile">
                            👤
                        </button>
                        <button id="invite-game-btn" class="invite-game-btn" title="Invite to play Pong">
                            🎮
                        </button>
                        <button id="block-user-btn" class="block-btn" title="Block user">
                            🚫
                        </button>
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
                        <div class="input-with-button">
                            <input 
                                type="text" 
                                id="message-content" 
                                placeholder="Escribe un mensaje..." 
                                class="message-input"
                                required 
                            />
                            <button type="submit" class="send-button">
                                <span>↗</span>
                            </button>
                        </div>
                        <div id="message-result" class="message-result"></div>
                    </form>
                    
                    <!-- New chat modal -->
                    <div id="new-chat-modal" class="modal" style="display: none;">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3>Start New Chat</h3>
                                <button id="close-new-chat-modal" class="close-button">×</button>
                            </div>
                            <div class="modal-body">
                                <input 
                                    type="text" 
                                    id="user-search" 
                                    placeholder="Search users by username..." 
                                    class="user-search-input"
                                />
                                <div id="user-search-results" class="user-search-results"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Profile Modal -->
        <div id="profile-modal" class="profile-modal" style="display: none;">
            <div class="profile-modal-content">
                <div class="profile-modal-header">
                    <h2>User Profile</h2>
                    <button id="close-profile-modal" class="close-modal-btn">✕</button>
                </div>
                <div class="profile-modal-body">
                    <div class="profile-avatar-large" id="profile-avatar">?</div>
                    <h3 id="profile-username" class="profile-username">Username</h3>
                    <div class="profile-info">
                        <div class="profile-info-item">
                            <span class="profile-label">User ID:</span>
                            <span id="profile-id" class="profile-value">-</span>
                        </div>
                        <div class="profile-info-item">
                            <span class="profile-label">Victories:</span>
                            <span id="profile-victories" class="profile-value">-</span>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button id="invite-from-profile-btn" class="profile-action-btn invite-btn">
                            🎮 Invite to Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}