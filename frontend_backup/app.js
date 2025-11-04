// Configuration
const CONFIG = {
  API_BASE_URL: 'http://localhost:8000',
  DEMO_CREDENTIALS: {
    admin: { email: 'admin@system.com', password: 'admin123' },
    operator: { email: 'operator@region1.com', password: 'operator123' },
    farmer: { nrc: '123456121', dob: '1990-01-01' }
  },
  PROVINCES: ['Central Province', 'Copperbelt Province', 'Eastern Province', 'Luapula Province', 'Lusaka Province', 'Muchinga Province', 'Northern Province', 'North-Western Province', 'Southern Province', 'Western Province'],
  DISTRICTS: ['Lusaka', 'Ndola', 'Kitwe', 'Kabwe', 'Chingola'],
  CROP_TYPES: [
    { name: 'Maize', varieties: ['White Maize', 'Yellow Maize'] },
    { name: 'Soybean', varieties: ['Hernon', 'Safari'] },
    { name: 'Groundnut', varieties: ['Chalimbana', 'Mamlambo'] },
    { name: 'Cotton', varieties: ['Deltapine', 'Chureza'] }
  ],
  LAND_TYPES: ['Irrigated', 'Non-irrigated', 'Mixed'],
  SOIL_TYPES: ['Sandy', 'Clay', 'Loamy', 'Rocky', 'Mixed'],
  WATER_SOURCES: ['Borehole', 'River', 'Dam', 'Well', 'Rainfall']
};

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || error.message || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

async function apiUpload(endpoint, formData) {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;
  const headers = {};
  
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

// State Management
const state = {
  user: null,
  token: null,
  currentRoute: '/login',
  sidebarVisible: true,
  farmers: [],
  inventory: [],
  operators: [],
  supplyRequests: [],
  loading: false,
  isOnline: navigator.onLine,
  syncQueue: []
};

// IndexedDB for offline storage
let db = null;

function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FarmerSystemDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Create object stores
      if (!database.objectStoreNames.contains('farmers')) {
        database.createObjectStore('farmers', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('syncQueue')) {
        const syncStore = database.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!database.objectStoreNames.contains('documents')) {
        database.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Offline Data Functions
async function saveToIndexedDB(storeName, data) {
  if (!db) return;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getFromIndexedDB(storeName, key) {
  if (!db) return null;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromIndexedDB(storeName) {
  if (!db) return [];
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addToSyncQueue(action, data) {
  const queueItem = {
    action,
    data,
    timestamp: Date.now()
  };
  
  await saveToIndexedDB('syncQueue', queueItem);
  state.syncQueue.push(queueItem);
  showToast('Changes saved for sync', 'info');
}

async function processSyncQueue() {
  if (!state.isOnline || state.syncQueue.length === 0) return;
  
  setLoading(true);
  const queue = await getAllFromIndexedDB('syncQueue');
  
  try {
    const response = await apiRequest('/api/sync/batch', {
      method: 'POST',
      body: JSON.stringify({ operations: queue })
    });
    
    // Clear sync queue after successful sync
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    store.clear();
    
    state.syncQueue = [];
    showToast(`Synced ${queue.length} changes successfully`, 'success');
  } catch (error) {
    console.error('Sync error:', error);
    showToast('Sync failed. Will retry later.', 'warning');
  } finally {
    setLoading(false);
  }
}

// Network status monitoring
window.addEventListener('online', () => {
  state.isOnline = true;
  showToast('Back online. Syncing changes...', 'success');
  processSyncQueue();
});

window.addEventListener('offline', () => {
  state.isOnline = false;
  showToast('You are offline. Changes will be synced when online.', 'warning');
});

// Initialize app on load
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize IndexedDB
  try {
    await initIndexedDB();
    console.log('IndexedDB initialized');
    
    // Load sync queue
    state.syncQueue = await getAllFromIndexedDB('syncQueue');
    
    // Process any pending syncs if online
    if (state.isOnline && state.syncQueue.length > 0) {
      setTimeout(() => processSyncQueue(), 2000);
    }
  } catch (error) {
    console.error('IndexedDB initialization error:', error);
  }
  
  checkAuth();
  initRouter();
});

// Authentication
function checkAuth() {
  const savedUser = getFromMemory('user');
  const savedToken = getFromMemory('token');
  
  if (savedUser && savedToken) {
    state.user = savedUser;
    state.token = savedToken;
    navigate(getDashboardRoute(savedUser.role));
  } else {
    navigate('/login');
  }
}

async function login(credentials) {
  setLoading(true);
  
  try {
    // Prepare login data based on role
    let loginData;
    if (credentials.email) {
      // Admin or Operator login
      loginData = {
        username: credentials.email,
        password: credentials.password
      };
    } else {
      // Farmer login with NRC
      loginData = {
        username: credentials.nrc,
        password: credentials.dob
      };
    }
    
    // Use form data for OAuth2 password flow
    const formData = new URLSearchParams();
    formData.append('username', loginData.username);
    formData.append('password', loginData.password);
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    
    const data = await response.json();
    state.token = data.access_token;
    
    // Get user info
    const userInfo = await apiRequest('/api/auth/me');
    state.user = {
      id: userInfo.id,
      name: userInfo.full_name || userInfo.username,
      email: userInfo.email || userInfo.username,
      role: userInfo.role
    };
    
    saveToMemory('user', state.user);
    saveToMemory('token', state.token);
    
    showToast('Login successful!', 'success');
    navigate(getDashboardRoute(state.user.role));
  } catch (error) {
    console.error('Login error:', error);
    showToast('Login failed: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
}

function logout() {
  state.user = null;
  state.token = null;
  clearMemory('user');
  clearMemory('token');
  showToast('Logged out successfully', 'info');
  navigate('/login');
}

function getDashboardRoute(role) {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'operator': return '/officer/dashboard';
    case 'farmer': return '/farmer/profile';
    default: return '/login';
  }
}

// Simple memory storage (since localStorage is not available)
const memoryStorage = {};

function saveToMemory(key, value) {
  memoryStorage[key] = JSON.stringify(value);
}

function getFromMemory(key) {
  const value = memoryStorage[key];
  return value ? JSON.parse(value) : null;
}

function clearMemory(key) {
  delete memoryStorage[key];
}

// Router
function initRouter() {
  window.addEventListener('popstate', () => {
    renderCurrentRoute();
  });
  renderCurrentRoute();
}

function navigate(path) {
  state.currentRoute = path;
  window.history.pushState({}, '', path);
  renderCurrentRoute();
}

function renderCurrentRoute() {
  const app = document.getElementById('app');
  const route = state.currentRoute;
  
  // Check authentication
  if (!state.user && route !== '/login') {
    navigate('/login');
    return;
  }
  
  // Route rendering
  if (route === '/login') {
    app.innerHTML = renderLoginPage();
    attachLoginHandlers();
  } else if (route.startsWith('/admin')) {
    if (state.user.role !== 'admin') {
      navigate(getDashboardRoute(state.user.role));
      return;
    }
    app.innerHTML = renderAdminLayout();
    renderAdminContent(route);
  } else if (route.startsWith('/officer')) {
    if (state.user.role !== 'operator') {
      navigate(getDashboardRoute(state.user.role));
      return;
    }
    app.innerHTML = renderOfficerLayout();
    renderOfficerContent(route);
  } else if (route.startsWith('/farmer')) {
    if (state.user.role !== 'farmer') {
      navigate(getDashboardRoute(state.user.role));
      return;
    }
    app.innerHTML = renderFarmerLayout();
    renderFarmerContent(route);
  } else {
    navigate('/login');
  }
}

// Login Page
function renderLoginPage() {
  return `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">🌾 Farmer Support System</h1>
          <p class="login-subtitle">Zambian Agricultural Management</p>
        </div>
        
        <div class="role-tabs">
          <button class="role-tab active" data-role="admin">Admin</button>
          <button class="role-tab" data-role="officer">Extension Officer</button>
          <button class="role-tab" data-role="farmer">Farmer</button>
        </div>
        
        <div id="login-form-container">
          ${renderAdminLoginForm()}
        </div>
      </div>
    </div>
  `;
}

function renderAdminLoginForm() {
  return `
    <form id="login-form" class="login-form">
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-control" name="email" value="admin@system.com" required>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" class="form-control" name="password" value="admin123" required>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Login</button>
    </form>
  `;
}

function renderOfficerLoginForm() {
  return `
    <form id="login-form" class="login-form">
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-control" name="email" value="operator@region1.com" required>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" class="form-control" name="password" value="operator123" required>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Login</button>
    </form>
  `;
}

function renderFarmerLoginForm() {
  return `
    <form id="login-form" class="login-form">
      <div class="form-group">
        <label class="form-label">NRC Number</label>
        <input type="text" class="form-control" name="nrc" placeholder="123456/12/1" required>
      </div>
      <div class="form-group">
        <label class="form-label">Date of Birth</label>
        <input type="date" class="form-control" name="dob" required>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Login</button>
    </form>
  `;
}

function attachLoginHandlers() {
  const tabs = document.querySelectorAll('.role-tab');
  const formContainer = document.getElementById('login-form-container');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const role = tab.dataset.role;
      if (role === 'admin') {
        formContainer.innerHTML = renderAdminLoginForm();
      } else if (role === 'officer') {
        formContainer.innerHTML = renderOfficerLoginForm();
      } else if (role === 'farmer') {
        formContainer.innerHTML = renderFarmerLoginForm();
      }
      
      attachLoginFormHandler();
    });
  });
  
  attachLoginFormHandler();
}

function attachLoginFormHandler() {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const credentials = Object.fromEntries(formData);
    login(credentials);
  });
}

