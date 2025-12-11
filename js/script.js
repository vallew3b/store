// Gestión de productos y carrito con persistencia local
const defaultProducts = [
  //{id:1,name:'Canguro City',price:45,category:'sueteres',img:'https://images.unsplash.com/photo-1520975682841-5d9fbf2b8f3b?q=80&w=800',sizes:['S','M','L'],colors:['Negro','Gris']},
  {id:2,name:'Camiseta Bold',price:28,category:'playeras',img:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',sizes:['S','M','L'],colors:['Blanco','Negro']},
  {id:3,name:'Gorra Snapback',price:22,category:'gorras',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',sizes:[],colors:['Negro']},
  {id:4,name:'Pantalón Cargo',price:59,category:'pantalones',img:'https://images.unsplash.com/photo-1530845640850-9b5f3b4c9a45?q=80&w=800',sizes:['M','L'],colors:['Kaki','Negro']},
  {id:5,name:'Sudadera Oversize',price:65,category:'sueteres',img:'https://images.unsplash.com/photo-1520975682841-5d9fbf2b8f3b?q=80&w=800',sizes:['M','L','XL'],colors:['Negro','Azul']}
,
    {
        id: 1,
        name: "Bandolera Urban",
        category: "bandoleras",
        image: "img/D:\CARPETAS MORA\urban-store\FOTOS\BANDOLERAS\BANDOLERA NIKE NEGRA.jpg", // <--- AQUÍ ES DONDE CAMBIAS LA RUTA
        price: 250
    },
    // ... más productos
];



// Mapeo de bandoleras a carpeta local FOTOS/BANDOLERAS
const bandolerasCloudinary = {
  'BANDOLERA NIKE NEGRA': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA NIKE NEGRA.jpg',
    price: 28,
    colors: ['Negro']
  },
  'BANDOLERA NIKE AZUL CHICA': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA NIKE AZUL CHICA.jpg',
    price: 28,
    colors: ['Azul']
  },
  'BANDOLERA NIKE AZULL CHICA': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA NIKE AZULL CHICA.jpg',
    price: 28,
    colors: ['Azul']
  },
  'BANDOLERA ADIDAS BLANCA': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA ADIDAS BLANCA.jpg',
    price: 30,
    colors: ['Blanca']
  },
  'BANDOLERA ADIDAS NEGRA': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA ADIDAS NEGRA.jpg',
    price: 30,
    colors: ['Negra']
  },
  'BANDOLERA AMARILLA FILA': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA AMARILLA FILA.jpg',
    price: 25,
    colors: ['Amarilla']
  },
  'BANDOLERA AZUL FILA': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA AZUL FILA.jpg',
    price: 25,
    colors: ['Azul']
  },
  'BANDOLERA COUCH NEGRA': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA COUCH NEGRA.jpg',
    price: 20,
    colors: ['Negra']
  },
  'BANDOLERA GUCCI GRIS': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA GUCCI GRIS.jpg',
    price: 120,
    colors: ['Gris']
  },
  'BANDOLERA GUCCI NEGRA': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA GUCCI NEGRA.jpg',
    price: 120,
    colors: ['Negra']
  },
  'BANDOLERA LV CAFE': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA LV CAFE.jpg',
    price: 150,
    colors: ['Café']
  },
  'BANDOLERA NEGRA JORDAN': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA NEGRA JORDAN.jpg',
    price: 35,
    colors: ['Negra']
  },
  'BANDOLERA NIKE NEGRA ESTRELLAS': {
    img: 'FOTOS/BANDOLERAS/BANDOLERA NIKE NEGRA ESTRELLAS.jpg',
    price: 28,
    colors: ['Negra']
  }
};

// Archivos de bandoleras (nombres simplificados)
const bandolerasFiles = [
  'BANDOLERA NIKE NEGRA',
  'BANDOLERA NIKE AZUL CHICA',
  'BANDOLERA NIKE AZULL CHICA',
  'BANDOLERA ADIDAS BLANCA',
  'BANDOLERA ADIDAS NEGRA',
  'BANDOLERA AMARILLA FILA',
  'BANDOLERA AZUL FILA',
  'BANDOLERA COUCH NEGRA',
  'BANDOLERA GUCCI GRIS',
  'BANDOLERA GUCCI NEGRA',
  'BANDOLERA LV CAFE',
  'BANDOLERA NEGRA JORDAN',
  'BANDOLERA NIKE NEGRA ESTRELLAS'
];

