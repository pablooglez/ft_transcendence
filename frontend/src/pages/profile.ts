import { getUserIdByUsername, getUserById, getUserStatsById } from '../services/api';

/**
 * Search for a user by username, then fetch and return their profile data by ID.
 * @param username The username to search for
 * @returns The user profile data or an error message
 */
export async function fetchUserProfileByUsername(username: string) {
  try {
    const id = await getUserIdByUsername(username);
    if (!id) {
      return { error: 'User not found' };
    }
    const user = await getUserById(id);
    if (!user) {
      return { error: 'User data not found' };
    }
    const stats = await getUserStatsById(id);
    return { user, stats };
  } catch (err: any) {
    return { error: err.message || 'Unknown error' };
  }
}

export function Profile(): string {
  return `
    <div class="profile-search-container">
      <h1>Profile Search</h1>
      <div class="profile-search-bar">
        <input id="profile-search-input" type="text" placeholder="Enter username" />
        <button id="profile-search-btn">Search</button>
      </div>
      <div id="profile-result"></div>
    </div>
  `;
}

export function profileHandlers() {
  const btn = document.getElementById('profile-search-btn');
  if (!btn) return;
  btn.onclick = async function() {
    const input = document.getElementById('profile-search-input') as HTMLInputElement;
    const resultDiv = document.getElementById('profile-result');
    if (!input || !resultDiv) return;
    resultDiv.innerHTML = 'Loading...';
    const username = input.value.trim();
    if (!username) {
      resultDiv.innerHTML = 'Please enter a username.';
      return;
    }
    const res = await fetchUserProfileByUsername(username);
    if (res.error) {
      resultDiv.innerHTML = `<span style='color:red'>${res.error}</span>`;
    } else {
      const user = res.user;
      const stats = res.stats;
      resultDiv.innerHTML = `
        <div class="profile-card">
          <h2>${user.username}</h2>
          <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
          <div class="profile-stats">
            <span><strong>Victories:</strong> ${stats?.victories ?? 0}</span>
            <span><strong>Defeats:</strong> ${stats?.defeats ?? 0}</span>
          </div>
        </div>
      `;
    }
  };
}
