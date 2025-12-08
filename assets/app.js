// ======================================================
// app.js – Frontend común El Mariachi
// ======================================================
console.log('app.js cargado');

// ------------------------------------------------------
// 0) CONFIG API
// ------------------------------------------------------
window.API_BASE = 'http://localhost:4000';   // 

const API_BASE      = window.API_BASE;
const API_PRODUCTOS = `${API_BASE}/api/productos`;
const API_USUARIOS  = `${API_BASE}/api/usuarios`;
const API_PEDIDOS   = `${API_BASE}/api/pedidos`;
const API_LOGIN     = `${API_USUARIOS}/login`;

// Exponer en window para otras páginas (B04, B11, etc.)
window.API_PRODUCTOS = API_PRODUCTOS;
window.API_USUARIOS  = API_USUARIOS;
window.API_PEDIDOS   = API_PEDIDOS;
window.API_LOGIN     = API_LOGIN;


// Solo para depurar:
console.log('API_BASE      =', API_BASE);
console.log('API_PEDIDOS   =', API_PEDIDOS);
    

// ------------------------------------------------------
// 1) Helpers de sesión
// ------------------------------------------------------
function setSession(user){
  localStorage.setItem('mariachi_user', JSON.stringify(user));
}
function getSession(){
  try { return JSON.parse(localStorage.getItem('mariachi_user')) || null; }
  catch { return null; }
}
function clearSession(){
  localStorage.removeItem('mariachi_user');
}

window.setSession   = setSession;
window.getSession   = getSession;
window.clearSession = clearSession;

// ------------------------------------------------------
// 2) Helpers de carrito
// ------------------------------------------------------
function getCart(){
  try { return JSON.parse(localStorage.getItem('mariachi_cart')) || []; }
  catch { return []; }
}
function setCart(c){
  localStorage.setItem('mariachi_cart', JSON.stringify(c));
}
function addToCart(prod, qty = 1){
  const id     = prod.id || prod._id;
  const nombre = prod.nombre;
  const precio = prod.precio;
  const imagen = prod.imagen || prod.imgUrl || '';

  if (!id){
    console.warn('addToCart: producto sin id/_id:', prod);
    return;
  }

  const cart = getCart();
  const i = cart.findIndex(x => x.id === id);

  if (i >= 0){
    cart[i].cantidad += qty;
  } else {
    cart.push({ id, nombre, precio, imagen, cantidad: qty });
  }
  setCart(cart);
}

window.getCart   = getCart;
window.setCart   = setCart;
window.addToCart = addToCart;

// ------------------------------------------------------
// 3) Link sesión en navbar
// ------------------------------------------------------
(function updateAuthLink(){
  const a = document.getElementById('authLink');
  if (!a) return;

  const user = getSession();
  if (user){
    a.textContent = `Salir (${user.nombre})`;
    a.href = '#';
    a.onclick = (ev) => {
      ev.preventDefault();
      clearSession();
      window.location.reload();
    };
  } else {
    a.textContent = 'Iniciar sesión';
    a.href = 'B02login.html';
  }
})();

// ------------------------------------------------------
// 4) LOGIN (B02)
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

      const data = await res.json().catch(()=>({}));

      if (!res.ok){
        msgEl.textContent = data.error || 'Credenciales inválidas';
        return;
      }

      setSession(data.usuario);

      const rol = data.usuario.role || 'cliente';
      if (rol === 'supervisor' || rol === 'admin'){
        window.location.href = 'B07admin.html';
      } else {
        window.location.href = 'index.html';
      }

    } catch (err) {
      console.error(err);
      msgEl.textContent = 'Error de conexión';
    }
  });
}

// ------------------------------------------------------
// 5) REGISTRO (B01)
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
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ nombre, email, password: pwd })
      });

      const data = await res.json().catch(()=>({}));

      if (!res.ok){
        msgEl.textContent = data.error || 'No se pudo registrar';
        return;
      }

      msgEl.classList.add('text-success');
      msgEl.textContent = 'Cuenta creada ✔';
      window.location.href = 'B02login.html';

    } catch (err) {
      console.error(err);
      msgEl.textContent = 'Error de red';
    }
  });
}

