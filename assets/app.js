// ====== MOCK DE USUARIOS (para demo sin API) ======
const DEMO_USERS = [
  { email: 'ana@example.com',  password: '123456',  name: 'Ana',  role: 'cliente' },
  { email: 'admin@site.com',   password: 'admin01', name: 'Admin', role: 'admin'  },
];

// helpers de sesión
function setSession(user) {
  localStorage.setItem('mariachi_user', JSON.stringify(user));
}
function getSession() {
  const raw = localStorage.getItem('mariachi_user');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function clearSession() {
  localStorage.removeItem('mariachi_user');
}

// pinta “sesión” en el index (si quieres)
(function updateNavbarSessionBadge(){
  const user = getSession();
  // Ejemplo: podrías cambiar el texto del botón Login/Logout según user
  // (deja esto opcional si aún no quieres tocar el HTML)
})();

// login (cuando estás en B02login.html)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pwd   = document.getElementById('loginPwd').value;
    const msgEl = document.getElementById('loginMsg');

    const user = DEMO_USERS.find(u => u.email === email && u.password === pwd);
    if (!user) {
      msgEl.textContent = 'Credenciales inválidas';
      return;
    }
    setSession({ name:user.name, email:user.email, role:user.role });
    window.location.href = 'index.html';
  });
}