// Admin Layout
function renderAdminLayout() {
  return `
    <div class="app-layout">
      ${renderSidebar('admin')}
      <div class="main-content">
        ${renderHeader()}
        <div class="content" id="main-content"></div>
      </div>
    </div>
  `;
}

async function renderAdminContent(route) {
  const content = document.getElementById('main-content');
  
  if (route === '/admin/dashboard') {
    content.innerHTML = await renderAdminDashboard();
  } else if (route === '/admin/operators') {
    content.innerHTML = renderOperatorsPage();
    loadOperators();
  } else if (route === '/admin/farmers') {
    content.innerHTML = renderFarmersPage();
    loadFarmers();
  } else if (route === '/admin/inventory') {
    content.innerHTML = renderInventoryPage();
    loadInventory();
  } else if (route === '/admin/supply-requests') {
    content.innerHTML = renderSupplyRequestsPage();
    loadSupplyRequests();
  } else if (route === '/admin/reports') {
    content.innerHTML = renderReportsPage();
  }
}

async function renderAdminDashboard() {
  // Load statistics
  let stats = {
    totalFarmers: 0,
    totalOperators: 0,
    pendingVerifications: 0,
    totalLandArea: 0,
    recentFarmers: []
  };
  
  try {
    const farmers = await apiRequest('/api/farmers/');
    stats.totalFarmers = farmers.length;
    stats.totalLandArea = farmers.reduce((sum, f) => sum + (f.land_details?.total_area || 0), 0);
    stats.pendingVerifications = farmers.filter(f => f.verification_status === 'pending').length;
    stats.recentFarmers = farmers.slice(-5).reverse();
  } catch (error) {
    console.error('Error loading stats:', error);
    // Try to load from offline cache
    const cachedFarmers = await getAllFromIndexedDB('farmers');
    if (cachedFarmers.length > 0) {
      stats.totalFarmers = cachedFarmers.length;
      stats.recentFarmers = cachedFarmers.slice(-5).reverse();
    }
  }
  
  return `
    <div class="flex justify-between items-center mb-24">
      <h2>Admin Dashboard</h2>
      ${!state.isOnline ? '<span class="badge badge-warning">⚠️ Offline Mode</span>' : ''}
      ${state.syncQueue.length > 0 ? `<span class="badge badge-info">${state.syncQueue.length} pending sync</span>` : ''}
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-card-title">Total Farmers</span>
          <div class="stat-card-icon blue">👥</div>
        </div>
        <div class="stat-card-value">${stats.totalFarmers}</div>
        <div class="stat-card-description">Registered farmers</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-card-title">Pending Verification</span>
          <div class="stat-card-icon orange">⏳</div>
        </div>
        <div class="stat-card-value">${stats.pendingVerifications}</div>
        <div class="stat-card-description">Awaiting approval</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-card-title">Total Land</span>
          <div class="stat-card-icon green">🌾</div>
        </div>
        <div class="stat-card-value">${stats.totalLandArea.toFixed(1)}</div>
        <div class="stat-card-description">Hectares managed</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-card-title">System Status</span>
          <div class="stat-card-icon ${state.isOnline ? 'green' : 'red'}">•</div>
        </div>
        <div class="stat-card-value">${state.isOnline ? 'Online' : 'Offline'}</div>
        <div class="stat-card-description">${state.isOnline ? 'All systems operational' : 'Working offline'}</div>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-16 mt-24">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Recent Registrations</h3>
        </div>
        <div class="card-body">
          ${stats.recentFarmers.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${stats.recentFarmers.map(f => `
                <div style="padding: 12px; background: var(--color-bg-1); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div class="font-medium">${f.first_name} ${f.last_name}</div>
                    <div class="text-sm text-secondary">${f.primary_phone}</div>
                  </div>
                  <span class="badge badge-${f.verification_status === 'approved' ? 'success' : 'warning'}">${f.verification_status}</span>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-secondary">No recent registrations</p>'}
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Quick Actions</h3>
        </div>
        <div class="card-body">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="btn btn-primary btn-full" onclick="navigate('/admin/farmers')">👥 View All Farmers</button>
            <button class="btn btn-secondary btn-full" onclick="navigate('/admin/operators')">👨‍🌾 Manage Operators</button>
            <button class="btn btn-secondary btn-full" onclick="navigate('/admin/reports')">📊 Generate Reports</button>
            ${state.syncQueue.length > 0 ? `
              <button class="btn btn-success btn-full" onclick="processSyncQueue()">🔄 Sync Now (${state.syncQueue.length})</button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Officer Layout
function renderOfficerLayout() {
  return `
    <div class="app-layout">
      ${renderSidebar('operator')}
      <div class="main-content">
        ${renderHeader()}
        <div class="content" id="main-content"></div>
      </div>
    </div>
  `;
}

async function renderOfficerContent(route) {
  const content = document.getElementById('main-content');
  
  if (route === '/officer/dashboard') {
    content.innerHTML = await renderOfficerDashboard();
  } else if (route === '/officer/add-farmer') {
    content.innerHTML = renderAddFarmerPage();
    attachAddFarmerHandlers();
  } else if (route === '/officer/farmers') {
    content.innerHTML = renderFarmersPage();
    loadFarmers();
  } else if (route === '/officer/documents') {
    content.innerHTML = await renderDocumentsPage();
  }
}

async function renderOfficerDashboard() {
  // Load operator statistics
  let stats = {
    myFarmers: 0,
    thisMonth: 0,
    pendingDocs: 0,
    totalLand: 0
  };
  
  try {
    const farmers = await apiRequest('/api/farmers/');
    stats.myFarmers = farmers.length;
    stats.totalLand = farmers.reduce((sum, f) => sum + (f.land_details?.total_area || 0), 0);
    stats.pendingDocs = farmers.filter(f => !f.photo_path || !f.id_card_generated).length;
    
    // Count this month's registrations
    const thisMonth = new Date().getMonth();
    stats.thisMonth = farmers.filter(f => {
      const created = new Date(f.created_at);
      return created.getMonth() === thisMonth;
    }).length;
  } catch (error) {
    console.error('Error loading operator stats:', error);
  }
  
  return `
    <div class="flex justify-between items-center mb-24">
      <h2>Extension Officer Dashboard</h2>
      ${!state.isOnline ? '<span class="badge badge-warning">⚠️ Offline Mode</span>' : ''}
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-card-title">My Farmers</span>
          <div class="stat-card-icon blue">👥</div>
        </div>
        <div class="stat-card-value">${stats.myFarmers}</div>
        <div class="stat-card-description">Assigned farmers</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-card-title">This Month</span>
          <div class="stat-card-icon green">📈</div>
        </div>
        <div class="stat-card-value">${stats.thisMonth}</div>
        <div class="stat-card-description">New registrations</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-card-title">Pending Documents</span>
          <div class="stat-card-icon orange">📄</div>
        </div>
        <div class="stat-card-value">${stats.pendingDocs}</div>
        <div class="stat-card-description">Awaiting verification</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-card-title">Total Land</span>
          <div class="stat-card-icon green">🌾</div>
        </div>
        <div class="stat-card-value">${stats.totalLand.toFixed(1)}</div>
        <div class="stat-card-description">Hectares managed</div>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-16 mt-24">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Quick Actions</h3>
        </div>
        <div class="card-body">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="btn btn-primary btn-full" onclick="navigate('/officer/add-farmer')">➕ Add New Farmer</button>
            <button class="btn btn-secondary btn-full" onclick="navigate('/officer/farmers')">👥 View All Farmers</button>
            <button class="btn btn-secondary btn-full" onclick="navigate('/officer/documents')">📄 Manage Documents</button>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">System Info</h3>
        </div>
        <div class="card-body">
          <div class="mb-16">
            <div class="text-sm text-secondary mb-4">Connection Status</div>
            <div class="flex items-center gap-8">
              <span style="width: 12px; height: 12px; border-radius: 50%; background: ${state.isOnline ? 'var(--color-success)' : 'var(--color-error)'}"></span>
              <span class="font-medium">${state.isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          ${state.syncQueue.length > 0 ? `
            <div class="mb-16">
              <div class="text-sm text-secondary mb-4">Pending Sync</div>
              <div class="font-medium">${state.syncQueue.length} operation(s)</div>
              <button class="btn btn-sm btn-primary mt-8" onclick="processSyncQueue()">🔄 Sync Now</button>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Farmer Layout
function renderFarmerLayout() {
  return `
    <div class="app-layout">
      ${renderSidebar('farmer')}
      <div class="main-content">
        ${renderHeader()}
        <div class="content" id="main-content"></div>
      </div>
    </div>
  `;
}

async function renderFarmerContent(route) {
  const content = document.getElementById('main-content');
  
  if (route === '/farmer/profile') {
    content.innerHTML = await renderFarmerProfile();
  } else if (route === '/farmer/request-supply') {
    content.innerHTML = renderRequestSupplyPage();
    attachRequestSupplyHandlers();
  } else if (route === '/farmer/documents') {
    content.innerHTML = await renderFarmerDocumentsPage();
    attachDocumentUploadHandler();
  } else if (route === '/farmer/id-card') {
    content.innerHTML = await renderFarmerIDCard();
  } else if (route === '/farmer/requests') {
    content.innerHTML = renderFarmerRequestsPage();
  }
}

function renderFarmerProfile() {
  return `
    <h2 class="mb-24">My Profile</h2>
    <div class="grid grid-cols-2 gap-16">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Personal Information</h3>
        </div>
        <div class="card-body">
          <div class="mb-16">
            <div class="text-sm text-secondary mb-4">Full Name</div>
            <div class="font-medium">John Farmer</div>
          </div>
          <div class="mb-16">
            <div class="text-sm text-secondary mb-4">NRC Number</div>
            <div class="font-medium">123456121</div>
          </div>
          <div class="mb-16">
            <div class="text-sm text-secondary mb-4">Date of Birth</div>
            <div class="font-medium">January 1, 1990</div>
          </div>
          <div class="mb-16">
            <div class="text-sm text-secondary mb-4">Phone Number</div>
            <div class="font-medium">+260 977 123 456</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Farm Information</h3>
        </div>
        <div class="card-body">
          <div class="mb-16">
            <div class="text-sm text-secondary mb-4">Province</div>
            <div class="font-medium">Central Province</div>
          </div>
          <div class="mb-16">
            <div class="text-sm text-secondary mb-4">District</div>
            <div class="font-medium">Lusaka</div>
          </div>
          <div class="mb-16">
            <div class="text-sm text-secondary mb-4">Land Size</div>
            <div class="font-medium">3.5 Hectares</div>
          </div>
          <div class="mb-16">
            <div class="text-sm text-secondary mb-4">Primary Crop</div>
            <div class="font-medium">Maize</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card mt-24">
      <div class="card-header">
        <h3 class="card-title">Registration Status</h3>
      </div>
      <div class="card-body">
        <div class="flex items-center gap-12">
          <span class="badge badge-success">✓ Approved</span>
          <span class="text-secondary">Your registration has been approved. You can now request supplies.</span>
        </div>
      </div>
    </div>
  `;
}

// Sidebar Component
function renderSidebar(role) {
  const menuItems = getMenuItems(role);
  
  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">🌾 AgriManage</div>
      </div>
      <nav class="sidebar-nav">
        ${menuItems.map(item => `
          <a href="#" class="nav-item ${state.currentRoute === item.path ? 'active' : ''}" 
             onclick="navigate('${item.path}'); return false;">
            <span class="nav-icon">${item.icon}</span>
            ${item.label}
          </a>
        `).join('')}
      </nav>
    </aside>
  `;
}

function getMenuItems(role) {
  if (role === 'admin') {
    return [
      { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/admin/operators', icon: '👨‍🌾', label: 'Operators' },
      { path: '/admin/farmers', icon: '👥', label: 'Farmers' },
      { path: '/admin/inventory', icon: '📦', label: 'Inventory' },
      { path: '/admin/supply-requests', icon: '📋', label: 'Supply Requests' },
      { path: '/admin/reports', icon: '📈', label: 'Reports' }
    ];
  } else if (role === 'operator') {
    return [
      { path: '/officer/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/officer/add-farmer', icon: '➕', label: 'Add Farmer' },
      { path: '/officer/farmers', icon: '👥', label: 'Farmers List' },
      { path: '/officer/documents', icon: '📄', label: 'Documents' }
    ];
  } else if (role === 'farmer') {
    return [
      { path: '/farmer/profile', icon: '👤', label: 'My Profile' },
      { path: '/farmer/request-supply', icon: '📦', label: 'Request Supply' },
      { path: '/farmer/requests', icon: '📋', label: 'My Requests' },
      { path: '/farmer/documents', icon: '📄', label: 'Documents' },
      { path: '/farmer/id-card', icon: '🪪', label: 'ID Card' }
    ];
  }
  return [];
}

// Header Component
function renderHeader() {
  return `
    <header class="header">
      <div class="header-left">
        <button class="menu-toggle" onclick="toggleSidebar()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 class="header-title">Zambian Farmer Support System</h1>
      </div>
      <div class="header-right">
        <div class="user-info">
          <div class="user-avatar">${state.user.name.charAt(0)}</div>
          <div class="user-details">
            <div class="user-name">${state.user.name}</div>
            <div class="user-role">${getRoleName(state.user.role)}</div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="logout()">Logout</button>
      </div>
    </header>
  `;
}

function getRoleName(role) {
  switch (role) {
    case 'admin': return 'Administrator';
    case 'operator': return 'Extension Officer';
    case 'farmer': return 'Farmer';
    default: return role;
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('visible');
}

// Operators Page
function renderOperatorsPage() {
  return `
    <div class="flex justify-between items-center mb-24">
      <h2>Operators Management</h2>
      <button class="btn btn-primary" onclick="showAddOperatorModal()">➕ Add Operator</button>
    </div>
    
    <div class="card">
      <div class="card-body">
        <div id="operators-list">
          <div class="text-center" style="padding: 40px;">
            <div class="spinner" style="width: 40px; height: 40px; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function loadOperators() {
  setTimeout(() => {
    state.operators = [
      { id: 1, name: 'Extension Officer 1', email: 'operator@test.com', phone: '+260 977 111 111', farmers: 23 },
      { id: 2, name: 'Extension Officer 2', email: 'officer2@test.com', phone: '+260 977 222 222', farmers: 18 },
      { id: 3, name: 'Extension Officer 3', email: 'officer3@test.com', phone: '+260 977 333 333', farmers: 6 }
    ];
    
    const container = document.getElementById('operators-list');
    container.innerHTML = `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Assigned Farmers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.operators.map(op => `
              <tr>
                <td>${op.name}</td>
                <td>${op.email}</td>
                <td>${op.phone}</td>
                <td>${op.farmers}</td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn view" title="View">👁️</button>
                    <button class="action-btn edit" title="Edit">✏️</button>
                    <button class="action-btn delete" onclick="deleteOperator(${op.id})" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }, 500);
}

function showAddOperatorModal() {
  showModal('Add Operator', `
    <form id="add-operator-form">
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input type="text" class="form-control" name="name" required>
      </div>
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-control" name="email" required>
      </div>
      <div class="form-group">
        <label class="form-label">Phone Number</label>
        <input type="tel" class="form-control" name="phone" required>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" class="form-control" name="password" required>
      </div>
    </form>
  `, () => {
    const form = document.getElementById('add-operator-form');
    if (form.checkValidity()) {
      showToast('Operator added successfully!', 'success');
      hideModal();
      loadOperators();
    }
  });
}

function deleteOperator(id) {
  if (confirm('Are you sure you want to delete this operator?')) {
    showToast('Operator deleted successfully', 'success');
    loadOperators();
  }
}

// Farmers Page
function renderFarmersPage() {
  return `
    <div class="flex justify-between items-center mb-24">
      <h2>Farmers Management</h2>
      ${state.user.role === 'operator' ? '<button class="btn btn-primary" onclick="navigate(\'/officer/add-farmer\')">➕ Add Farmer</button>' : ''}
    </div>
    
    <div class="card">
      <div class="card-body">
        <div class="search-filter-bar mb-16">
          <input type="text" class="form-control search-input" placeholder="🔍 Search farmers..." onkeyup="filterFarmers(this.value)">
          <select class="form-control filter-select" onchange="filterByProvince(this.value)">
            <option value="">All Provinces</option>
            ${CONFIG.PROVINCES.map(p => `<option value="${p}">${p}</option>`).join('')}
          </select>
          <select class="form-control filter-select" onchange="filterByStatus(this.value)">
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div id="farmers-list">
          <div class="text-center" style="padding: 40px;">
            <div class="spinner" style="width: 40px; height: 40px; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadFarmers() {
  try {
    const data = await apiRequest('/api/farmers/');
    state.farmers = data.map(farmer => ({
      id: farmer.id,
      name: `${farmer.first_name} ${farmer.last_name}`,
      nrc: farmer.government_id || 'N/A',
      phone: farmer.primary_phone,
      province: farmer.permanent_address?.split(',')[0] || 'N/A',
      district: farmer.permanent_address?.split(',')[1] || 'N/A',
      landSize: farmer.land_details?.total_area || 0,
      crop: farmer.farming_details?.current_crops?.[0]?.name || 'N/A',
      status: farmer.verification_status || 'pending',
      rawData: farmer
    }));
    
    // Cache farmers offline
    for (const farmer of data) {
      await saveToIndexedDB('farmers', farmer);
    }
    
    displayFarmers(state.farmers);
  } catch (error) {
    console.error('Error loading farmers:', error);
    
    // Try to load from offline cache
    const cachedFarmers = await getAllFromIndexedDB('farmers');
    if (cachedFarmers.length > 0) {
      state.farmers = cachedFarmers.map(farmer => ({
        id: farmer.id,
        name: `${farmer.first_name} ${farmer.last_name}`,
        nrc: farmer.government_id || 'N/A',
        phone: farmer.primary_phone,
        province: farmer.permanent_address?.split(',')[0] || 'N/A',
        district: farmer.permanent_address?.split(',')[1] || 'N/A',
        landSize: farmer.land_details?.total_area || 0,
        crop: farmer.farming_details?.current_crops?.[0]?.name || 'N/A',
        status: farmer.verification_status || 'pending',
        rawData: farmer
      }));
      displayFarmers(state.farmers);
      showToast('Showing cached data (offline)', 'info');
    } else {
      showToast('Failed to load farmers and no cached data available', 'error');
      displayFarmers([]);
    }
  }
}

function displayFarmers(farmers) {
  const container = document.getElementById('farmers-list');
  
  if (farmers.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <div class="empty-state-title">No farmers found</div>
        <div class="empty-state-description">Try adjusting your filters or add a new farmer.</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>NRC</th>
            <th>Phone</th>
            <th>Province</th>
            <th>Land Size</th>
            <th>Primary Crop</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${farmers.map(farmer => `
            <tr>
              <td>${farmer.name}</td>
              <td>${farmer.nrc}</td>
              <td>${farmer.phone}</td>
              <td>${farmer.province}</td>
              <td>${farmer.landSize} ha</td>
              <td>${farmer.crop}</td>
              <td><span class="badge badge-${farmer.status === 'approved' ? 'success' : farmer.status === 'pending' ? 'warning' : 'danger'}">${farmer.status}</span></td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn view" onclick="viewFarmer(${farmer.id})" title="View">👁️</button>
                  <button class="action-btn edit" onclick="editFarmer(${farmer.id})" title="Edit">✏️</button>
                  ${state.user.role === 'admin' ? `<button class="action-btn delete" onclick="deleteFarmer(${farmer.id})" title="Delete">🗑️</button>` : ''}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function filterFarmers(query) {
  const filtered = state.farmers.filter(f => 
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.nrc.includes(query) ||
    f.phone.includes(query)
  );
  displayFarmers(filtered);
}

function filterByProvince(province) {
  if (!province) {
    displayFarmers(state.farmers);
    return;
  }
  const filtered = state.farmers.filter(f => f.province === province);
  displayFarmers(filtered);
}

function filterByStatus(status) {
  if (!status) {
    displayFarmers(state.farmers);
    return;
  }
  const filtered = state.farmers.filter(f => f.status === status);
  displayFarmers(filtered);
}

function viewFarmer(id) {
  const farmer = state.farmers.find(f => f.id === id);
  if (!farmer) return;
  
  const raw = farmer.rawData || {};
  const land = raw.land_details || {};
  const farming = raw.farming_details || {};
  
  let photoButton = '';
  if (raw.photo_path) {
    const photoUrl = CONFIG.API_BASE_URL + raw.photo_path;
    photoButton = '<button class="btn btn-secondary" onclick="window.open(\'' + photoUrl + '\', \'_blank\')">View Photo</button>';
  }
  
  let idCardButton = '';
  if (raw.id_card_generated) {
    idCardButton = '<button class="btn btn-primary" onclick="downloadFarmerIDCardById(\'' + farmer.id + '\')">Download ID Card</button>';
  }
  
  const statusBadgeClass = farmer.status === 'approved' ? 'success' : (farmer.status === 'pending' ? 'warning' : 'danger');
  
  showModal('Farmer Details', `
    <div class="grid grid-cols-2 gap-16 mb-24">
      <div>
        <div class="mb-16">
          <div class="text-sm text-secondary mb-4">Full Name</div>
          <div class="font-medium">${farmer.name}</div>
        </div>
        <div class="mb-16">
          <div class="text-sm text-secondary mb-4">NRC Number</div>
          <div class="font-medium">${farmer.nrc}</div>
        </div>
        <div class="mb-16">
          <div class="text-sm text-secondary mb-4">Phone Number</div>
          <div class="font-medium">${farmer.phone}</div>
        </div>
        <div class="mb-16">
          <div class="text-sm text-secondary mb-4">Email</div>
          <div class="font-medium">${raw.email || 'Not provided'}</div>
        </div>
      </div>
      <div>
        <div class="mb-16">
          <div class="text-sm text-secondary mb-4">Address</div>
          <div class="font-medium">${raw.permanent_address || 'N/A'}</div>
        </div>
        <div class="mb-16">
          <div class="text-sm text-secondary mb-4">Land Size</div>
          <div class="font-medium">${farmer.landSize} hectares</div>
        </div>
        <div class="mb-16">
          <div class="text-sm text-secondary mb-4">Land Type</div>
          <div class="font-medium">${land.land_type || 'N/A'}</div>
        </div>
        <div class="mb-16">
          <div class="text-sm text-secondary mb-4">Primary Crop</div>
          <div class="font-medium">${farmer.crop}</div>
        </div>
      </div>
    </div>
    
    <div class="mb-16">
      <div class="text-sm text-secondary mb-4">Status</div>
      <span class="badge badge-${statusBadgeClass}">
        ${farmer.status}
      </span>
    </div>
    
    <div class="flex gap-12 mt-24">
      ${photoButton}
      ${idCardButton}
    </div>
  `, null, false);
}

async function downloadFarmerIDCardById(farmerId) {
  try {
    setLoading(true);
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/farmers/${farmerId}/download-idcard`, {
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });
    
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmer_id_card_${farmerId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showToast('ID Card downloaded successfully', 'success');
  } catch (error) {
    console.error('Download error:', error);
    showToast('Failed to download ID card', 'error');
  } finally {
    setLoading(false);
  }
}

function editFarmer(id) {
  const farmer = state.farmers.find(f => f.id === id);
  if (!farmer) return;
  
  showModal('Edit Farmer', `
    <form id="edit-farmer-form">
      <div class="grid grid-cols-2 gap-12">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-control" name="name" value="${farmer.name}" required>
        </div>
        <div class="form-group">
          <label class="form-label">NRC Number</label>
          <input type="text" class="form-control" name="nrc" value="${farmer.nrc}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="tel" class="form-control" name="phone" value="${farmer.phone}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Land Size (ha)</label>
          <input type="number" step="0.1" class="form-control" name="landSize" value="${farmer.landSize}" required>
        </div>
      </div>
    </form>
  `, () => {
    showToast('Farmer updated successfully!', 'success');
    hideModal();
    loadFarmers();
  });
}

function deleteFarmer(id) {
  if (confirm('Are you sure you want to delete this farmer?')) {
    showToast('Farmer deleted successfully', 'success');
    loadFarmers();
  }
}

// Add Farmer Page - 4 Step Wizard
function renderAddFarmerPage() {
  if (!state.farmerFormData) {
    state.farmerFormData = {
      step: 1,
      data: {}
    };
  }
  
  return `
    <h2 class="mb-24">Add New Farmer - Step ${state.farmerFormData.step} of 4</h2>
    
    <div class="card mb-24">
      <div class="card-body">
        <div class="flex gap-8" style="margin-bottom: 32px;">
          <div style="flex: 1; height: 8px; background: ${state.farmerFormData.step >= 1 ? 'var(--color-primary)' : 'var(--color-secondary)'}; border-radius: 4px;"></div>
          <div style="flex: 1; height: 8px; background: ${state.farmerFormData.step >= 2 ? 'var(--color-primary)' : 'var(--color-secondary)'}; border-radius: 4px;"></div>
          <div style="flex: 1; height: 8px; background: ${state.farmerFormData.step >= 3 ? 'var(--color-primary)' : 'var(--color-secondary)'}; border-radius: 4px;"></div>
          <div style="flex: 1; height: 8px; background: ${state.farmerFormData.step >= 4 ? 'var(--color-primary)' : 'var(--color-secondary)'}; border-radius: 4px;"></div>
        </div>
        ${renderFarmerFormStep(state.farmerFormData.step)}
      </div>
    </div>
  `;
}

function renderFarmerFormStep(step) {
  const data = state.farmerFormData.data;
  
  if (step === 1) {
    return `
      <form id="farmer-step-form">
        <h3 class="mb-16">Personal Information</h3>
        <div class="grid grid-cols-2 gap-16">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input type="text" class="form-control" name="first_name" value="${data.first_name || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input type="text" class="form-control" name="last_name" value="${data.last_name || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Date of Birth</label>
            <input type="date" class="form-control" name="date_of_birth" value="${data.date_of_birth || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Gender</label>
            <select class="form-control" name="gender" required>
              <option value="">Select Gender</option>
              <option value="male" ${data.gender === 'male' ? 'selected' : ''}>Male</option>
              <option value="female" ${data.gender === 'female' ? 'selected' : ''}>Female</option>
              <option value="other" ${data.gender === 'other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Primary Phone</label>
            <input type="tel" class="form-control" name="primary_phone" value="${data.primary_phone || ''}" placeholder="+260 977 123 456" required>
          </div>
          <div class="form-group">
            <label class="form-label">Alternate Phone (Optional)</label>
            <input type="tel" class="form-control" name="alternate_phone" value="${data.alternate_phone || ''}" placeholder="+260 977 123 456">
          </div>
          <div class="form-group">
            <label class="form-label">Email (Optional)</label>
            <input type="email" class="form-control" name="email" value="${data.email || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Government ID (NRC)</label>
            <input type="text" class="form-control" name="government_id" value="${data.government_id || ''}" placeholder="123456/12/1" required>
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Permanent Address</label>
            <textarea class="form-control" name="permanent_address" rows="2" required>${data.permanent_address || ''}</textarea>
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Farm Address</label>
            <textarea class="form-control" name="farm_address" rows="2">${data.farm_address || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">GPS Coordinates (Optional)</label>
            <input type="text" class="form-control" name="gps_coordinates" value="${data.gps_coordinates || ''}" placeholder="-15.4167, 28.2833">
          </div>
        </div>
        <div class="flex justify-end gap-12 mt-24">
          <button type="button" class="btn btn-secondary" onclick="navigate('/officer/farmers')">Cancel</button>
          <button type="submit" class="btn btn-primary">Next Step →</button>
        </div>
      </form>
    `;
  } else if (step === 2) {
    return `
      <form id="farmer-step-form">
        <h3 class="mb-16">Land Details</h3>
        <div class="grid grid-cols-2 gap-16">
          <div class="form-group">
            <label class="form-label">Total Land Area (Hectares)</label>
            <input type="number" step="0.1" class="form-control" name="total_area" value="${data.total_area || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Land Type</label>
            <select class="form-control" name="land_type" required>
              <option value="">Select Type</option>
              ${CONFIG.LAND_TYPES.map(t => `<option value="${t}" ${data.land_type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Ownership Status</label>
            <select class="form-control" name="ownership_status" required>
              <option value="">Select Status</option>
              <option value="owned" ${data.ownership_status === 'owned' ? 'selected' : ''}>Owned</option>
              <option value="leased" ${data.ownership_status === 'leased' ? 'selected' : ''}>Leased</option>
              <option value="communal" ${data.ownership_status === 'communal' ? 'selected' : ''}>Communal</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Soil Type</label>
            <select class="form-control" name="soil_type">
              <option value="">Select Soil Type</option>
              ${CONFIG.SOIL_TYPES.map(s => `<option value="${s}" ${data.soil_type === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Water Source</label>
            <select class="form-control" name="water_source">
              <option value="">Select Water Source</option>
              ${CONFIG.WATER_SOURCES.map(w => `<option value="${w}" ${data.water_source === w ? 'selected' : ''}>${w}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="flex justify-between gap-12 mt-24">
          <button type="button" class="btn btn-secondary" onclick="previousFarmerStep()">← Previous</button>
          <button type="submit" class="btn btn-primary">Next Step →</button>
        </div>
      </form>
    `;
  } else if (step === 3) {
    return `
      <form id="farmer-step-form">
        <h3 class="mb-16">Farming Details</h3>
        <div class="grid grid-cols-2 gap-16">
          <div class="form-group">
            <label class="form-label">Primary Crop</label>
            <select class="form-control" name="primary_crop" required>
              <option value="">Select Crop</option>
              ${CONFIG.CROP_TYPES.map(c => `<option value="${c.name}" ${data.primary_crop === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Cultivation Area (Hectares)</label>
            <input type="number" step="0.1" class="form-control" name="cultivation_area" value="${data.cultivation_area || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Planting Season</label>
            <select class="form-control" name="planting_season">
              <option value="">Select Season</option>
              <option value="rainy" ${data.planting_season === 'rainy' ? 'selected' : ''}>Rainy Season</option>
              <option value="dry" ${data.planting_season === 'dry' ? 'selected' : ''}>Dry Season</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Irrigation Method</label>
            <select class="form-control" name="irrigation_method">
              <option value="">Select Method</option>
              <option value="rainfed" ${data.irrigation_method === 'rainfed' ? 'selected' : ''}>Rainfed</option>
              <option value="drip" ${data.irrigation_method === 'drip' ? 'selected' : ''}>Drip Irrigation</option>
              <option value="sprinkler" ${data.irrigation_method === 'sprinkler' ? 'selected' : ''}>Sprinkler</option>
              <option value="flood" ${data.irrigation_method === 'flood' ? 'selected' : ''}>Flood Irrigation</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Expected Yield (tons/ha)</label>
            <input type="number" step="0.1" class="form-control" name="expected_yield" value="${data.expected_yield || ''}">
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Additional Notes</label>
            <textarea class="form-control" name="farming_notes" rows="3">${data.farming_notes || ''}</textarea>
          </div>
        </div>
        <div class="flex justify-between gap-12 mt-24">
          <button type="button" class="btn btn-secondary" onclick="previousFarmerStep()">← Previous</button>
          <button type="submit" class="btn btn-primary">Next Step →</button>
        </div>
      </form>
    `;
  } else if (step === 4) {
    return `
      <form id="farmer-step-form">
        <h3 class="mb-16">Document Collection</h3>
        <div class="mb-24">
          <div class="form-group">
            <label class="form-label">Farmer Photo</label>
            <input type="file" class="form-control" id="farmer-photo" accept="image/*">
            <div class="text-sm text-secondary mt-8">Upload a clear passport-style photo</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Identity Proof (NRC Copy)</label>
            <input type="file" class="form-control" id="identity-proof" accept="image/*,application/pdf">
          </div>
          
          <div class="form-group">
            <label class="form-label">Land Documents (Optional)</label>
            <input type="file" class="form-control" id="land-documents" accept="image/*,application/pdf" multiple>
          </div>
          
          <div class="form-group">
            <label class="form-label">Bank Account Details (Optional)</label>
            <input type="text" class="form-control" name="bank_name" placeholder="Bank Name" value="${data.bank_name || ''}">
            <input type="text" class="form-control mt-8" name="account_number" placeholder="Account Number" value="${data.account_number || ''}">
          </div>
        </div>
        <div class="flex justify-between gap-12">
          <button type="button" class="btn btn-secondary" onclick="previousFarmerStep()">← Previous</button>
          <button type="submit" class="btn btn-success">Complete Registration</button>
        </div>
      </form>
    `;
  }
}

function previousFarmerStep() {
  if (state.farmerFormData.step > 1) {
    state.farmerFormData.step--;
    navigate('/officer/add-farmer');
  }
      </div>
    </div>
  `;
}

function attachAddFarmerHandlers() {
  const form = document.getElementById('farmer-step-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const stepData = Object.fromEntries(formData);
    
    // Merge with existing data
    Object.assign(state.farmerFormData.data, stepData);
    
    if (state.farmerFormData.step < 4) {
      // Move to next step
      state.farmerFormData.step++;
      navigate('/officer/add-farmer');
    } else {
      // Final step - submit to backend
      await submitFarmerRegistration();
    }
  });
}

async function submitFarmerRegistration() {
  setLoading(true);
  
  try {
    const data = state.farmerFormData.data;
    
    // Prepare farmer data for API
    const farmerData = {
      first_name: data.first_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      primary_phone: data.primary_phone,
      alternate_phone: data.alternate_phone || null,
      email: data.email || null,
      government_id: data.government_id,
      permanent_address: data.permanent_address,
      farm_address: data.farm_address || data.permanent_address,
      gps_coordinates: data.gps_coordinates || null,
      land_details: {
        total_area: parseFloat(data.total_area || 0),
        land_type: data.land_type,
        ownership_status: data.ownership_status,
        soil_type: data.soil_type || null,
        water_source: data.water_source || null
      },
      farming_details: {
        current_crops: [{
          name: data.primary_crop,
          area: parseFloat(data.cultivation_area || 0),
          season: data.planting_season || 'rainy'
        }],
        irrigation_method: data.irrigation_method || null,
        expected_yield: parseFloat(data.expected_yield || 0)
      },
      bank_details: data.bank_name ? {
        bank_name: data.bank_name,
        account_number: data.account_number
      } : null
    };
    
    // Create farmer
    const farmer = await apiRequest('/api/farmers/', {
      method: 'POST',
      body: JSON.stringify(farmerData)
    });
    
    // Upload photo if provided
    const photoFile = document.getElementById('farmer-photo')?.files[0];
    if (photoFile) {
      const photoFormData = new FormData();
      photoFormData.append('file', photoFile);
      await apiUpload(`/api/farmers/${farmer.id}/upload-photo`, photoFormData);
    }
    
    // Upload identity proof if provided
    const identityFile = document.getElementById('identity-proof')?.files[0];
    if (identityFile) {
      const docFormData = new FormData();
      docFormData.append('file', identityFile);
      docFormData.append('document_type', 'identity_proof');
      await apiUpload(`/api/farmers/${farmer.id}/upload-document`, docFormData);
    }
    
    // Upload land documents if provided
    const landFiles = document.getElementById('land-documents')?.files;
    if (landFiles && landFiles.length > 0) {
      for (let file of landFiles) {
        const docFormData = new FormData();
        docFormData.append('file', file);
        docFormData.append('document_type', 'land_documents');
        await apiUpload(`/api/farmers/${farmer.id}/upload-document`, docFormData);
      }
    }
    
    // Generate ID card
    await apiRequest(`/api/farmers/${farmer.id}/generate-idcard`, {
      method: 'POST'
    });
    
    // Reset form state
    state.farmerFormData = null;
    
    showToast('Farmer registered successfully!', 'success');
    navigate('/officer/farmers');
  } catch (error) {
    console.error('Registration error:', error);
    showToast('Failed to register farmer: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
}

// Inventory Page
function renderInventoryPage() {
  return `
    <div class="flex justify-between items-center mb-24">
      <h2>Inventory Management</h2>
      <button class="btn btn-primary" onclick="showAddInventoryModal()">➕ Add Item</button>
    </div>
    
    <div class="card">
      <div class="card-body">
        <div class="search-filter-bar mb-16">
          <input type="text" class="form-control search-input" placeholder="🔍 Search inventory...">
          <select class="form-control filter-select">
            <option value="">All Categories</option>
            <option value="seeds">Seeds</option>
            <option value="fertilizers">Fertilizers</option>
            <option value="tools">Tools</option>
            <option value="pesticides">Pesticides</option>
          </select>
        </div>
        <div id="inventory-list">
          <div class="text-center" style="padding: 40px;">
            <div class="spinner" style="width: 40px; height: 40px; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function loadInventory() {
  setTimeout(() => {
    state.inventory = [
      { id: 1, name: 'Maize Seeds (Hybrid)', category: 'Seeds', quantity: 500, unit: 'kg', unitPrice: 25, supplier: 'AgriSupply Ltd', stockLevel: 'good' },
      { id: 2, name: 'NPK Fertilizer', category: 'Fertilizers', quantity: 200, unit: 'bags', unitPrice: 180, supplier: 'FarmChem', stockLevel: 'good' },
      { id: 3, name: 'Hand Hoe', category: 'Tools', quantity: 45, unit: 'pieces', unitPrice: 35, supplier: 'ToolMart', stockLevel: 'low' },
      { id: 4, name: 'Pesticide Spray', category: 'Pesticides', quantity: 80, unit: 'liters', unitPrice: 55, supplier: 'CropProtect', stockLevel: 'good' },
      { id: 5, name: 'Soybean Seeds', category: 'Seeds', quantity: 150, unit: 'kg', unitPrice: 30, supplier: 'SeedCo', stockLevel: 'medium' }
    ];
    
    const container = document.getElementById('inventory-list');
    container.innerHTML = `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Unit Price (ZMW)</th>
              <th>Stock Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.inventory.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>ZMW ${item.unitPrice}</td>
                <td><span class="badge badge-${item.stockLevel === 'good' ? 'success' : item.stockLevel === 'low' ? 'danger' : 'warning'}">${item.stockLevel}</span></td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn edit" onclick="editInventory(${item.id})" title="Edit">✏️</button>
                    <button class="action-btn delete" onclick="deleteInventory(${item.id})" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }, 500);
}

function showAddInventoryModal() {
  showModal('Add Inventory Item', `
    <form id="add-inventory-form">
      <div class="form-group">
        <label class="form-label">Item Name</label>
        <input type="text" class="form-control" name="name" required>
      </div>
      <div class="grid grid-cols-2 gap-12">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-control" name="category" required>
            <option value="">Select Category</option>
            <option value="Seeds">Seeds</option>
            <option value="Fertilizers">Fertilizers</option>
            <option value="Tools">Tools</option>
            <option value="Pesticides">Pesticides</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Unit</label>
          <select class="form-control" name="unit" required>
            <option value="">Select Unit</option>
            <option value="kg">Kilograms</option>
            <option value="bags">Bags</option>
            <option value="liters">Liters</option>
            <option value="pieces">Pieces</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Quantity</label>
          <input type="number" class="form-control" name="quantity" required>
        </div>
        <div class="form-group">
          <label class="form-label">Unit Price (ZMW)</label>
          <input type="number" class="form-control" name="unitPrice" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Supplier</label>
        <input type="text" class="form-control" name="supplier" required>
      </div>
    </form>
  `, () => {
    showToast('Inventory item added successfully!', 'success');
    hideModal();
    loadInventory();
  });
}

function editInventory(id) {
  const item = state.inventory.find(i => i.id === id);
  if (!item) return;
  
  showModal('Edit Inventory Item', `
    <form id="edit-inventory-form">
      <div class="grid grid-cols-2 gap-12">
        <div class="form-group">
          <label class="form-label">Quantity</label>
          <input type="number" class="form-control" name="quantity" value="${item.quantity}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Unit Price (ZMW)</label>
          <input type="number" class="form-control" name="unitPrice" value="${item.unitPrice}" required>
        </div>
      </div>
    </form>
  `, () => {
    showToast('Inventory item updated successfully!', 'success');
    hideModal();
    loadInventory();
  });
}

function deleteInventory(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    showToast('Inventory item deleted successfully', 'success');
    loadInventory();
  }
}

// Supply Requests Page
function renderSupplyRequestsPage() {
  return `
    <h2 class="mb-24">Supply Requests</h2>
    
    <div class="tabs mb-24">
      <div class="tab-list">
        <button class="tab-item active" onclick="filterRequests('pending')">Pending</button>
        <button class="tab-item" onclick="filterRequests('approved')">Approved</button>
        <button class="tab-item" onclick="filterRequests('rejected')">Rejected</button>
        <button class="tab-item" onclick="filterRequests('all')">All</button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-body">
        <div id="requests-list">
          <div class="text-center" style="padding: 40px;">
            <div class="spinner" style="width: 40px; height: 40px; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function loadSupplyRequests() {
  setTimeout(() => {
    state.supplyRequests = [
      { id: 1, farmerName: 'John Farmer', item: 'Maize Seeds', quantity: 50, unit: 'kg', requestDate: '2025-10-28', status: 'pending' },
      { id: 2, farmerName: 'Mary Banda', item: 'NPK Fertilizer', quantity: 10, unit: 'bags', requestDate: '2025-10-27', status: 'approved' },
      { id: 3, farmerName: 'Joseph Mwale', item: 'Hand Hoe', quantity: 2, unit: 'pieces', requestDate: '2025-10-26', status: 'pending' },
      { id: 4, farmerName: 'Grace Phiri', item: 'Pesticide Spray', quantity: 5, unit: 'liters', requestDate: '2025-10-25', status: 'rejected' }
    ];
    
    displayRequests(state.supplyRequests);
  }, 500);
}

function displayRequests(requests) {
  const container = document.getElementById('requests-list');
  
  if (requests.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">No requests found</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Farmer Name</th>
            <th>Item Requested</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Request Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${requests.map(req => `
            <tr>
              <td>${req.farmerName}</td>
              <td>${req.item}</td>
              <td>${req.quantity}</td>
              <td>${req.unit}</td>
              <td>${req.requestDate}</td>
              <td><span class="badge badge-${req.status === 'approved' ? 'success' : req.status === 'pending' ? 'warning' : 'danger'}">${req.status}</span></td>
              <td>
                ${req.status === 'pending' ? `
                  <div class="action-buttons">
                    <button class="btn btn-success btn-sm" onclick="approveRequest(${req.id})">✓ Approve</button>
                    <button class="btn btn-danger btn-sm" onclick="rejectRequest(${req.id})">✗ Reject</button>
                  </div>
                ` : '-'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function filterRequests(status) {
  const tabs = document.querySelectorAll('.tab-item');
  tabs.forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
  
  if (status === 'all') {
    displayRequests(state.supplyRequests);
  } else {
    const filtered = state.supplyRequests.filter(r => r.status === status);
    displayRequests(filtered);
  }
}

function approveRequest(id) {
  showToast('Supply request approved!', 'success');
  loadSupplyRequests();
}

function rejectRequest(id) {
  showToast('Supply request rejected', 'info');
  loadSupplyRequests();
}

// Reports Page
function renderReportsPage() {
  return `
    <h2 class="mb-24">Reports &amp; Analytics</h2>
    
    <div class="grid grid-cols-2 gap-16 mb-24">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Farmer Summary Report</h3>
        </div>
        <div class="card-body">
          <p class="text-secondary mb-16">Generate a comprehensive report of all registered farmers.</p>
          <button class="btn btn-primary" onclick="exportReport('farmers', 'pdf')">📄 Export PDF</button>
          <button class="btn btn-secondary" onclick="exportReport('farmers', 'excel')">📊 Export Excel</button>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Inventory Status Report</h3>
        </div>
        <div class="card-body">
          <p class="text-secondary mb-16">Current inventory levels and stock status.</p>
          <button class="btn btn-primary" onclick="exportReport('inventory', 'pdf')">📄 Export PDF</button>
          <button class="btn btn-secondary" onclick="exportReport('inventory', 'excel')">📊 Export Excel</button>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Supply Requests Report</h3>
        </div>
        <div class="card-body">
          <p class="text-secondary mb-16">All supply requests with status breakdown.</p>
          <button class="btn btn-primary" onclick="exportReport('requests', 'pdf')">📄 Export PDF</button>
          <button class="btn btn-secondary" onclick="exportReport('requests', 'excel')">📊 Export Excel</button>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Operator Performance Report</h3>
        </div>
        <div class="card-body">
          <p class="text-secondary mb-16">Extension officer activities and statistics.</p>
          <button class="btn btn-primary" onclick="exportReport('operators', 'pdf')">📄 Export PDF</button>
          <button class="btn btn-secondary" onclick="exportReport('operators', 'excel')">📊 Export Excel</button>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Statistics Overview</h3>
      </div>
      <div class="card-body">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-title">Total Farmers</div>
            <div class="stat-card-value">47</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Total Land Area</div>
            <div class="stat-card-value">156.8 ha</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Supply Requests</div>
            <div class="stat-card-value">32</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Active Operators</div>
            <div class="stat-card-value">3</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function exportReport(type, format) {
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    showToast(`${type} report exported as ${format.toUpperCase()}!`, 'success');
  }, 1000);
}

// Documents Page
async function renderDocumentsPage() {
  let pendingFarmers = [];
  
  try {
    const farmers = await apiRequest('/api/farmers/');
    pendingFarmers = farmers.filter(f => !f.photo_path || !f.id_card_generated);
  } catch (error) {
    console.error('Error loading documents:', error);
  }
  
  return `
    <h2 class="mb-24">Document Management</h2>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Farmers Needing Documents</h3>
      </div>
      <div class="card-body">
        ${pendingFarmers.length > 0 ? `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Farmer Name</th>
                  <th>Phone</th>
                  <th>Photo</th>
                  <th>ID Card</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pendingFarmers.map(f => `
                  <tr>
                    <td>${f.first_name} ${f.last_name}</td>
                    <td>${f.primary_phone}</td>
                    <td><span class="badge badge-${f.photo_path ? 'success' : 'warning'}">${f.photo_path ? '✓ Uploaded' : '✗ Missing'}</span></td>
                    <td><span class="badge badge-${f.id_card_generated ? 'success' : 'warning'}">${f.id_card_generated ? '✓ Generated' : '✗ Not Generated'}</span></td>
                    <td>
                      <div class="action-buttons">
                        ${!f.photo_path ? `<button class="btn btn-sm btn-primary" onclick="uploadFarmerPhoto('${f.id}')">Upload Photo</button>` : ''}
                        ${f.photo_path && !f.id_card_generated ? `<button class="btn btn-sm btn-success" onclick="generateIDCard('${f.id}')">Generate ID</button>` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">✅</div>
            <div class="empty-state-title">All Documents Complete</div>
            <div class="empty-state-description">All farmers have uploaded their documents and ID cards generated.</div>
          </div>
        `}
      </div>
    </div>
  `;
}

function uploadFarmerPhoto(farmerId) {
  showModal('Upload Farmer Photo', `
    <form id="upload-photo-form">
      <div class="form-group">
        <label class="form-label">Select Photo</label>
        <input type="file" class="form-control" id="photo-file" accept="image/*" required>
        <div class="text-sm text-secondary mt-8">Upload a clear passport-style photo</div>
      </div>
      <div class="mt-16">
        <button type="submit" class="btn btn-primary btn-full">Upload Photo</button>
      </div>
    </form>
  `, null, false);
  
  document.getElementById('upload-photo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('photo-file').files[0];
    
    if (!file) {
      showToast('Please select a photo', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      await apiUpload(`/api/farmers/${farmerId}/upload-photo`, formData);
      
      showToast('Photo uploaded successfully!', 'success');
      hideModal();
      navigate('/officer/documents');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload photo: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  });
}

async function renderFarmerDocumentsPage() {
  if (!state.farmerProfile) {
    await loadFarmerProfile();
  }
  
  const farmer = state.farmerProfile || {};
  
  return `
    <h2 class="mb-24">My Documents</h2>
    
    <div class="card mb-24">
      <div class="card-header">
        <h3 class="card-title">Upload Documents</h3>
      </div>
      <div class="card-body">
        <form id="upload-document-form">
          <div class="form-group">
            <label class="form-label">Document Type</label>
            <select class="form-control" id="doc-type" required>
              <option value="">Select Document Type</option>
              <option value="identity_proof">NRC or Identity Proof</option>
              <option value="land_documents">Land Certificate</option>
              <option value="bank_details">Bank Documents</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Upload File</label>
            <input type="file" class="form-control" id="doc-file" accept="image/*,application/pdf" required>
            <div class="text-sm text-secondary mt-8">Accepted formats: JPG, PNG, PDF (Max 5MB)</div>
          </div>
          <button type="submit" class="btn btn-primary">Upload Document</button>
        </form>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Document Status</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-2 gap-16">
          <div style="padding: 16px; background: var(--color-bg-1); border-radius: 8px;">
            <div class="text-sm text-secondary mb-4">Profile Photo</div>
            <div class="flex items-center gap-8">
              <span class="badge badge-${farmer.photo_path ? 'success' : 'warning'}">
                ${farmer.photo_path ? '✓ Uploaded' : '✗ Not Uploaded'}
              </span>
            </div>
          </div>
          <div style="padding: 16px; background: var(--color-bg-1); border-radius: 8px;">
            <div class="text-sm text-secondary mb-4">ID Card</div>
            <div class="flex items-center gap-8">
              <span class="badge badge-${farmer.id_card_generated ? 'success' : 'warning'}">
                ${farmer.id_card_generated ? '✓ Generated' : '✗ Not Generated'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachDocumentUploadHandler() {
  const form = document.getElementById('upload-document-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const docType = document.getElementById('doc-type').value;
    const file = document.getElementById('doc-file').files[0];
    
    if (!file || !docType) {
      showToast('Please select document type and file', 'warning');
      return;
    }
    
    if (!state.farmerProfile || !state.farmerProfile.id) {
      showToast('Farmer profile not found', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', docType);
      
      await apiUpload('/api/farmers/' + state.farmerProfile.id + '/upload-document', formData);
      
      showToast('Document uploaded successfully!', 'success');
      form.reset();
      
      await loadFarmerProfile();
      navigate('/farmer/documents');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload document: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  });
}

// Farmer Request Supply Page
function renderRequestSupplyPage() {
  return `
    <h2 class="mb-24">Request Supply</h2>
    
    <div class="card">
      <div class="card-body">
        <form id="request-supply-form">
          <div class="form-group">
            <label class="form-label">Item Category</label>
            <select class="form-control" name="category" required>
              <option value="">Select Category</option>
              <option value="seeds">Seeds</option>
              <option value="fertilizers">Fertilizers</option>
              <option value="tools">Tools</option>
              <option value="pesticides">Pesticides</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Item Name</label>
            <select class="form-control" name="item" required>
              <option value="">Select Item</option>
              <option value="maize_seeds">Maize Seeds (Hybrid)</option>
              <option value="npk_fertilizer">NPK Fertilizer</option>
              <option value="hand_hoe">Hand Hoe</option>
              <option value="pesticide_spray">Pesticide Spray</option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-16">
            <div class="form-group">
              <label class="form-label">Quantity</label>
              <input type="number" class="form-control" name="quantity" min="1" required>
            </div>
            <div class="form-group">
              <label class="form-label">Unit</label>
              <select class="form-control" name="unit" required>
                <option value="">Select Unit</option>
                <option value="kg">Kilograms</option>
                <option value="bags">Bags</option>
                <option value="pieces">Pieces</option>
                <option value="liters">Liters</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Purpose / Notes</label>
            <textarea class="form-control" name="notes" rows="4" placeholder="Explain why you need this supply..."></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary">Submit Request</button>
        </form>
      </div>
    </div>
  `;
}

function attachRequestSupplyHandlers() {
  const form = document.getElementById('request-supply-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      showToast('Supply request submitted successfully!', 'success');
      navigate('/farmer/requests');
    }, 1000);
  });
}

// Farmer Requests Page
function renderFarmerRequestsPage() {
  return `
    <h2 class="mb-24">My Supply Requests</h2>
    
    <div class="card">
      <div class="card-body">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Maize Seeds</td>
                <td>50 kg</td>
                <td>2025-10-28</td>
                <td><span class="badge badge-warning">Pending</span></td>
                <td>For new season planting</td>
              </tr>
              <tr>
                <td>NPK Fertilizer</td>
                <td>5 bags</td>
                <td>2025-10-15</td>
                <td><span class="badge badge-success">Approved</span></td>
                <td>For maize cultivation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Farmer ID Card Page
async function renderFarmerIDCard() {
  if (!state.farmerProfile) {
    await loadFarmerProfile();
  }
  
  const farmer = state.farmerProfile || {};
  const idCardUrl = farmer.id_card_path ? `${CONFIG.API_BASE_URL}${farmer.id_card_path}` : null;
  
  return `
    <h2 class="mb-24">My Farmer ID Card</h2>
    
    <div class="card" style="max-width: 600px; margin: 0 auto;">
      <div class="card-body">
        ${farmer.id_card_generated ? `
          <div class="text-center mb-24">
            <img src="${idCardUrl}" alt="Farmer ID Card" style="max-width: 100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display: none; padding: 40px; border: 2px dashed var(--color-border); border-radius: var(--radius-lg); color: var(--color-text-secondary);">
              <div style="font-size: 48px; margin-bottom: 16px;">🪪</div>
              <div>ID Card Preview Not Available</div>
            </div>
          </div>
          
          <div class="text-center">
            <button class="btn btn-primary" onclick="downloadFarmerIDCard()">📥 Download ID Card</button>
            <button class="btn btn-secondary" onclick="showQRVerification()">📱 Show QR Code</button>
          </div>
        ` : `
          <div class="text-center" style="padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 24px; opacity: 0.5;">🪪</div>
            <h3 style="margin-bottom: 16px;">ID Card Not Generated</h3>
            <p class="text-secondary" style="margin-bottom: 24px;">Your ID card will be generated after your registration is approved.</p>
            ${state.user.role === 'operator' || state.user.role === 'admin' ? `
              <button class="btn btn-primary" onclick="generateIDCard('${farmer.id}')">Generate ID Card</button>
            ` : ''}
          </div>
        `}
      </div>
    </div>
  `;
}

async function downloadFarmerIDCard() {
  if (!state.farmerProfile?.id) return;
  
  try {
    setLoading(true);
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/farmers/${state.farmerProfile.id}/download-idcard`, {
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });
    
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmer_id_card_${state.farmerProfile.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showToast('ID Card downloaded successfully', 'success');
  } catch (error) {
    console.error('Download error:', error);
    showToast('Failed to download ID card', 'error');
  } finally {
    setLoading(false);
  }
}

async function generateIDCard(farmerId) {
  try {
    setLoading(true);
    await apiRequest(`/api/farmers/${farmerId}/generate-idcard`, {
      method: 'POST'
    });
    showToast('ID Card generated successfully!', 'success');
    
    // Reload profile
    await loadFarmerProfile();
    navigate('/farmer/id-card');
  } catch (error) {
    console.error('Generate ID card error:', error);
    showToast('Failed to generate ID card: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
}

function showQRVerification() {
  const farmer = state.farmerProfile;
  if (!farmer) return;
  
  showModal('QR Code Verification', `
    <div class="text-center" style="padding: 20px;">
      <div style="background: white; padding: 20px; display: inline-block; border-radius: 12px; box-shadow: var(--shadow-md);">
        <div id="qr-code-container" style="width: 256px; height: 256px; display: flex; align-items: center; justify-content: center; background: var(--color-bg-1);">
          <canvas id="qr-canvas" width="256" height="256"></canvas>
        </div>
      </div>
      <div class="mt-24">
        <p class="font-semibold" style="font-size: var(--font-size-lg);">${farmer.first_name} ${farmer.last_name}</p>
        <p class="text-secondary">Farmer ID: ${farmer.id}</p>
      </div>
      <div class="mt-16">
        <button class="btn btn-secondary" onclick="verifyQRScanner()">📱 Scan QR Code</button>
      </div>
    </div>
  `, null, false);
  
  // Generate simple QR code representation
  generateSimpleQR(farmer.id);
}

function generateSimpleQR(farmerId) {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(8, 8, 240, 240);
  ctx.fillStyle = '#000000';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('QR Code', 128, 128);
  ctx.fillText(`Farmer ID: ${farmerId}`, 128, 148);
}

function verifyQRScanner() {
  hideModal();
  showModal('Scan QR Code', `
    <div class="form-group">
      <label class="form-label">Enter Farmer ID or Scan QR</label>
      <input type="text" class="form-control" id="qr-verify-input" placeholder="Enter Farmer ID">
    </div>
    <div class="mt-16">
      <button class="btn btn-primary btn-full" onclick="verifyFarmerQR()">Verify</button>
    </div>
    <div id="verify-result" class="mt-24"></div>
  `, null, false);
}

async function verifyFarmerQR() {
  const input = document.getElementById('qr-verify-input');
  const resultDiv = document.getElementById('verify-result');
  
  if (!input.value) {
    showToast('Please enter a Farmer ID', 'warning');
    return;
  }
  
  try {
    const result = await apiRequest('/api/farmers/verify-qr', {
      method: 'POST',
      body: JSON.stringify({ qr_data: input.value })
    });
    
    resultDiv.innerHTML = `
      <div class="card" style="background: var(--color-bg-3); border-color: var(--color-success);">
        <div class="card-body">
          <div class="flex items-center gap-12 mb-16">
            <span style="font-size: 32px;">✓</span>
            <div>
              <div class="font-semibold">Verification Successful</div>
              <div class="text-sm text-secondary">Valid farmer registration</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-12">
            <div>
              <div class="text-sm text-secondary">Farmer Name</div>
              <div class="font-medium">${result.farmer_name || 'N/A'}</div>
            </div>
            <div>
              <div class="text-sm text-secondary">Status</div>
              <div class="font-medium">${result.status || 'Active'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = `
      <div class="card" style="background: var(--color-bg-4); border-color: var(--color-error);">
        <div class="card-body">
          <div class="flex items-center gap-12">
            <span style="font-size: 32px;">✗</span>
            <div>
              <div class="font-semibold">Verification Failed</div>
              <div class="text-sm text-secondary">${error.message}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Modal Functions
function showModal(title, content, onSave = null, showFooter = true) {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="modal-overlay" onclick="event.target === this && hideModal()">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="hideModal()">×</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        ${showFooter ? `
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="hideModal()">Cancel</button>
            <button class="btn btn-primary" onclick="saveModal()">Save</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  if (onSave) {
    window.saveModal = onSave;
  }
}

function hideModal() {
  const container = document.getElementById('modal-container');
  container.innerHTML = '';
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const id = 'toast-' + Date.now();
  
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  const toast = document.createElement('div');
  toast.id = id;
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="removeToast('${id}')">×</button>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    removeToast(id);
  }, 4000);
}

function removeToast(id) {
  const toast = document.getElementById(id);
  if (toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => toast.remove(), 300);
  }
}

// Loading Overlay
function setLoading(loading) {
  const overlay = document.getElementById('loading-overlay');
  if (loading) {
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}