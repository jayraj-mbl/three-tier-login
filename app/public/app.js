const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const employeeRows = document.getElementById('employeeRows');
const tableMessage = document.getElementById('tableMessage');

async function api(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
function showLogin() { dashboardView.classList.add('hidden'); loginView.classList.remove('hidden'); }
function showDashboard(username) {
  loginView.classList.add('hidden'); dashboardView.classList.remove('hidden');
  document.getElementById('welcomeUser').textContent = `Signed in as ${username}`;
}
function addCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = value == null ? '' : String(value);
  row.appendChild(cell);
}
async function loadEmployees() {
  tableMessage.textContent = 'Loading employee records…';
  try {
    const employees = await api('/api/employees');
    employeeRows.replaceChildren();
    employees.forEach(employee => {
      const row = document.createElement('tr');
      [employee.id, employee.employee_code, employee.full_name, employee.email, employee.department, employee.job_title].forEach(value => addCell(row, value));
      employeeRows.appendChild(row);
    });
    document.getElementById('totalCount').textContent = employees.length;
    tableMessage.textContent = employees.length ? '' : 'No employee records found.';
  } catch (error) { tableMessage.textContent = error.message; }
}
loginForm.addEventListener('submit', async event => {
  event.preventDefault(); loginError.textContent = '';
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  try { const result = await api('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) }); showDashboard(result.username); await loadEmployees(); }
  catch (error) { loginError.textContent = error.message; }
});
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try { await api('/api/logout', { method: 'POST', body: '{}' }); } finally { showLogin(); }
});
(async () => {
  try { const user = await api('/api/me'); showDashboard(user.username); await loadEmployees(); }
  catch (_) { showLogin(); }
})();
