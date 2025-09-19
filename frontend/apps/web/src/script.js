// Global variables
let currentUser = null;
let authToken = null;
let uploadedPhotoUrl = null;

// API Base URL
const API_BASE = '';

// ========================
// AES-GCM Encryption (AAD: "TEST")
// ========================
// Configure this to match server ENCRYPTION_KEY (prefer 32 random bytes, base64-encoded)
// If left empty, we will derive a 32-byte key from CLIENT_KEY_FALLBACK via SHA-256.
let ENCRYPTION_KEY_B64 = '';
const CLIENT_KEY_FALLBACK = 'set-a-strong-shared-key-here';
let AAD_STRING = 'TEST';

async function getCryptoKey() {
    const keyBytes = ENCRYPTION_KEY_B64 ? base64ToBytes(ENCRYPTION_KEY_B64) : await sha256Bytes(new TextEncoder().encode(CLIENT_KEY_FALLBACK));
    if (keyBytes.length !== 32) {
        throw new Error('Encryption key must be 32 bytes');
    }
    return crypto.subtle.importKey(
        'raw',
        keyBytes,
        {name: 'AES-GCM'},
        false,
        ['encrypt','decrypt']
    );
}

function base64ToBytes(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

function bytesToBase64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
}

async function sha256Bytes(data) {
    const hash = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hash);
}

async function encryptJson(jsonObj) {
    const key = await getCryptoKey();
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(jsonObj));
    const aad = new TextEncoder().encode(AAD_STRING);
    const ciphertextBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, additionalData: aad }, key, plaintext);
    const ciphertext = new Uint8Array(ciphertextBuf);
    return { nonce: bytesToBase64(nonce), ciphertext: bytesToBase64(ciphertext) };
}

async function decryptToJson(nonceB64, ciphertextB64) {
    const key = await getCryptoKey();
    const nonce = base64ToBytes(nonceB64);
    const ciphertext = base64ToBytes(ciphertextB64);
    const aad = new TextEncoder().encode(AAD_STRING);
    const plaintextBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce, additionalData: aad }, key, ciphertext);
    const plaintext = new TextDecoder().decode(plaintextBuf);
    return JSON.parse(plaintext);
}

function packPasswordB64(nonceB64, ciphertextB64) {
    const nonce = base64ToBytes(nonceB64);
    const cipher = base64ToBytes(ciphertextB64);
    const packed = new Uint8Array(nonce.length + cipher.length);
    packed.set(nonce, 0);
    packed.set(cipher, nonce.length);
    return bytesToBase64(packed);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
        authToken = savedToken;
        loadUserProfile();
    }
    
    // Set up form event listeners
    setupEventListeners();
    
    // Load encryption config first so auth works consistently
    loadEncryptionConfig().then(() => {
        // Load initial data
        loadIssues();
        loadAdminIssues();
        loadStats();
        loadHeatmap();
    });
});

async function loadEncryptionConfig() {
    try {
        const res = await fetch(`${API_BASE}/encryption/config`);
        if (res.ok) {
            const cfg = await res.json();
            if (cfg.key_b64) ENCRYPTION_KEY_B64 = cfg.key_b64;
            if (cfg.aad) AAD_STRING = cfg.aad;
        }
    } catch (e) {}
}

// Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Issue form
    document.getElementById('issueForm').addEventListener('submit', handleIssueSubmit);
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        // Packed mode: password is base64(nonce||ciphertext) of encrypted {secret}
        const encrypted = await encryptJson({ secret: password });
        const packedPassword = packPasswordB64(encrypted.nonce, encrypted.ciphertext);
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone_number: phone, password: packedPassword })
        });
        
        const encResp = await response.json();
        
        if (response.ok) {
            const data = encResp; // server returns plaintext token now
            authToken = data.access_token;
            localStorage.setItem('authToken', authToken);
            showStatus('Login successful!', 'success');
            loadUserProfile();
            showTab('issues');
        } else {
            showStatus(encResp.detail || 'Login failed', 'error');
        }
    } catch (error) {
        showStatus('Network error. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const fpCheck = 'TEST';
    
    try {
        const encPwd = await encryptJson({ secret: password });
        const packedPassword = packPasswordB64(encPwd.nonce, encPwd.ciphertext);
        const encFp = await encryptJson({ fp_check: fpCheck });
        const packedFp = packPasswordB64(encFp.nonce, encFp.ciphertext);
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                full_name: name,
                phone_number: phone,
                password: packedPassword,
                fp_check: packedFp
            })
        });
        
        const resp = await response.json();
        
        if (response.ok) {
            showStatus('Registration successful! Please login.', 'success');
            document.getElementById('registerForm').reset();
        } else {
            showStatus(resp.detail || 'Registration failed', 'error');
        }
    } catch (error) {
        showStatus('Network error. Please try again.', 'error');
    }
}

