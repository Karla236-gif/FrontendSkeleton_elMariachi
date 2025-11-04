// ======================================================
// app.js – Frontend común El Mariachi
// ======================================================
console.log('app.js cargado');

// ------------------------------------------------------
// 0) CONFIG API (expuesto en window para otras páginas)
// ------------------------------------------------------
window.API_BASE = window.API_BASE || 'http://localhost:3000';
const API_BASE      = window.API_BASE;                 // <- usa SIEMPRE esta
const API_PRODUCTOS = `${API_BASE}/api/productos`;
const API_USUARIOS  = `${API_BASE}/api/usuarios`;
const API_LOGIN     = `${API_USUARIOS}/login`;

// (opcional) exporto por si algún HTML quiere usarlos directamente
window.API_PRODUCTOS = API_PRODUCTOS;
window.API_USUARIOS  = API_USUARIOS;
window.API_LOGIN     = API_LOGIN;

// ------------------------------------------------------
// 1) Helpers de sesión
// ------------------------------------------------------
function setSession(user){ localStorage.setItem('mariachi_user', JSON.stringify(user)); }
function getSession(){
  try { return JSON.parse(localStorage.getItem('mariachi_user')) || null; }
  catch { return null; }
}
function clearSession(){ localStorage.removeItem('mariachi_user'); }

// ------------------------------------------------------
// 2) Helpers de carrito (usados por B04/B06/B11)
// ------------------------------------------------------
function getCart(){
  try { return JSON.parse(localStorage.getItem('mariachi_cart')) || []; }
  catch { return []; }
}
function setCart(c){ localStorage.setItem('mariachi_cart', JSON.stringify(c)); }
function addToCart({_id, nombre, precio}, qty = 1){
  const cart = getCart();
  const i = cart.findIndex(x => x._id === _id);
  if (i >= 0) cart[i].qty += qty;
  else cart.push({ _id, nombre, precio, qty });
  setCart(cart);
}

// ------------------------------------------------------
// 3) Link de sesión en navbar (si existe #authLink)
// ------------------------------------------------------
(function updateAuthLink(){
  const a = document.getElementById('authLink');
  if (!a) return;
  const user = getSession();
  if (user){
    a.textContent = `Salir (${user.nombre || user.name || 'usuario'})`;
    a.href = '#';
    a.onclick = (ev) => {
      ev.preventDefault();
      clearSession();
      window.location.reload();
    };
  }else{
    a.textContent = 'Iniciar sesión';
    a.href = 'B02login.html';
  }
})();

// ------------------------------------------------------
// 4) LOGIN (B02) -> usa la API
// ------------------------------------------------------
const loginForm = document.getElementById('loginForm');
if (loginForm){
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pwd   = document.getElementById('loginPwd').value;
    const msgEl = document.getElementById('loginMsg');

    msgEl.textContent = 'Validando…';

    try {
      const res = await fetch(API_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd })
      });

      if (!res.ok) {
        const err = await res.json().catch(()=>({msg:'Error'}));
        msgEl.textContent = err.msg || 'Credenciales inválidas';
        return;
      }

      const user = await res.json(); // {_id,nombre,email,role}
      setSession(user);
      window.location.href = 'index.html';
    } catch (err) {
      console.error(err);
      msgEl.textContent = 'No se pudo conectar con el servidor';
    }
  });
}

