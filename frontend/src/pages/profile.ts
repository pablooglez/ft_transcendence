import { getUserByUsername, getUserStatsById } from '../services/api';

/**
 * Search for a user by username, then fetch and return their profile data by ID.
 * @param username The username to search for
 * @returns The user profile data or an error message
 */
export async function fetchUserProfileByUsername(username: string) {
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return { error: 'User not found' };
    }
    const stats = await getUserStatsById(user.id);
    return { user, stats };
  } catch (err: any) {
    return { error: err.message || 'Unknown error' };
  }
}

export function Profile(): string {
  return `
    <div class="profile-container">
      <h1 id="profile-title">Profile</h1>
      <div id="profile-result"></div>
    </div>
  `;
}

export function profileHandlers() {
  const hash = window.location.hash;
  const urlParams = new URLSearchParams(hash.split('?')[1]);
  let username = urlParams.get('username');

  const title = document.getElementById('profile-title');
  const resultDiv = document.getElementById('profile-result');

  if (username) {
    if (title) title.textContent = 'Profile';
    if (resultDiv) {
      resultDiv.innerHTML = 'Loading...';
      fetchAndDisplayProfile(username, resultDiv);
    }
  } else {
    // Try to get current user's username
    getCurrentUsername().then(currentUsername => {
      if (currentUsername) {
        if (title) title.textContent = 'Profile';
        if (resultDiv) {
          resultDiv.innerHTML = 'Loading...';
          fetchAndDisplayProfile(currentUsername, resultDiv);
        }
      } else {
        if (title) title.textContent = 'Profile';
        if (resultDiv) {
          resultDiv.innerHTML = '<p>Please log in to view your profile.</p>';
        }
      }
    });
  }
}

async function getCurrentUsername(): Promise<string | null> {
  // Check localStorage first
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.username) {
        return user.username;
      }
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
  }

  // If not in localStorage, wait a bit and try again (in case it's being fetched)
  await new Promise(resolve => setTimeout(resolve, 100));
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.username) {
        return user.username;
      }
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
  }

  return null;
}

async function fetchAndDisplayProfile(username: string, resultDiv: HTMLElement) {
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
}