// Generar productos para bandoleras a partir del mapeo de Cloudinary
function generateBandoleras(){
  const mapPrice = { 'ADIDAS':30, 'NIKE':28, 'GUCCI':120, 'LV':150, 'JORDAN':35, 'FILA':25, 'COUCH':20 };
  return bandolerasFiles.map((name,idx)=>{
    const data = bandolerasCloudinary[name];
    if (data) {
      // usar datos de Cloudinary si existen
      return { 
        id: 1000 + idx, 
        name, 
        price: data.price, 
        category:'bandoleras', 
        img: data.img, 
        sizes: [], 
        colors: data.colors || ['Negro','Blanco']
      };
    } else {
      // fallback: generar desde nombre
      const nameParts = name.split(' ');
      const brand = nameParts[0] ? nameParts[0].toUpperCase() : '';
      const price = mapPrice[brand] || 35;
      return { 
        id: 1000 + idx, 
        name, 
        price, 
        category:'bandoleras', 
        img: '', // vacío hasta que proporcionemos URL de Cloudinary
        sizes: [], 
        colors: ['Negro','Blanco']
      };
    }
  });
}

function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

function loadProducts(){
  const raw = localStorage.getItem('products');
  if (!raw){ localStorage.setItem('products', JSON.stringify(defaultProducts)); return defaultProducts; }
  try{ return JSON.parse(raw); }catch(e){ localStorage.setItem('products', JSON.stringify(defaultProducts)); return defaultProducts; }
}

function saveProducts(list){ localStorage.setItem('products', JSON.stringify(list)); }

let products = loadProducts();

const grid = document.getElementById('productGrid');
const cartBtn = document.getElementById('cartBtn');
const cartToast = document.getElementById('cartToast');

function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveCart(c){ 
  try { 
    localStorage.setItem('cart', JSON.stringify(c)); 
    updateCartCount(); 
  } catch(e) { 
    console.error('[saveCart] Error guardando carrito:', e); 
  } 
}

function updateCartCount(){ const c = getCart(); const count = c.reduce((s,i)=>s+i.qty,0); if (cartBtn) cartBtn.textContent = `Carrito (${count})`; }

function renderProducts(filter='all'){
  if (!grid) return;
  grid.innerHTML = '';
  products = loadProducts();
  // añadir bandoleras generadas si estamos en esa categoría y no existen
  if (filter === 'bandoleras'){
    const existing = products.filter(p=>p.category==='bandoleras');
    if (!existing.length){ products = products.concat(generateBandoleras()); saveProducts(products); }
  }
  const list = filter === 'all' ? products : products.filter(p=>p.category === filter);
  list.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    const sizesHTML = p.sizes && p.sizes.length ? `<select class="size-select">${p.sizes.map(s=>`<option value="${s}">${s}</option>`).join('')}</select>` : '';
    const colorsHTML = p.colors && p.colors.length ? `<select class="color-select">${p.colors.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>` : '';
    // usar la imagen directamente si existe
    const imgSrc = p.img && p.img.length > 0 ? p.img : 'https://via.placeholder.com/220x220?text=Imagen+no+disponible';
    card.innerHTML = `
      <img src="${imgSrc}" alt="${p.name}" style="width:100%;height:220px;object-fit:cover" />
      <div class="card-body">
        <h4 class="card-title">${p.name}</h4>
        <div class="card-price">$${p.price}</div>
        <div class="card-actions">
          <div style="display:flex;gap:6px;align-items:center">${sizesHTML}${colorsHTML}</div>
          <button class="btn add-btn">Agregar</button>
        </div>
      </div>
    `;
    // abrir modal al hacer click en imagen o título (si existe modal)
    const imgEl = card.querySelector('img');
    const titleEl = card.querySelector('.card-title');
    // solo abrir modal si está disponible (para bandoleras con Cloudinary)
    if (imgEl && document.getElementById('productModal')) {
      imgEl.addEventListener('click', (e)=> { if (e.isTrusted) openProductModal(p); });
    }
    if (titleEl && document.getElementById('productModal')) {
      titleEl.addEventListener('click', (e)=> { if (e.isTrusted) openProductModal(p); });
    }
    const btn = card.querySelector('.add-btn');
    btn.addEventListener('click', ()=>{
      const sizeSel = card.querySelector('.size-select');
      const colorSel = card.querySelector('.color-select');
      const size = sizeSel ? sizeSel.value : null;
      const color = colorSel ? colorSel.value : null;
      addToCart(p, size, color);
    });
    grid.appendChild(card);
  });
}