// ------------------------------------------------------
// 6) CATÁLOGO – TU renderProductos con imágenes mapeadas
// ------------------------------------------------------
function renderProductos(productos){
  const cont = document.getElementById('listaProductos');
  if (!cont) return;

  if (!productos.length){
    cont.innerHTML = `<div class="col-12 text-center text-muted py-5">No hay productos.</div>`;
    return;
  }

  const imagenes = {
    // TACOS
    'Taco al Pastor'     : 'assets/ImagenesMariachi/tacos1.jpg',
    'Taco Supremo'       : 'assets/ImagenesMariachi/tacos8.jpg',
    'Taco Tradicional'   : 'assets/ImagenesMariachi/tacos3.jpg',
    'Taco Dorado'        : 'assets/ImagenesMariachi/tacos4.jpeg',
    'Taco Vegetariano'   : 'assets/ImagenesMariachi/tacos11.webp',
    'Taco Fiesta'        : 'assets/ImagenesMariachi/tacos7.jpg',
    'Tacos Mix'          : 'assets/ImagenesMariachi/tacos2.jpg',
    'Tacos Especiales'   : 'assets/ImagenesMariachi/tacos9.jpg',
    'Tacos Premium'      : 'assets/ImagenesMariachi/tacos10.webp',
    'Tacos Gourmet'      : 'assets/ImagenesMariachi/tacos13.jpg',

    // BURRITOS
    'Burrito Especial'   : 'assets/ImagenesMariachi/Burrito1.jpg',
    'Burrito Mexicano'   : 'assets/ImagenesMariachi/burrito2.jpg',
    'Burrito Pollo'      : 'assets/ImagenesMariachi/burrito3.jpg',
    'Burrito Mixto'      : 'assets/ImagenesMariachi/burrito8.jpg',
    'Burrito Power'      : 'assets/ImagenesMariachi/Burrito9.jpg',
    'Burrito XL'         : 'assets/ImagenesMariachi/burrito10.webp',
    'Burrito Supremo'    : 'assets/ImagenesMariachi/burrito11.webp',
    'Burrito Tradicional': 'assets/ImagenesMariachi/burrito20.jpg',

    // COMBOS
    'Combo Familiar'     : 'assets/ImagenesMariachi/combofamiliar.jpg',
    'Combo 2x1'          : 'assets/ImagenesMariachi/combo4.jpeg',
    'Combo Fiesta'       : 'assets/ImagenesMariachi/combo5.jpeg',
    'Combo 7'            : 'assets/ImagenesMariachi/combo7.webp',
    'Combo 12'           : 'assets/ImagenesMariachi/combo12.jpg',
    'Combo 6'            : 'assets/ImagenesMariachi/combo6.webp',
    'Combo 1'            : 'assets/ImagenesMariachi/combo1.jpg',
    'Combo 2A'           : 'assets/ImagenesMariachi/combo2a.jpg',
    'Combo 3'            : 'assets/ImagenesMariachi/combo3.webp'
  };

  const fallback = 'assets/ImagenesMariachi/tacos13.jpg';

  cont.innerHTML = productos.map(p => {
    const imgSrc =
      imagenes[p.nombre] ||
      p.imgUrl ||
      fallback;

    return `
      <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
        <div class="producto-card h-100 shadow-sm">
          <img src="${imgSrc}" class="producto-img" alt="${p.nombre}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title mb-1">${p.nombre}</h5>
            <span class="badge text-bg-secondary mb-2">${p.categoria}</span>
            <p class="fw-bold mb-3">$${Number(p.precio).toLocaleString('es-CL')}</p>
            <a class="btn btn-primary mt-auto"
               href="B06productodetalle.html?id=${p._id}">
               Ver detalle
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function cargarCatalogo(){
  const cont = document.getElementById('listaProductos');
  if (!cont) return;

  try {
    const res = await fetch(API_PRODUCTOS);
    if (!res.ok) throw new Error('Error HTTP');
    const productos = await res.json();
    console.log('Productos cargados:', productos);
    renderProductos(productos);
  } catch (err) {
    console.error(err);
    cont.innerHTML = `<div class="col-12 text-center text-danger py-5">
      Error al cargar el catálogo.
    </div>`;
  }
}

// ------------------------------------------------------
// 7) DETALLE PRODUCTO (B06)
// ------------------------------------------------------
async function cargarDetalleProducto(){
  const bloque = document.getElementById('detalleProducto');
  if (!bloque) return;

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id){
    bloque.innerHTML = `<div class="alert alert-warning">Falta el id.</div>`;
    return;
  }

  try {
    const res = await fetch(`${API_PRODUCTOS}/${id}`);
    if (!res.ok) throw new Error('Error HTTP');
    const p = await res.json();

    const imagenes = {
      'Taco al Pastor'     : 'assets/ImagenesMariachi/tacos1.jpg',
      'Taco Supremo'       : 'assets/ImagenesMariachi/tacos8.jpg',
      'Burrito Especial'   : 'assets/ImagenesMariachi/Burrito1.jpg',
      'Combo Familiar'     : 'assets/ImagenesMariachi/combofamiliar.jpg'
    };
    const fallback = 'assets/ImagenesMariachi/tacos13.jpg';
    const imgSrc   = imagenes[p.nombre] || p.imgUrl || fallback;

    bloque.innerHTML = `
      <div class="card shadow-sm">
        <div class="row g-0">
          <div class="col-md-5">
            <img src="${imgSrc}" class="img-fluid rounded-start">
          </div>
          <div class="col-md-7">
            <div class="card-body">
              <h3>${p.nombre}</h3>
              <p class="text-muted">Categoría: ${p.categoria}</p>
              <p class="fs-4 fw-bold">$${p.precio}</p>
              <button id="btnAddCart" class="btn btn-success">Agregar al carrito</button>
              <div id="detalleMsg" class="small text-muted mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btnAddCart').onclick = () => {
      addToCart({ _id: p._id, nombre: p.nombre, precio: p.precio, imgUrl: imgSrc }, 1);
      document.getElementById('detalleMsg').textContent = 'Agregado al carrito ✔';
    };

  } catch (err) {
    console.error(err);
    bloque.innerHTML = `<div class="alert alert-danger">Error cargando producto.</div>`;
  }
}

// ------------------------------------------------------
// 8) CARGA AUTOMÁTICA
// ------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('listaProductos'))   cargarCatalogo();
  if (document.getElementById('detalleProducto')) cargarDetalleProducto();
});
