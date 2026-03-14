/* ============================================
   ZPA Access Policy Manager — Application Logic
   ============================================ */

// ============ SAMPLE DATA ============

const sampleUsers = [
    { id: 1, name: 'Arun Kumar', email: 'arun.kumar@corp.com', role: 'Admin', groups: ['IT-Admins', 'Network-Ops'], posture: 'Compliant', status: 'active', color: '#7c5cfc' },
    { id: 2, name: 'Priya Sharma', email: 'priya.sharma@corp.com', role: 'Engineer', groups: ['Dev-Team', 'Cloud-Ops'], posture: 'Compliant', status: 'active', color: '#00d4aa' },
    { id: 3, name: 'Raj Patel', email: 'raj.patel@corp.com', role: 'Analyst', groups: ['Finance', 'Reporting'], posture: 'Compliant', status: 'active', color: '#0088cc' },
    { id: 4, name: 'Meera Nair', email: 'meera.nair@corp.com', role: 'Engineer', groups: ['Dev-Team', 'QA'], posture: 'Compliant', status: 'active', color: '#00b4d8' },
    { id: 5, name: 'Vikram Singh', email: 'vikram.singh@contractor.com', role: 'Contractor', groups: ['External-Dev'], posture: 'Non-Compliant', status: 'active', color: '#f59e0b' },
    { id: 6, name: 'Sarah Chen', email: 'sarah.chen@partner.com', role: 'Guest', groups: ['Partner-Access'], posture: 'Compliant', status: 'inactive', color: '#8b95b0' },
    { id: 7, name: 'Deepak Verma', email: 'deepak.verma@corp.com', role: 'Admin', groups: ['IT-Admins', 'Security'], posture: 'Compliant', status: 'active', color: '#7c5cfc' },
    { id: 8, name: 'Anita Desai', email: 'anita.desai@corp.com', role: 'Analyst', groups: ['HR', 'Reporting'], posture: 'Compliant', status: 'active', color: '#0088cc' },
];

const sampleSegments = [
    { id: 1, name: 'ERP System', domain: 'erp.internal.corp.com', protocol: 'HTTPS', port: '443', status: 'online', connectors: 2, users: 45 },
    { id: 2, name: 'HR Portal', domain: 'hr.internal.corp.com', protocol: 'HTTPS', port: '443', status: 'online', connectors: 1, users: 120 },
    { id: 3, name: 'Dev GitLab', domain: 'gitlab.internal.corp.com', protocol: 'HTTPS', port: '443', status: 'online', connectors: 2, users: 30 },
    { id: 4, name: 'Jenkins CI/CD', domain: 'jenkins.internal.corp.com', protocol: 'HTTPS', port: '8443', status: 'online', connectors: 1, users: 15 },
    { id: 5, name: 'Finance DB', domain: 'findb.internal.corp.com', protocol: 'TCP', port: '5432', status: 'online', connectors: 2, users: 8 },
    { id: 6, name: 'Internal Wiki', domain: 'wiki.internal.corp.com', protocol: 'HTTPS', port: '443', status: 'maintenance', connectors: 1, users: 90 },
    { id: 7, name: 'Monitoring Dashboard', domain: 'grafana.internal.corp.com', protocol: 'HTTPS', port: '3000', status: 'online', connectors: 1, users: 25 },
    { id: 8, name: 'Legacy CRM', domain: 'crm.internal.corp.com', protocol: 'HTTPS', port: '443', status: 'offline', connectors: 0, users: 0 },
];