// Modal de producto (funciones)
function openProductModal(p){
  const modal = document.getElementById('productModal');
  if (!modal) return;
  document.getElementById('modalImg').src = p.img;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalPrice').textContent = `$${p.price}`;
  document.getElementById('modalDesc').textContent = (p.description || 'Bandolera urbana.');
  const options = document.getElementById('modalOptions');
  options.innerHTML = '';
  if (p.sizes && p.sizes.length){
    const s = document.createElement('select'); s.className='size-select'; s.innerHTML = p.sizes.map(x=>`<option value="${x}">${x}</option>`).join(''); options.appendChild(s);
  }
  if (p.colors && p.colors.length){
    const c = document.createElement('select'); c.className='color-select'; c.innerHTML = p.colors.map(x=>`<option value="${x}">${x}</option>`).join(''); options.appendChild(c);
  }
  document.getElementById('modalQty').value = 1;
  modal.classList.remove('hidden');
  // asignar acción agregar
  const modalAdd = document.getElementById('modalAdd');
  modalAdd.onclick = ()=>{
    const sizeSel = modal.querySelector('.size-select');
    const colorSel = modal.querySelector('.color-select');
    const qty = Number(document.getElementById('modalQty').value) || 1;
    for(let i=0;i<qty;i++) addToCart(p, sizeSel?sizeSel.value:null, colorSel?colorSel.value:null);
    modal.classList.add('hidden');
  };
}

// cerrar modal
const modalCloseBtn = document.getElementById('modalClose');
if (modalCloseBtn) modalCloseBtn.addEventListener('click', ()=> document.getElementById('productModal').classList.add('hidden'));

function addToCart(product, size=null, color=null){
  const cart = getCart();
  // asegurar que product tenga un id válido
  if (!product || !product.id) { console.error('[addToCart] producto sin ID válido:', product); return; }
  const exists = cart.find(i=>i.productId===product.id && i.size===size && i.color===color);
  if (exists) { 
    exists.qty += 1; 
  } else { 
    cart.push({
      id: Date.now() + Math.random(), // id único para el item del carrito
      productId: product.id, 
      name: product.name, 
      price: product.price, 
      size, 
      color, 
      qty: 1
    });
  }
  saveCart(cart);
  if (cartToast) { cartToast.classList.remove('hidden'); setTimeout(()=> cartToast.classList.add('hidden'),1200); }
}

// Newsletter simple
const newsForm = document.getElementById('newsForm');
if (newsForm) newsForm.addEventListener('submit', e=>{e.preventDefault(); alert('Gracias por suscribirte!'); newsForm.reset();});

// Contact form baseline
const contactForm = document.querySelector('.contact-form');
if (contactForm) contactForm.addEventListener('submit', e=>{e.preventDefault(); alert('Mensaje enviado. Te responderemos pronto.'); contactForm.reset();});

// Determinar filtro inicial (desde data-filter en body o por nombre de archivo)
const initialFilter = document.body && document.body.dataset && document.body.dataset.filter || (() => {
  const file = location.pathname.split('/').pop() || 'index.html';
  if (file === '' || file === 'index.html') return 'all';
  const map = { 'playeras.html':'playeras', 'sueteres.html':'sueteres', 'pants.html':'pants', 'pantalones.html':'pantalones', 'gorras.html':'gorras', 'bandoleras.html':'bandoleras' };
  return map[file] || 'all';
})();

// Debug: registrar filtro inicial y ruta para diagnosticar navegación incorrecta
// console.log('[script] pathname=', location.pathname, ' initialFilter=', initialFilter);

// Marcar enlace activo en la barra de categorías si existe
const catLinks = document.querySelectorAll('.category-btn');
if (catLinks && catLinks.length) {
  catLinks.forEach(a=>{
    if (a.getAttribute('data-cat') === initialFilter) a.classList.add('active');
    else a.classList.remove('active');
  });
}

// Render inicial y contar carrito
renderProducts(initialFilter);
updateCartCount();

// Asegurar modal oculto al cargar (protección frente a aperturas automáticas)
document.addEventListener('DOMContentLoaded', ()=>{
  const pm = document.getElementById('productModal');
  if (pm){
    pm.classList.add('hidden');
    // console.log('[script] productModal forced hidden on DOMContentLoaded');
  }
});