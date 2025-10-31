import { 
    searchUsersByUsername, 
    getAvailableUsers, 
    getCurrentUserId,
    renderUserList,
    attachUserClickHandlers,
    getConnectedUsersList,
    } from "./chatUtils";

import { UI_MESSAGES } from "./chatConstants";

// Function to handle user search
export async function handleUserSearch(query: string) {
    const userSearchResults = document.getElementById('user-search-results') as HTMLDivElement;

    try {
        userSearchResults.innerHTML = `<div class="loading">${UI_MESSAGES.SEARCHING_USERS}</div>`;

        // First try to search, if it fails, filter from available users
        let users;
        try {
            users = await searchUsersByUsername(query);
        } catch (error) {
            // Fallback: filter from available users
            const allUsers = await getAvailableUsers();
            users = allUsers.filter((user: any) => 
                user.username.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (users && users.length > 0) {
            const currentUserId = getCurrentUserId();
            const filteredUsers = users.filter((user: any) => user.id !== currentUserId);
            const connectedUsers = getConnectedUsersList();

            // Separate online and offline users
            const onlineUsers = filteredUsers.filter((user: any) => connectedUsers.includes(user.id));
            const offlineUsers = filteredUsers.filter((user: any) => !connectedUsers.includes(user.id));

            let html = '';

            if (onlineUsers.length > 0) {
                html += '<div class="users-section"><h4>🟢 Online Results</h4>';
                html += renderUserList(onlineUsers, true);
                html += '</div>';
            }

            if (offlineUsers.length > 0) {
                html += '<div class="users-section"><h4>⚫ Offline Results</h4>';
                html += renderUserList(offlineUsers, false);
                html += '</div>';
            }

            if (html) {
                userSearchResults.innerHTML = html;
                attachUserClickHandlers();
            } else {
                userSearchResults.innerHTML = '<div class="no-results">No matching users found</div>';
            }
        } else {
            userSearchResults.innerHTML = '<div class="no-results">No users found</div>';
        }
    } catch (error) {
        userSearchResults.innerHTML = '<div class="error">Error searching users</div>';
    }
}