async function loadUserProfile() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            document.getElementById('userName').textContent = user.full_name;
            document.getElementById('userInfo').style.display = 'flex';
            loadMyIssues();
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    document.getElementById('userInfo').style.display = 'none';
    showTab('login');
    showStatus('Logged out successfully', 'info');
}

// Issue Management Functions
async function uploadPhoto() {
    const fileInput = document.getElementById('issuePhoto');
    const file = fileInput.files[0];
    
    if (!file) {
        showStatus('Please select a photo first', 'error');
        return;
    }
    
    try {
        // Step 1: Get upload URL
        const uploadResponse = await fetch(`${API_BASE}/issues/initiate-upload?filename=${file.name}`, {
            method: 'POST'
        });
        
        const uploadData = await uploadResponse.json();
        
        if (uploadResponse.ok) {
            // Step 2: Upload file to the URL
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadResult = await fetch(uploadData.url, {
                method: 'PUT',
                body: file
            });
            
            if (uploadResult.ok) {
                uploadedPhotoUrl = uploadData.url.split('?')[0]; // Remove query params
                document.getElementById('photoStatus').innerHTML = 
                    '<span style="color: green;">✓ Photo uploaded successfully</span>';
                showStatus('Photo uploaded successfully!', 'success');
            } else {
                showStatus('Photo upload failed', 'error');
            }
        } else {
            showStatus('Failed to get upload URL', 'error');
        }
    } catch (error) {
        showStatus('Photo upload error', 'error');
    }
}

async function handleIssueSubmit(e) {
    e.preventDefault();
    
    if (!authToken) {
        showStatus('Please login first', 'error');
        return;
    }
    
    const formData = {
        category: document.getElementById('issueCategory').value,
        description: document.getElementById('issueDescription').value,
        lat: parseFloat(document.getElementById('issueLat').value),
        lng: parseFloat(document.getElementById('issueLng').value),
        ward: document.getElementById('issueWard').value,
        media_urls: uploadedPhotoUrl ? [uploadedPhotoUrl] : []
    };
    
    try {
        const response = await fetch(`${API_BASE}/issues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus('Issue reported successfully!', 'success');
            document.getElementById('issueForm').reset();
            uploadedPhotoUrl = null;
            document.getElementById('photoStatus').innerHTML = '';
            loadMyIssues();
            loadIssues();
        } else {
            showStatus(data.detail || 'Failed to report issue', 'error');
        }
    } catch (error) {
        showStatus('Network error. Please try again.', 'error');
    }
}

async function loadIssues() {
    const category = document.getElementById('mapCategory')?.value || '';
    const status = document.getElementById('mapStatus')?.value || '';
    
    try {
        let url = `${API_BASE}/issues?`;
        const params = new URLSearchParams();
        
        if (category) params.append('category', category);
        if (status) params.append('status', status);
        
        url += params.toString();
        
        const response = await fetch(url);
        const issues = await response.json();
        
        displayIssues(issues, 'issuesList');
    } catch (error) {
        console.error('Error loading issues:', error);
        showStatus('Failed to load issues', 'error');
    }
}

async function loadMyIssues() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE}/users/me/issues`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const issues = await response.json();
            displayIssues(issues, 'myIssuesList');
        }
    } catch (error) {
        console.error('Error loading my issues:', error);
    }
}

