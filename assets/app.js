console.log('app.js cargado');

// ====== MOCK DE USUARIOS ======
const DEMO_USERS = [
  { email: 'ana@example.com',  password: '123456',  name: 'Ana',  role: 'cliente' },
  { email: 'admin@site.com',   password: 'admin01', name: 'Admin', role: 'admin' }
];

// helpers sesión
function setSession(user){ localStorage.setItem('mariachi_user', JSON.stringify(user)); }
function getSession(){
  const raw = localStorage.getItem('mariachi_user');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function clearSession(){ localStorage.removeItem('mariachi_user'); }

// login
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

// (opcional) actualizar el botón de sesión en el navbar del index
(function updateAuthLink(){
  const a = document.getElementById('authLink');
  if (!a) return;
  const user = getSession();
  if (user) {
    a.textContent = 'Cerrar sesión';
    a.href = '#';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      location.reload();
    });
  } else {
    a.textContent = 'Iniciar sesión';
    a.href = 'B02login.html';
  }
})();