// ------------------------------------------------------
// 5) REGISTRO (B01) -> usa la API
// ------------------------------------------------------
const registerForm = document.getElementById('registerForm');
if (registerForm){
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('regNombre').value.trim();
    const email  = document.getElementById('regEmail').value.trim().toLowerCase();
    const pwd    = document.getElementById('regPwd').value;
    const msgEl  = document.getElementById('registerMsg');

    msgEl.textContent = 'Creando cuenta…';

    try {
      const res = await fetch(`${API_USUARIOS}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password: pwd })
      });

      const data = await res.json().catch(()=>({}));
      if (!res.ok) {
        msgEl.textContent = data.msg || 'No se pudo registrar';
        return;
      }

      setSession(data); // {_id, nombre, email, role}
      msgEl.classList.add('text-success');
      msgEl.textContent = 'Cuenta creada ✅';
      window.location.href = 'index.html';
    } catch (err) {
      console.error(err);
      msgEl.textContent = 'Error de red';
    }
  });
}

// ------------------------------------------------------
// 6) CATÁLOGO (B04/B05)
// ------------------------------------------------------
function renderProductos(productos){
  const cont = document.getElementById('listaProductos');
  if (!cont) return;
  if (!Array.isArray(productos) || productos.length === 0){
    cont.innerHTML = `<div class="col-12 text-center text-muted py-5">No hay productos para mostrar.</div>`;
    return;
  }
  cont.innerHTML = productos.map(p => `
    <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
      <div class="card h-100 shadow-sm">
        <img src="${p.imgUrl || 'assets/ImagenesMariachi/placeholder.jpg'}" class="card-img-top" alt="${p.nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${p.nombre}</h5>
          <span class="badge text-bg-secondary mb-2">${p.categoria}</span>
          <p class="fw-bold mb-3">$${Number(p.precio).toLocaleString('es-CL')}</p>
          <a class="btn btn-primary mt-auto" href="B06productodetalle.html?id=${p._id}">Ver detalle</a>
        </div>
      </div>
    </div>
  `).join('');
}

async function cargarCatalogo(params = {}){
  const { q, cat, min, max } = params;
  const url = new URL(API_PRODUCTOS);
  if (q)   url.searchParams.set('q', q);
  if (cat) url.searchParams.set('cat', cat);
  if (min != null && min !== '') url.searchParams.set('min', min);
  if (max != null && max !== '') url.searchParams.set('max', max);

  const estado = document.getElementById('estadoCatalogo');
  try {
    if (estado) estado.textContent = 'Cargando...';
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Respuesta no OK del servidor');
    const datos = await res.json();
    renderProductos(datos);
    if (estado) estado.textContent = '';
  } catch (err) {
    console.error('Error cargando productos:', err);
    const cont = document.getElementById('listaProductos');
    if (cont) cont.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          No pudimos cargar el catálogo. Verifica que el backend esté activo en <code>${API_BASE}</code>.
        </div>
      </div>`;
    if (estado) estado.textContent = '';
  }
}

const formFiltro = document.getElementById('formFiltro');
if (formFiltro){
  formFiltro.addEventListener('submit', (e) => {
    e.preventDefault();
    const q   = document.getElementById('fTexto')?.value.trim();
    const cat = document.getElementById('fCategoria')?.value;
    const min = document.getElementById('fMin')?.value;
    const max = document.getElementById('fMax')?.value;
    cargarCatalogo({ q, cat, min, max });
  });
}

// ------------------------------------------------------
// 7) DETALLE (B06) + botón "Agregar al carrito"
// ------------------------------------------------------
async function cargarDetalleProducto(){
  const bloque = document.getElementById('detalleProducto');
  if (!bloque) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id){
    bloque.innerHTML = `<div class="alert alert-warning">Falta el parámetro <code>id</code>.</div>`;
    return;
  }

  try {
    const res = await fetch(`${API_PRODUCTOS}/${id}`);
    if (!res.ok) throw new Error('No encontrado');
    const p = await res.json();

    // Render con botón que añade al carrito
    bloque.innerHTML = `
      <div class="card shadow-sm">
        <div class="row g-0">
          <div class="col-md-5">
            <img src="${p.imgUrl || 'assets/ImagenesMariachi/placeholder.jpg'}" class="img-fluid rounded-start" alt="${p.nombre}">
          </div>
          <div class="col-md-7">
            <div class="card-body">
              <h3 class="card-title">${p.nombre}</h3>
              <p class="text-muted mb-2">Categoría: <strong>${p.categoria}</strong></p>
              <p class="fs-4 fw-bold">$${Number(p.precio).toLocaleString('es-CL')}</p>
              <button id="btnAddCart" class="btn btn-success">Agregar al carrito</button>
              <div id="detalleMsg" class="small text-muted mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Click para agregar al carrito (qty=1)
    const btn = document.getElementById('btnAddCart');
    btn?.addEventListener('click', () => {
      addToCart({ _id: p._id, nombre: p.nombre, precio: p.precio }, 1);
      const m = document.getElementById('detalleMsg');
      if (m) m.textContent = 'Producto agregado al carrito ✅';
    });

  } catch (err) {
    console.error(err);
    bloque.innerHTML = `<div class="alert alert-danger">No se pudo cargar el producto.</div>`;
  }
}

// ------------------------------------------------------
// 8) Carga automática por página
// ------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('listaProductos'))  cargarCatalogo();
  if (document.getElementById('detalleProducto')) cargarDetalleProducto();
});