const samplePolicies = [
    { id: 1, priority: 1, name: 'Admin Full Access', action: 'allow', users: ['IT-Admins'], segments: ['ERP System', 'HR Portal', 'Dev GitLab', 'Jenkins CI/CD', 'Finance DB', 'Internal Wiki', 'Monitoring Dashboard'], status: 'active' },
    { id: 2, priority: 2, name: 'Dev Team — Code Repos', action: 'allow', users: ['Dev-Team'], segments: ['Dev GitLab', 'Jenkins CI/CD'], status: 'active' },
    { id: 3, priority: 3, name: 'Finance DB — Analysts Only', action: 'allow', users: ['Finance'], segments: ['Finance DB'], status: 'active' },
    { id: 4, priority: 4, name: 'HR Portal — All Employees', action: 'allow', users: ['HR', 'Finance', 'Dev-Team', 'IT-Admins', 'Reporting', 'Cloud-Ops', 'Network-Ops', 'QA', 'Security'], segments: ['HR Portal'], status: 'active' },
    { id: 5, priority: 5, name: 'Wiki — General Access', action: 'allow', users: ['Dev-Team', 'Finance', 'Reporting', 'IT-Admins', 'HR', 'Cloud-Ops', 'Network-Ops', 'QA', 'Security'], segments: ['Internal Wiki'], status: 'active' },
    { id: 6, priority: 6, name: 'Block Contractors — Finance', action: 'deny', users: ['External-Dev'], segments: ['Finance DB', 'ERP System'], status: 'active' },
    { id: 7, priority: 7, name: 'Monitoring — Ops Team', action: 'allow', users: ['Network-Ops', 'Cloud-Ops'], segments: ['Monitoring Dashboard'], status: 'active' },
    { id: 8, priority: 8, name: 'Partner Limited Access', action: 'allow', users: ['Partner-Access'], segments: ['Internal Wiki'], status: 'inactive' },
    { id: 9, priority: 9, name: 'Block Legacy CRM', action: 'deny', users: ['IT-Admins', 'Dev-Team', 'Finance', 'External-Dev', 'Partner-Access'], segments: ['Legacy CRM'], status: 'active' },
    { id: 10, priority: 10, name: 'QA — Testing Environments', action: 'allow', users: ['QA'], segments: ['Jenkins CI/CD', 'Dev GitLab'], status: 'active' },
    { id: 11, priority: 11, name: 'Reporting — Dashboard Only', action: 'allow', users: ['Reporting'], segments: ['Monitoring Dashboard'], status: 'active' },
    { id: 12, priority: 12, name: 'ERP — Cloud Ops', action: 'allow', users: ['Cloud-Ops'], segments: ['ERP System'], status: 'active' },
];

// ============ STATE ============
let policies = [...samplePolicies];
let segments = [...sampleSegments];
let users = [...sampleUsers];
let nextPolicyId = 13;
let nextSegmentId = 9;
let nextUserId = 9;
let liveMonitoring = true;
let monitorInterval = null;
let monitorStats = { allowed: 0, denied: 0, warnings: 0, total: 0 };

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderPolicies();
    renderSegments();
    renderUsers();
    renderDashboardActivity();
    populateSimulatorDropdowns();
    animateCounters();
    startLiveMonitoring();
    bindEventListeners();
});

// ============ TAB NAVIGATION ============
function initTabs() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// ============ ANIMATED COUNTERS ============
function animateCounters() {
    document.querySelectorAll('.stat-value[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        let current = 0;
        const step = Math.ceil(target / 40);
        const interval = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            el.textContent = current;
        }, 30);
    });
}

