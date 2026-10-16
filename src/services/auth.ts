const CREDENTIALS_KEY = 'shd_msupply_admin_credentials';
const SESSION_KEY = 'shd_msupply_session_token';
const SESSION_USER_KEY = 'shd_msupply_session_user';

interface StoredCredentials {
  username: string;
  passwordHash: string; // Stored securely or plain/hashed for client store
  isCustom: boolean;
}

const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

function getCredentials(): { username: string; passwordHash: string; isCustom: boolean } {
  const raw = localStorage.getItem(CREDENTIALS_KEY);
  if (!raw) {
    return {
      username: DEFAULT_CREDENTIALS.username,
      passwordHash: DEFAULT_CREDENTIALS.password,
      isCustom: false,
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {
      username: DEFAULT_CREDENTIALS.username,
      passwordHash: DEFAULT_CREDENTIALS.password,
      isCustom: false,
    };
  }
}

export function isUsingDefaultCredentials(): boolean {
  return !getCredentials().isCustom;
}

export function getCurrentUser(): { id: string; username: string } | null {
  const token = localStorage.getItem(SESSION_KEY);
  const userRaw = localStorage.getItem(SESSION_USER_KEY);
  if (!token || !userRaw) return null;
  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}

export function login(usernameInput: string, passwordInput: string): { success: boolean; error?: string } {
  const creds = getCredentials();
  const cleanUser = usernameInput.trim();

  if (cleanUser === creds.username && passwordInput === creds.passwordHash) {
    const fakeToken = 'shd_jwt_' + Math.random().toString(36).substring(2) + Date.now();
    const user = { id: 'admin-01', username: creds.username };
    localStorage.setItem(SESSION_KEY, fakeToken);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    return { success: true };
  }

  return { success: false, error: 'Invalid username or password.' };
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
}

export function updateCredentials(
  currentPassword: string,
  newUsername: string,
  newPassword: string
): { success: boolean; error?: string } {
  const creds = getCredentials();

  if (currentPassword !== creds.passwordHash) {
    return { success: false, error: 'Current password does not match.' };
  }

  if (!newUsername.trim() || newUsername.trim().length < 3) {
    return { success: false, error: 'New username must be at least 3 characters long.' };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  const updated: StoredCredentials = {
    username: newUsername.trim(),
    passwordHash: newPassword,
    isCustom: true,
  };

  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(updated));

  // Update current session user
  const user = { id: 'admin-01', username: updated.username };
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));

  return { success: true };
}
