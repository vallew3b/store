const products = [
  {id:1,name:'Canguro City',price:'$45',category:'sueteres',img:'https://images.unsplash.com/photo-1520975682841-5d9fbf2b8f3b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3b0d54a1c3f2b2b8f58f8b6a7d9b9c2a'},
  {id:2,name:'Camiseta Bold',price:'$28',category:'playeras',img:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=8f3a3f708af7d8a2fb9ae8d3b2f5a4e7'},
  {id:3,name:'Gorra Snapback',price:'$22',category:'gorras',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2b8f4b3a3a3b4c7d8e9f0a1b2c3d4e5f'},
  {id:4,name:'Pantalón Cargo',price:'$59',category:'pantalones',img:'https://images.unsplash.com/photo-1530845640850-9b5f3b4c9a45?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d'},
  {id:5,name:'Sudadera Oversize',price:'$65',category:'sueteres',img:'https://images.unsplash.com/photo-1520975682841-5d9fbf2b8f3b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3b0d54a1c3f2b2b8f58f8b6a7d9b9c2a'},
  {id:6,name:'Bandolera Urbana',price:'$18',category:'bandoleras',img:'https://images.unsplash.com/photo-1519741493181-3a6b6e0a4bd0?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d'}
];

const grid = document.getElementById('productGrid');
const cartBtn = document.getElementById('cartBtn');
const cartToast = document.getElementById('cartToast');
let cartCount = 0;

function renderProducts(filter='all'){
  grid.innerHTML = '';
  const list = filter === 'all' ? products : products.filter(p=>p.category === filter);
  list.forEach(p=>{
    const card = document.createElement('div');card.className='card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" />
      <div class="card-body">
        <h4 class="card-title">${p.name}</h4>
        <div class="card-price">${p.price}</div>
        <div class="card-actions">
          <button class="btn add-btn">Agregar</button>
          <small>Stock limitado</small>
        </div>
      </div>
    `;
    const btn = card.querySelector('.add-btn');
    btn.addEventListener('click', ()=> addToCart(p));
    grid.appendChild(card);
  });
}

function addToCart(product){
  cartCount++;
  cartBtn.textContent = `Carrito (${cartCount})`;
  cartToast.classList.remove('hidden');
  setTimeout(()=> cartToast.classList.add('hidden'),1200);
}

// Newsletter simple
const newsForm = document.getElementById('newsForm');
newsForm.addEventListener('submit', e=>{e.preventDefault(); alert('Gracias por suscribirte!'); newsForm.reset();});

// Contact form baseline
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', e=>{e.preventDefault(); alert('Mensaje enviado. Te responderemos pronto.'); contactForm.reset();});

// Determinar filtro inicial (desde data-filter en body o por nombre de archivo)
const initialFilter = document.body.dataset.filter || (() => {
  const file = location.pathname.split('/').pop() || 'index.html';
  if (file === '' || file === 'index.html') return 'all';
  const map = { 'playeras.html':'playeras', 'sueteres.html':'sueteres', 'pants.html':'pants', 'pantalones.html':'pantalones', 'gorras.html':'gorras', 'bandoleras.html':'bandoleras' };
  return map[file] || 'all';
})();

// Marcar enlace activo en la barra de categorías si existe
const catLinks = document.querySelectorAll('.category-btn');
if (catLinks && catLinks.length) {
  catLinks.forEach(a=>{
    if (a.getAttribute('data-cat') === initialFilter) a.classList.add('active');
    else a.classList.remove('active');
  });
}

// Render inicial con filtro detectado
renderProducts(initialFilter);