// ============ RENDER POLICIES ============
function renderPolicies(filter = {}) {
    const tbody = document.getElementById('policiesBody');
    let filtered = [...policies];

    if (filter.search) {
        const s = filter.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.users.some(u => u.toLowerCase().includes(s)));
    }
    if (filter.status && filter.status !== 'all') {
        filtered = filtered.filter(p => p.status === filter.status);
    }
    if (filter.action && filter.action !== 'all') {
        filtered = filtered.filter(p => p.action === filter.action);
    }

    filtered.sort((a, b) => a.priority - b.priority);

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><span class="priority-num">${p.priority}</span></td>
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td><span class="badge badge-${p.action}">${capitalize(p.action)}</span></td>
            <td>${p.users.map(u => `<span class="badge badge-group">${escapeHtml(u)}</span>`).join('')}</td>
            <td>${p.segments.map(s => `<span class="badge badge-group">${escapeHtml(s)}</span>`).join('')}</td>
            <td>
                <label class="toggle">
                    <input type="checkbox" ${p.status === 'active' ? 'checked' : ''} onchange="togglePolicyStatus(${p.id})">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" title="Edit" onclick="editPolicy(${p.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn delete" title="Delete" onclick="deletePolicy(${p.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function togglePolicyStatus(id) {
    const p = policies.find(x => x.id === id);
    if (p) {
        p.status = p.status === 'active' ? 'inactive' : 'active';
        showToast(`Policy "${p.name}" ${p.status === 'active' ? 'activated' : 'deactivated'}`, p.status === 'active' ? 'success' : 'warning');
    }
}

function deletePolicy(id) {
    const p = policies.find(x => x.id === id);
    if (p && confirm(`Delete policy "${p.name}"?`)) {
        policies = policies.filter(x => x.id !== id);
        // Re-number priorities
        policies.sort((a, b) => a.priority - b.priority).forEach((p, i) => p.priority = i + 1);
        renderPolicies();
        showToast(`Policy "${p.name}" deleted`, 'error');
        updateDashboardStats();
    }
}

function editPolicy(id) {
    const p = policies.find(x => x.id === id);
    if (!p) return;
    openModal('Edit Policy', getPolicyFormHTML(p), () => savePolicyFromForm(id));
}

function addPolicy() {
    openModal('Add Policy', getPolicyFormHTML(), () => savePolicyFromForm(null));
}

function getPolicyFormHTML(p = null) {
    const allGroups = [...new Set(users.flatMap(u => u.groups))].sort();
    const allSegs = segments.map(s => s.name).sort();

    return `
        <div class="form-group">
            <label>Policy Name</label>
            <input type="text" id="formPolicyName" placeholder="e.g. Dev Team Git Access" value="${p ? escapeHtml(p.name) : ''}">
        </div>
        <div class="form-group">
            <label>Action</label>
            <select id="formPolicyAction">
                <option value="allow" ${p && p.action === 'allow' ? 'selected' : ''}>Allow</option>
                <option value="deny" ${p && p.action === 'deny' ? 'selected' : ''}>Deny</option>
            </select>
        </div>
        <div class="form-group">
            <label>User Groups (hold Ctrl to select multiple)</label>
            <select id="formPolicyUsers" multiple style="height:120px">
                ${allGroups.map(g => `<option value="${escapeHtml(g)}" ${p && p.users.includes(g) ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Application Segments (hold Ctrl to select multiple)</label>
            <select id="formPolicySegments" multiple style="height:120px">
                ${allSegs.map(s => `<option value="${escapeHtml(s)}" ${p && p.segments.includes(s) ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
            </select>
        </div>
        <div class="form-actions">
            <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" id="formSubmitBtn">
                ${p ? 'Save Changes' : 'Create Policy'}
            </button>
        </div>
    `;
}

function savePolicyFromForm(editId) {
    const name = document.getElementById('formPolicyName').value.trim();
    const action = document.getElementById('formPolicyAction').value;
    const userEls = document.getElementById('formPolicyUsers');
    const segEls = document.getElementById('formPolicySegments');
    const selectedUsers = Array.from(userEls.selectedOptions).map(o => o.value);
    const selectedSegs = Array.from(segEls.selectedOptions).map(o => o.value);

    if (!name) { showToast('Please enter a policy name', 'error'); return; }
    if (selectedUsers.length === 0) { showToast('Select at least one user group', 'error'); return; }
    if (selectedSegs.length === 0) { showToast('Select at least one app segment', 'error'); return; }

    if (editId) {
        const p = policies.find(x => x.id === editId);
        p.name = name;
        p.action = action;
        p.users = selectedUsers;
        p.segments = selectedSegs;
        showToast(`Policy "${name}" updated`, 'success');
    } else {
        policies.push({
            id: nextPolicyId++,
            priority: policies.length + 1,
            name,
            action,
            users: selectedUsers,
            segments: selectedSegs,
            status: 'active'
        });
        showToast(`Policy "${name}" created`, 'success');
    }

    renderPolicies();
    updateDashboardStats();
    closeModal();
}

// ============ RENDER SEGMENTS ============
function renderSegments() {
    const grid = document.getElementById('segmentsGrid');
    grid.innerHTML = segments.map(s => `
        <div class="segment-card ${s.status}">
            <div class="segment-card-header">
                <h4>${escapeHtml(s.name)}</h4>
                <span class="badge badge-${s.status}">${capitalize(s.status)}</span>
            </div>
            <div class="segment-card-body">
                <div class="segment-detail">
                    <span class="segment-detail-label">Domain</span>
                    <span class="segment-detail-value">${escapeHtml(s.domain)}</span>
                </div>
                <div class="segment-detail">
                    <span class="segment-detail-label">Protocol</span>
                    <span class="segment-detail-value">${s.protocol}</span>
                </div>
                <div class="segment-detail">
                    <span class="segment-detail-label">Port</span>
                    <span class="segment-detail-value">${s.port}</span>
                </div>
                <div class="segment-detail">
                    <span class="segment-detail-label">App Connectors</span>
                    <span class="segment-detail-value">${s.connectors}</span>
                </div>
                <div class="segment-detail">
                    <span class="segment-detail-label">Connected Users</span>
                    <span class="segment-detail-value">${s.users}</span>
                </div>
            </div>
            <div class="segment-card-footer">
                <button class="action-btn" title="Edit" onclick="editSegment(${s.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn delete" title="Delete" onclick="deleteSegment(${s.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
            </div>
        </div>
    `).join('');
}

function editSegment(id) {
    const s = segments.find(x => x.id === id);
    if (!s) return;
    openModal('Edit Segment', getSegmentFormHTML(s), () => saveSegmentFromForm(id));
}

function addSegment() {
    openModal('Add Segment', getSegmentFormHTML(), () => saveSegmentFromForm(null));
}

function getSegmentFormHTML(s = null) {
    return `
        <div class="form-group">
            <label>Segment Name</label>
            <input type="text" id="formSegName" placeholder="e.g. Finance DB" value="${s ? escapeHtml(s.name) : ''}">
        </div>
        <div class="form-group">
            <label>Domain</label>
            <input type="text" id="formSegDomain" placeholder="e.g. app.internal.corp.com" value="${s ? escapeHtml(s.domain) : ''}">
        </div>
        <div class="form-group">
            <label>Protocol</label>
            <select id="formSegProtocol">
                <option value="HTTPS" ${s && s.protocol === 'HTTPS' ? 'selected' : ''}>HTTPS</option>
                <option value="HTTP" ${s && s.protocol === 'HTTP' ? 'selected' : ''}>HTTP</option>
                <option value="TCP" ${s && s.protocol === 'TCP' ? 'selected' : ''}>TCP</option>
                <option value="UDP" ${s && s.protocol === 'UDP' ? 'selected' : ''}>UDP</option>
                <option value="SSH" ${s && s.protocol === 'SSH' ? 'selected' : ''}>SSH</option>
                <option value="RDP" ${s && s.protocol === 'RDP' ? 'selected' : ''}>RDP</option>
            </select>
        </div>
        <div class="form-group">
            <label>Port</label>
            <input type="text" id="formSegPort" placeholder="e.g. 443" value="${s ? s.port : ''}">
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="formSegStatus">
                <option value="online" ${s && s.status === 'online' ? 'selected' : ''}>Online</option>
                <option value="offline" ${s && s.status === 'offline' ? 'selected' : ''}>Offline</option>
                <option value="maintenance" ${s && s.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
            </select>
        </div>
        <div class="form-actions">
            <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" id="formSubmitBtn">${s ? 'Save Changes' : 'Create Segment'}</button>
        </div>
    `;
}

function saveSegmentFromForm(editId) {
    const name = document.getElementById('formSegName').value.trim();
    const domain = document.getElementById('formSegDomain').value.trim();
    const protocol = document.getElementById('formSegProtocol').value;
    const port = document.getElementById('formSegPort').value.trim();
    const status = document.getElementById('formSegStatus').value;

    if (!name || !domain || !port) { showToast('Please fill all fields', 'error'); return; }

    if (editId) {
        const s = segments.find(x => x.id === editId);
        Object.assign(s, { name, domain, protocol, port, status });
        showToast(`Segment "${name}" updated`, 'success');
    } else {
        segments.push({ id: nextSegmentId++, name, domain, protocol, port, status, connectors: 1, users: 0 });
        showToast(`Segment "${name}" created`, 'success');
    }

    renderSegments();
    populateSimulatorDropdowns();
    updateDashboardStats();
    closeModal();
}

function deleteSegment(id) {
    const s = segments.find(x => x.id === id);
    if (s && confirm(`Delete segment "${s.name}"?`)) {
        segments = segments.filter(x => x.id !== id);
        renderSegments();
        populateSimulatorDropdowns();
        updateDashboardStats();
        showToast(`Segment "${s.name}" deleted`, 'error');
    }
}

// ============ RENDER USERS ============
function renderUsers(filter = {}) {
    const tbody = document.getElementById('usersBody');
    let filtered = [...users];

    if (filter.search) {
        const s = filter.search.toLowerCase();
        filtered = filtered.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }
    if (filter.role && filter.role !== 'all') {
        filtered = filtered.filter(u => u.role === filter.role);
    }

    tbody.innerHTML = filtered.map(u => `
        <tr>
            <td>
                <div class="user-info">
                    <div class="user-info-avatar" style="background:${u.color}">${u.name.charAt(0)}</div>
                    <span class="user-info-name">${escapeHtml(u.name)}</span>
                </div>
            </td>
            <td>${escapeHtml(u.email)}</td>
            <td><span class="badge badge-${u.role.toLowerCase()}">${u.role}</span></td>
            <td>${u.groups.map(g => `<span class="badge badge-group">${escapeHtml(g)}</span>`).join('')}</td>
            <td><span class="badge badge-${u.posture === 'Compliant' ? 'compliant' : 'warning'}">${u.posture}</span></td>
            <td><span class="badge badge-${u.status}">${capitalize(u.status)}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" title="Edit" onclick="editUser(${u.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn delete" title="Delete" onclick="deleteUser(${u.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function editUser(id) {
    const u = users.find(x => x.id === id);
    if (!u) return;
    openModal('Edit User', getUserFormHTML(u), () => saveUserFromForm(id));
}

function addUser() {
    openModal('Add User', getUserFormHTML(), () => saveUserFromForm(null));
}

function getUserFormHTML(u = null) {
    const allGroups = [...new Set(users.flatMap(x => x.groups)), 'IT-Admins', 'Dev-Team', 'Finance', 'HR', 'Reporting', 'External-Dev', 'Partner-Access', 'Cloud-Ops', 'Network-Ops', 'QA', 'Security'];
    const uniqueGroups = [...new Set(allGroups)].sort();

    return `
        <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="formUserName" placeholder="e.g. John Doe" value="${u ? escapeHtml(u.name) : ''}">
        </div>
        <div class="form-group">
            <label>Email</label>
            <input type="email" id="formUserEmail" placeholder="e.g. john@corp.com" value="${u ? escapeHtml(u.email) : ''}">
        </div>
        <div class="form-group">
            <label>Role</label>
            <select id="formUserRole">
                ${['Admin', 'Engineer', 'Analyst', 'Contractor', 'Guest'].map(r => `<option value="${r}" ${u && u.role === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Groups (hold Ctrl to select multiple)</label>
            <select id="formUserGroups" multiple style="height:120px">
                ${uniqueGroups.map(g => `<option value="${escapeHtml(g)}" ${u && u.groups.includes(g) ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('')}
            </select>
        </div>
        <div class="form-actions">
            <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" id="formSubmitBtn">${u ? 'Save Changes' : 'Create User'}</button>
        </div>
    `;
}

function saveUserFromForm(editId) {
    const name = document.getElementById('formUserName').value.trim();
    const email = document.getElementById('formUserEmail').value.trim();
    const role = document.getElementById('formUserRole').value;
    const groupEls = document.getElementById('formUserGroups');
    const selectedGroups = Array.from(groupEls.selectedOptions).map(o => o.value);

    if (!name || !email) { showToast('Please fill all required fields', 'error'); return; }

    const roleColors = { Admin: '#7c5cfc', Engineer: '#00d4aa', Analyst: '#0088cc', Contractor: '#f59e0b', Guest: '#8b95b0' };

    if (editId) {
        const u = users.find(x => x.id === editId);
        Object.assign(u, { name, email, role, groups: selectedGroups, color: roleColors[role] || '#8b95b0' });
        showToast(`User "${name}" updated`, 'success');
    } else {
        users.push({
            id: nextUserId++, name, email, role,
            groups: selectedGroups,
            posture: 'Compliant',
            status: 'active',
            color: roleColors[role] || '#8b95b0'
        });
        showToast(`User "${name}" added`, 'success');
    }

    renderUsers();
    populateSimulatorDropdowns();
    updateDashboardStats();
    closeModal();
}

function deleteUser(id) {
    const u = users.find(x => x.id === id);
    if (u && confirm(`Delete user "${u.name}"?`)) {
        users = users.filter(x => x.id !== id);
        renderUsers();
        populateSimulatorDropdowns();
        updateDashboardStats();
        showToast(`User "${u.name}" deleted`, 'error');
    }
}

// ============ DASHBOARD ACTIVITY ============
function renderDashboardActivity() {
    const list = document.getElementById('dashboardActivity');
    const activities = [
        { type: 'allow', text: '<strong>Priya Sharma</strong> accessed <strong>Dev GitLab</strong> via Client Connector', time: '2 min ago' },
        { type: 'deny', text: '<strong>Vikram Singh</strong> blocked from <strong>Finance DB</strong> — Policy: Block Contractors', time: '5 min ago' },
        { type: 'allow', text: '<strong>Raj Patel</strong> accessed <strong>Finance DB</strong> via Client Connector', time: '8 min ago' },
        { type: 'warning', text: '<strong>Sarah Chen</strong> access attempt to <strong>Internal Wiki</strong> — Partner policy inactive', time: '12 min ago' },
        { type: 'allow', text: '<strong>Deepak Verma</strong> accessed <strong>Monitoring Dashboard</strong> via Client Connector', time: '15 min ago' },
        { type: 'allow', text: '<strong>Arun Kumar</strong> accessed <strong>ERP System</strong> via Client Connector', time: '20 min ago' },
    ];

    list.innerHTML = activities.map(a => `
        <div class="activity-item">
            <span class="activity-dot" style="background:${a.type === 'allow' ? 'var(--success)' : a.type === 'deny' ? 'var(--danger)' : 'var(--warning)'}"></span>
            <span class="activity-text">${a.text}</span>
            <span class="activity-time">${a.time}</span>
        </div>
    `).join('');
}

// ============ LIVE MONITORING ============
function startLiveMonitoring() {
    if (monitorInterval) clearInterval(monitorInterval);
    monitorInterval = setInterval(() => {
        if (!liveMonitoring) return;
        generateLogEntry();
    }, 3000);
}

function generateLogEntry() {
    const feed = document.getElementById('logFeed');
    const empty = feed.querySelector('.log-empty');
    if (empty) empty.remove();

    const user = users[Math.floor(Math.random() * users.length)];
    const seg = segments.filter(s => s.status === 'online')[Math.floor(Math.random() * segments.filter(s => s.status === 'online').length)];
    if (!user || !seg) return;

    // Evaluate policy
    const result = evaluateAccess(user, seg.name);
    const type = result.allowed ? 'allow' : 'deny';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (type === 'allow') monitorStats.allowed++;
    else monitorStats.denied++;
    monitorStats.total++;
    if (Math.random() < 0.1) monitorStats.warnings++;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
        <span class="log-status-dot ${type}"></span>
        <span class="log-time">${timeStr}</span>
        <span class="log-user">${escapeHtml(user.name)}</span>
        <span class="log-action">${type === 'allow' ? 'Accessed' : 'Blocked from'} <strong>${escapeHtml(seg.name)}</strong></span>
        <span class="log-policy">${result.policyName || 'Implicit Deny'}</span>
    `;

    feed.insertBefore(entry, feed.firstChild);

    // Keep max 50 entries
    while (feed.children.length > 50) {
        feed.removeChild(feed.lastChild);
    }

    updateMonitorStats();
}

function updateMonitorStats() {
    document.getElementById('monitorAllowed').textContent = monitorStats.allowed;
    document.getElementById('monitorDenied').textContent = monitorStats.denied;
    document.getElementById('monitorWarnings').textContent = monitorStats.warnings;
    document.getElementById('monitorTotal').textContent = monitorStats.total;
}

// ============ POLICY EVALUATION ENGINE ============
function evaluateAccess(user, segmentName) {
    const activePolicies = policies.filter(p => p.status === 'active').sort((a, b) => a.priority - b.priority);

    for (const policy of activePolicies) {
        const userMatch = policy.users.some(group => user.groups.includes(group));
        const segMatch = policy.segments.includes(segmentName);

        if (userMatch && segMatch) {
            return {
                allowed: policy.action === 'allow',
                policyName: policy.name,
                policyId: policy.id
            };
        }
    }

    // Implicit deny
    return { allowed: false, policyName: null, policyId: null };
}

function evaluateAccessWithTrace(user, segmentName) {
    const activePolicies = policies.filter(p => p.status === 'active').sort((a, b) => a.priority - b.priority);
    const trace = [];
    let result = null;

    for (const policy of activePolicies) {
        const userMatch = policy.users.some(group => user.groups.includes(group));
        const segMatch = policy.segments.includes(segmentName);

        if (userMatch && segMatch && !result) {
            result = {
                allowed: policy.action === 'allow',
                policyName: policy.name,
                policyId: policy.id
            };
            trace.push({
                policy,
                status: policy.action === 'allow' ? 'matched' : 'denied-match',
                reason: `User groups [${user.groups.join(', ')}] match [${policy.users.filter(g => user.groups.includes(g)).join(', ')}] AND segment "${segmentName}" found`
            });
        } else {
            trace.push({
                policy,
                status: 'skipped',
                reason: !userMatch ? 'No user/group match' : !segMatch ? 'No segment match' : 'Already matched above'
            });
        }
    }

    if (!result) {
        result = { allowed: false, policyName: null, policyId: null };
    }

    return { result, trace };
}

// ============ SIMULATOR ============
function populateSimulatorDropdowns() {
    const userSelect = document.getElementById('simUser');
    const segSelect = document.getElementById('simSegment');

    userSelect.innerHTML = users.map(u => `<option value="${u.id}">${escapeHtml(u.name)} (${u.role})</option>`).join('');
    segSelect.innerHTML = segments.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
}

function runSimulation() {
    const userId = parseInt(document.getElementById('simUser').value);
    const segId = parseInt(document.getElementById('simSegment').value);
    const user = users.find(u => u.id === userId);
    const seg = segments.find(s => s.id === segId);

    if (!user || !seg) { showToast('Please select a user and segment', 'error'); return; }

    const { result, trace } = evaluateAccessWithTrace(user, seg.name);

    // Render result
    const resultCard = document.getElementById('simResultCard');
    resultCard.innerHTML = `
        <div class="sim-result">
            <div class="sim-result-icon ${result.allowed ? 'allowed' : 'denied'}">
                ${result.allowed
                    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
                    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
                }
            </div>
            <div class="sim-result-title ${result.allowed ? 'allowed' : 'denied'}">
                ACCESS ${result.allowed ? 'ALLOWED' : 'DENIED'}
            </div>
            <div class="sim-result-detail">
                <strong>${escapeHtml(user.name)}</strong> → <strong>${escapeHtml(seg.name)}</strong>
            </div>
            <div class="sim-result-detail">
                ${result.policyName ? `Matched Policy: <strong>${escapeHtml(result.policyName)}</strong>` : '<strong>No matching policy — Implicit Deny</strong>'}
            </div>
            <div class="sim-result-detail" style="margin-top:8px;opacity:0.7">
                User Groups: ${user.groups.map(g => `<span class="badge badge-group">${escapeHtml(g)}</span>`).join(' ')}
            </div>
        </div>
    `;

    // Render trace
    const traceCard = document.getElementById('simTraceCard');
    const traceList = document.getElementById('simTraceList');
    traceCard.style.display = 'block';

    traceList.innerHTML = trace.map((t, i) => `
        <div class="sim-trace-item ${t.status}" style="animation-delay:${i * 0.1}s">
            <span class="sim-trace-num">${t.policy.priority}</span>
            <span class="sim-trace-name">${escapeHtml(t.policy.name)}</span>
            <span class="sim-trace-result">
                ${t.status === 'matched' ? '✓ MATCH (Allow)' : t.status === 'denied-match' ? '✗ MATCH (Deny)' : '— Skip'}
            </span>
        </div>
    `).join('') + (
        !trace.some(t => t.status === 'matched' || t.status === 'denied-match')
        ? `<div class="sim-trace-item implicit-deny">
               <span class="sim-trace-num">∅</span>
               <span class="sim-trace-name">Implicit Deny (Default)</span>
               <span class="sim-trace-result" style="color:var(--danger)">✗ DENIED</span>
           </div>`
        : ''
    );

    showToast(`Simulation complete — ${result.allowed ? 'Access Allowed' : 'Access Denied'}`, result.allowed ? 'success' : 'error');
}

// ============ MODAL ============
function openModal(title, bodyHTML, submitCallback) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalOverlay').classList.add('open');

    // Bind submit
    setTimeout(() => {
        const submitBtn = document.getElementById('formSubmitBtn');
        if (submitBtn && submitCallback) {
            submitBtn.addEventListener('click', submitCallback);
        }
    }, 50);
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
}

// ============ TOAST ============
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-dot"></span>${escapeHtml(message)}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ DASHBOARD STATS UPDATE ============
function updateDashboardStats() {
    const activePolicies = policies.filter(p => p.status === 'active').length;
    const vals = document.querySelectorAll('.stat-value[data-count]');
    if (vals[0]) { vals[0].textContent = activePolicies; vals[0].dataset.count = activePolicies; }
    if (vals[1]) { vals[1].textContent = segments.length; vals[1].dataset.count = segments.length; }
}

// ============ EVENT LISTENERS ============
function bindEventListeners() {
    // Policy search & filter
    document.getElementById('policySearch').addEventListener('input', (e) => {
        renderPolicies({ search: e.target.value, status: document.getElementById('policyFilter').value, action: document.getElementById('policyActionFilter').value });
    });
    document.getElementById('policyFilter').addEventListener('change', () => {
        renderPolicies({ search: document.getElementById('policySearch').value, status: document.getElementById('policyFilter').value, action: document.getElementById('policyActionFilter').value });
    });
    document.getElementById('policyActionFilter').addEventListener('change', () => {
        renderPolicies({ search: document.getElementById('policySearch').value, status: document.getElementById('policyFilter').value, action: document.getElementById('policyActionFilter').value });
    });

    // User search & filter
    document.getElementById('userSearch').addEventListener('input', (e) => {
        renderUsers({ search: e.target.value, role: document.getElementById('userRoleFilter').value });
    });
    document.getElementById('userRoleFilter').addEventListener('change', () => {
        renderUsers({ search: document.getElementById('userSearch').value, role: document.getElementById('userRoleFilter').value });
    });

    // Add buttons
    document.getElementById('addPolicyBtn').addEventListener('click', addPolicy);
    document.getElementById('addSegmentBtn').addEventListener('click', addSegment);
    document.getElementById('addUserBtn').addEventListener('click', addUser);

    // Simulator
    document.getElementById('runSimBtn').addEventListener('click', runSimulation);

    // Monitor
    document.getElementById('clearLogsBtn').addEventListener('click', () => {
        const feed = document.getElementById('logFeed');
        feed.innerHTML = '<div class="log-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><p>Waiting for events...</p></div>';
        monitorStats = { allowed: 0, denied: 0, warnings: 0, total: 0 };
        updateMonitorStats();
    });

    document.getElementById('toggleLiveBtn').addEventListener('click', () => {
        liveMonitoring = !liveMonitoring;
        const btn = document.getElementById('toggleLiveBtn');
        btn.innerHTML = liveMonitoring
            ? '<span class="live-dot"></span> Live'
            : '<span class="live-dot" style="animation:none;opacity:0.4"></span> Paused';
        showToast(liveMonitoring ? 'Live monitoring resumed' : 'Live monitoring paused', 'info');
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// ============ HELPERS ============
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
