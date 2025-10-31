
export function updateFriendBtn(otherUserId: number) {
    let addFriendBtn = document.getElementById('add-friend-btn') as HTMLButtonElement;
    let friendsSet = (window as any).friendsSet;
    if (addFriendBtn) {
        if (friendsSet.has(otherUserId)) {
            addFriendBtn.textContent = 'Remove friend';
            addFriendBtn.style.background = '#ff4444';
        } else {
            addFriendBtn.textContent = 'Add friend';
            addFriendBtn.style.background = '#25D366';
        }
        addFriendBtn.style.color = 'white';
        addFriendBtn.style.border = 'none';
        addFriendBtn.style.borderRadius = '6px';
        addFriendBtn.style.padding = '4px 12px';
        addFriendBtn.style.cursor = 'pointer';
    }
}