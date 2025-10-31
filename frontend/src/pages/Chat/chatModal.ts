import { loadAllUsers } from "./chatUtils";


// Function to open new chat modal
export async function openNewChatModal() {
    const newChatModal = document.getElementById('new-chat-modal') as HTMLDivElement;
    const userSearchInput = document.getElementById('user-search') as HTMLInputElement;
    if (newChatModal && userSearchInput) {
        newChatModal.style.display = 'block';
        userSearchInput.focus();
        // Load all users by default
        await loadAllUsers();
    }
}

export function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
            modal.style.display = 'none';
    }
}