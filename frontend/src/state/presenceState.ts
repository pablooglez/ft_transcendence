// Global state for tracking online/offline status of users

// Set of user IDs that are currently online
let onlineUsers = new Set<number>();

// Callbacks to notify when presence changes
type PresenceChangeCallback = (userId: number, isOnline: boolean) => void;
const presenceChangeCallbacks: PresenceChangeCallback[] = [];

/**
 * Initialize the online users list
 */
export function setOnlineUsers(userIds: number[]): void {
    onlineUsers = new Set(userIds);
    notifyPresenceListeners();
}

/**
 * Mark a user as online
 */
export function setUserOnline(userId: number): void {
    const wasOnline = onlineUsers.has(userId);
    onlineUsers.add(userId);
    
    if (!wasOnline) {
        notifyPresenceListeners(userId, true);
    }
}

/**
 * Mark a user as offline
 */
export function setUserOffline(userId: number): void {
    const wasOnline = onlineUsers.has(userId);
    onlineUsers.delete(userId);
    
    if (wasOnline) {
        notifyPresenceListeners(userId, false);
    }
}

/**
 * Check if a user is online
 */
export function isUserOnline(userId: number): boolean {
    return onlineUsers.has(userId);
}

/**
 * Get all online users
 */
export function getOnlineUsers(): number[] {
    return Array.from(onlineUsers);
}

/**
 * Subscribe to presence changes
 */
export function onPresenceChange(callback: PresenceChangeCallback): void {
    presenceChangeCallbacks.push(callback);
}

/**
 * Unsubscribe from presence changes
 */
export function offPresenceChange(callback: PresenceChangeCallback): void {
    const index = presenceChangeCallbacks.indexOf(callback);
    if (index > -1) {
        presenceChangeCallbacks.splice(index, 1);
    }
}

/**
 * Notify all listeners about presence changes
 */
function notifyPresenceListeners(userId?: number, isOnline?: boolean): void {
    presenceChangeCallbacks.forEach(callback => {
        if (userId !== undefined && isOnline !== undefined) {
            callback(userId, isOnline);
        }
    });
}

/**
 * Clear all online users (useful on logout)
 */
export function clearPresenceState(): void {
    onlineUsers.clear();
    presenceChangeCallbacks.length = 0;
}
