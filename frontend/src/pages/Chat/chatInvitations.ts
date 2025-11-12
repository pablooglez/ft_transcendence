import { getActiveConversationId } from "./chatState";
import { getAccessToken } from "../../state/authState";

const apiHost = `${window.location.hostname}`

const friendCheckCache = new Map<number, boolean>();

export function clearFriendCheckCache(userId?: number) {
    if (userId !== undefined) {
        friendCheckCache.delete(userId);
    } else {
        friendCheckCache.clear();
    }
}

export async function acceptFriendInvitation() {
    try {
        const otherUserId = getActiveConversationId();
        const token = getAccessToken();
        const res = await fetch(`https://${apiHost}:8443/api/conversations/${otherUserId}/accept-friend`, {
            method: 'POST',
            headers: { 
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        if (otherUserId) {
            clearFriendCheckCache(otherUserId);
        }
        
        return await res.json();
    } catch (err: any) {
    }
}

export async function rejectFriendInvitation() {
    try {
        const otherUserId = getActiveConversationId();
        const token = getAccessToken();
        const res = await fetch(`https://${apiHost}:8443/api/conversations/${otherUserId}/reject-friend`, {
            method: 'POST',
            headers: { 
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        if (otherUserId) {
            clearFriendCheckCache(otherUserId);
        }
        
        return await res.json();
    } catch (err: any) {
    }
}

export async function checkAlreadyFriend() {
    try {
        const otherUserId = getActiveConversationId();
        
        if (!otherUserId) {
            return false;
        }

        if (friendCheckCache.has(otherUserId)) {
            return friendCheckCache.get(otherUserId)!;
        }

        const token = getAccessToken();
        const res = await fetch(`https://${apiHost}:8443/api/users/checkFriend`, {
            method: 'POST',
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ friendId: otherUserId })
        });
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        const isFriend = data.isFriend || false;
        
        // Cache the result
        friendCheckCache.set(otherUserId, isFriend);
        
        return isFriend;
    } catch (err) {
        return false;
    }
}

export async function sendFriendInvitation() {
    try {
        const otherUserId = getActiveConversationId();
        const token = getAccessToken();
        const res = await fetch(`https://${apiHost}:8443/api/conversations/${otherUserId}/invite-friend`, {
            method: 'POST',
            headers: { 
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        if (otherUserId) {
            clearFriendCheckCache(otherUserId);
        }
        
        return await res.json();
    } catch (err) {
    }
}
