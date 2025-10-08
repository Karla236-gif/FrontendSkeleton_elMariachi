// Usuarios de demo (sin backend)
const DEMO_USERS = [
  { email: 'ana@example.com',  password: '123456',  name: 'Ana',  role: 'cliente' },
  { email: 'admin@site.com',   password: 'admin01', name: 'Admin', role: 'admin'  },
];

// Helpers de sesión
function setSession(user){ localStorage.setItem('mariachi_user', JSON.stringify(user)); }
function getSession(){ try { return JSON.parse(localStorage.getItem('mariachi_user')) } catch { return null } }
function clearSession(){ localStorage.removeItem('mariachi_user'); }

// Pinta login/logout en la navbar
document.addEventListener('DOMContentLoaded', ()=>{
  const authLink = document.getElementById('authLink');
  if (!authLink) return;

  const user = getSession();
  if (user) {
    authLink.textContent = 'Cerrar sesión';
    authLink.href = '#';
    authLink.addEventListener('click', (e)=>{
      e.preventDefault();
      clearSession();
      window.location.href = 'index.html';
    });
  } else {
    authLink.textContent = 'Iniciar sesión';
    authLink.href = 'B02login.html';
  }
});

// Login (solo si estamos en B02login.html)
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pwd   = document.getElementById('loginPwd').value;
    const msg   = document.getElementById('loginMsg');

    const user = DEMO_USERS.find(u => u.email === email && u.password === pwd);
    if (!user) {
      msg.textContent = 'Credenciales inválidas';
      return;
    }
    setSession({ name:user.name, email:user.email, role:user.role });
    window.location.href = 'index.html';
  });
});
