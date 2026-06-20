// Empty by default — same-origin relative '/api' (works with the Vite dev proxy, or when
// frontend+backend are served from the same domain). Set VITE_API_URL to the backend's full
// origin (e.g. https://airde-backend.onrender.com) when the frontend is deployed separately.
export const API_ORIGIN = import.meta.env.VITE_API_URL || '';
const BASE = `${API_ORIGIN}/api`;

function getToken() {
  return localStorage.getItem('airde_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// Auth
export const authApi = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request('/auth/me'),
};

// Assets
export const assetsApi = {
  list: () => request('/assets'),
  get: (id) => request(`/assets/${id}`),
  getFull: (id) => request(`/assets/${id}/full`),
  create: (data) => request('/assets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/assets/${id}`, { method: 'DELETE' }),
};

// Risks
export const risksApi = {
  list: () => request('/risks'),
  get: (id) => request(`/risks/${id}`),
  create: (data) => request('/risks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/risks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/risks/${id}`, { method: 'DELETE' }),
};

// Actions
export const actionsApi = {
  list: () => request('/actions'),
  get: (id) => request(`/actions/${id}`),
  create: (data) => request('/actions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/actions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/actions/${id}`, { method: 'DELETE' }),
};

// Users (admin only)
export const usersApi = {
  list: () => request('/users'),
  get: (id) => request(`/users/${id}`),
  create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

// Criticality (05_Criticality)
export const criticalityApi = {
  list: () => request('/criticality'),
  get: (assetId) => request(`/criticality/${assetId}`),
  create: (data) => request('/criticality', { method: 'POST', body: JSON.stringify(data) }),
  update: (assetId, data) => request(`/criticality/${assetId}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (assetId) => request(`/criticality/${assetId}`, { method: 'DELETE' }),
};

// Inspections (06_Inspection)
export const inspectionsApi = {
  list: () => request('/inspections'),
  get: (id) => request(`/inspections/${id}`),
  create: (data) => request('/inspections', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/inspections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/inspections/${id}`, { method: 'DELETE' }),
};

// DFT readings (07_DFT)
export const dftApi = {
  list: () => request('/dft'),
  get: (id) => request(`/dft/${id}`),
  create: (data) => request('/dft', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/dft/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/dft/${id}`, { method: 'DELETE' }),
};

// UT readings (08_UT)
export const utApi = {
  list: () => request('/ut'),
  get: (id) => request(`/ut/${id}`),
  create: (data) => request('/ut', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/ut/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/ut/${id}`, { method: 'DELETE' }),
};

// Visual inspections (09_Visual)
export const visualApi = {
  list: () => request('/visual'),
  get: (id) => request(`/visual/${id}`),
  create: (data) => request('/visual', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/visual/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/visual/${id}`, { method: 'DELETE' }),
};

// Photos (10_Photo) — multipart upload
export const photosApi = {
  list: () => request('/photos'),
  get: (id) => request(`/photos/${id}`),
  create: (formData) => fetch(`${BASE}/photos`, { method: 'POST', headers: authHeaders(), body: formData })
    .then(async res => { const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`); return data; }),
  update: (id, formData) => fetch(`${BASE}/photos/${id}`, { method: 'PUT', headers: authHeaders(), body: formData })
    .then(async res => { const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`); return data; }),
  remove: (id) => request(`/photos/${id}`, { method: 'DELETE' }),
};

// Findings (12_Findings)
export const findingsApi = {
  list: () => request('/findings'),
  get: (code) => request(`/findings/${code}`),
  create: (data) => request('/findings', { method: 'POST', body: JSON.stringify(data) }),
  update: (code, data) => request(`/findings/${code}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (code) => request(`/findings/${code}`, { method: 'DELETE' }),
};

// Maintenance Action Plan (19_Maintenance_Action_Plan)
export const maintenancePlanApi = {
  list: () => request('/maintenance-plan'),
  get: (id) => request(`/maintenance-plan/${id}`),
  create: (data) => request('/maintenance-plan', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/maintenance-plan/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/maintenance-plan/${id}`, { method: 'DELETE' }),
};

// Work Orders (20_Work_Order)
export const workOrdersApi = {
  list: () => request('/work-orders'),
  get: (woNo) => request(`/work-orders/${woNo}`),
  create: (data) => request('/work-orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (woNo, data) => request(`/work-orders/${woNo}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (woNo) => request(`/work-orders/${woNo}`, { method: 'DELETE' }),
};

// Maintenance Strategy reference (18_Maintenance_Strategy)
export const maintenanceStrategyApi = {
  list: () => request('/maintenance-strategy'),
  create: (data) => request('/maintenance-strategy', { method: 'POST', body: JSON.stringify(data) }),
  update: (strategy, data) => request(`/maintenance-strategy/${strategy}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (strategy) => request(`/maintenance-strategy/${strategy}`, { method: 'DELETE' }),
};

// Inspection teams — source of truth for the "Inspector" dropdown on Inspection
export const teamsApi = {
  list: () => request('/teams'),
  create: (data) => request('/teams', { method: 'POST', body: JSON.stringify(data) }),
  update: (name, data) => request(`/teams/${name}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (name) => request(`/teams/${name}`, { method: 'DELETE' }),
};

// Engine config / AHI weights (99_Config)
export const configApi = {
  list: () => request('/config'),
  update: (param, data) => request(`/config/${param}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Calculation engine
export const engineApi = {
  recalculate: () => request('/engine/recalculate', { method: 'POST' }),
};

// Statistics / dashboard
export const statsApi = {
  kpi: () => request('/stats/kpi'),
  trend: () => request('/stats/trend'),
  analytics: () => request('/stats/analytics'),
  overview: () => request('/stats/overview'),
  lastUpdate: () => request('/stats/last-update'),
};

// Hierarchy (04_Hierarchy) — mostly derived from assets (read-only); Segment is the one
// manually-assigned field native to this sheet, editable below.
export const hierarchyApi = {
  list: () => request('/hierarchy'),
  updateSegment: (assetId, segment) => request(`/hierarchy/${assetId}`, { method: 'PUT', body: JSON.stringify({ segment }) }),
};

// Trend snapshots (16_Trend)
export const trendApi = {
  list: () => request('/trend'),
  create: (data) => request('/trend', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/trend/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/trend/${id}`, { method: 'DELETE' }),
};

// Report sections (21_Report)
export const reportApi = {
  list: () => request('/report'),
  create: (data) => request('/report', { method: 'POST', body: JSON.stringify(data) }),
  update: (section, data) => request(`/report/${section}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (section) => request(`/report/${section}`, { method: 'DELETE' }),
};

// Lookup reference (98_Lookup)
export const lookupApi = {
  list: () => request('/lookup'),
  create: (data) => request('/lookup', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/lookup/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/lookup/${id}`, { method: 'DELETE' }),
};

// Formula map reference (22_Formula_Map)
export const formulaMapApi = {
  list: () => request('/formula-map'),
  create: (data) => request('/formula-map', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/formula-map/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/formula-map/${id}`, { method: 'DELETE' }),
};