function displayIssues(issues, containerId) {
    const container = document.getElementById(containerId);
    
    if (issues.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No issues found</h3>
                <p>No issues match your current filters.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = issues.map(issue => `
        <div class="issue-card">
            <div class="issue-header">
                <div class="issue-title">${issue.category} - ${issue.ward || 'Unknown Ward'}</div>
                <div class="issue-status status-${issue.status}">${issue.status}</div>
            </div>
            <div class="issue-meta">
                <div><strong>ID:</strong> #${issue.id}</div>
                <div><strong>Location:</strong> ${issue.lat.toFixed(4)}, ${issue.lng.toFixed(4)}</div>
                <div><strong>Upvotes:</strong> ${issue.upvote_count}</div>
                <div><strong>Created:</strong> ${new Date(issue.created_at).toLocaleDateString()}</div>
            </div>
            <div class="issue-description">${issue.description}</div>
            <div class="issue-actions">
                <button class="btn btn-primary" onclick="upvoteIssue(${issue.id})">
                    <i class="fas fa-thumbs-up"></i>
                    <span class="upvote-count">${issue.upvote_count}</span>
                </button>
                ${containerId === 'adminIssuesList' ? `
                    <button class="btn btn-warning" onclick="updateIssueStatus(${issue.id}, 'in_progress')">
                        <i class="fas fa-play"></i> Start
                    </button>
                    <button class="btn btn-success" onclick="updateIssueStatus(${issue.id}, 'resolved')">
                        <i class="fas fa-check"></i> Resolve
                    </button>
                    <button class="btn btn-danger" onclick="deleteIssue(${issue.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function upvoteIssue(issueId) {
    if (!authToken) {
        showStatus('Please login to upvote', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/issues/${issueId}/upvote`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showStatus('Issue upvoted!', 'success');
            loadIssues();
            loadMyIssues();
        } else {
            showStatus('Failed to upvote issue', 'error');
        }
    } catch (error) {
        showStatus('Network error', 'error');
    }
}

// Admin Functions
async function loadAdminIssues() {
    if (!authToken) return;
    
    const status = document.getElementById('adminStatus')?.value || '';
    const ward = document.getElementById('adminWard')?.value || '';
    const category = document.getElementById('adminCategory')?.value || '';
    const sortBy = document.getElementById('adminSort')?.value || 'created_at';
    
    try {
        let url = `${API_BASE}/admin/issues?`;
        const params = new URLSearchParams();
        
        if (status) params.append('status', status);
        if (ward) params.append('ward', ward);
        if (category) params.append('category', category);
        params.append('sort_by', sortBy);
        params.append('sort_order', 'desc');
        
        url += params.toString();
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const issues = await response.json();
            displayIssues(issues, 'adminIssuesList');
        }
    } catch (error) {
        console.error('Error loading admin issues:', error);
        showStatus('Failed to load admin issues', 'error');
    }
}

async function updateIssueStatus(issueId, status) {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/issues/${issueId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: status })
        });
        
        if (response.ok) {
            showStatus(`Issue ${status} successfully!`, 'success');
            loadAdminIssues();
            loadIssues();
        } else {
            showStatus('Failed to update issue status', 'error');
        }
    } catch (error) {
        showStatus('Network error', 'error');
    }
}

async function deleteIssue(issueId) {
    if (!authToken) return;
    
    if (!confirm('Are you sure you want to delete this issue?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/issues/${issueId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showStatus('Issue deleted successfully!', 'success');
            loadAdminIssues();
            loadIssues();
        } else {
            showStatus('Failed to delete issue', 'error');
        }
    } catch (error) {
        showStatus('Network error', 'error');
    }
}

// Analytics Functions
async function loadStats() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE}/analytics/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            displayStats(stats);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function displayStats(stats) {
    const container = document.getElementById('statsGrid');
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.total_issues}</div>
            <div class="stat-label">Total Issues</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.resolved_today}</div>
            <div class="stat-label">Resolved Today</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.pending}</div>
            <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.in_progress}</div>
            <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.resolved_this_week}</div>
            <div class="stat-label">Resolved This Week</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.avg_resolution_time_hours}h</div>
            <div class="stat-label">Avg Resolution Time</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.top_category}</div>
            <div class="stat-label">Top Category</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.top_ward}</div>
            <div class="stat-label">Top Ward</div>
        </div>
    `;
}

async function loadHeatmap() {
    if (!authToken) return;
    
    const status = document.getElementById('heatmapStatus')?.value || '';
    const category = document.getElementById('heatmapCategory')?.value || '';
    
    try {
        let url = `${API_BASE}/analytics/heatmap?`;
        const params = new URLSearchParams();
        
        if (status) params.append('status', status);
        if (category) params.append('category', category);
        
        url += params.toString();
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const heatmapData = await response.json();
            displayHeatmap(heatmapData);
        }
    } catch (error) {
        console.error('Error loading heatmap:', error);
    }
}

function displayHeatmap(data) {
    const container = document.getElementById('heatmapData');
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map-marker-alt"></i>
                <h3>No heatmap data</h3>
                <p>No issues match your current filters.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.map(point => `
        <div class="heatmap-point">
            <div class="heatmap-coords">${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}</div>
            <div class="heatmap-count">${point.count}</div>
            <div class="heatmap-category">${point.category}</div>
            <div style="font-size: 0.8rem; color: #6c757d; margin-top: 0.5rem;">${point.status}</div>
        </div>
    `).join('');
}

// Utility Functions
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for the tab
    if (tabName === 'issues' && authToken) {
        loadMyIssues();
    } else if (tabName === 'map') {
        loadIssues();
    } else if (tabName === 'admin' && authToken) {
        loadAdminIssues();
    } else if (tabName === 'analytics' && authToken) {
        loadStats();
        loadHeatmap();
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type} show`;
    
    setTimeout(() => {
        statusDiv.classList.remove('show');
    }, 3000);
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                document.getElementById('issueLat').value = position.coords.latitude.toFixed(6);
                document.getElementById('issueLng').value = position.coords.longitude.toFixed(6);
                showStatus('Location detected!', 'success');
            },
            function(error) {
                showStatus('Location access denied or failed', 'error');
            }
        );
    } else {
        showStatus('Geolocation not supported', 'error');
    }
}

// Initialize with some sample data
function initializeSampleData() {
    // This function can be used to populate the database with sample data
    console.log('Sample data initialization would go here');
}

