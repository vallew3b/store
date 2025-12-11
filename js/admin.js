// Admin simple: login en el front (demo) y CRUD de productos usando localStorage
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

const loginBox = document.getElementById('loginBox');
const adminPanel = document.getElementById('adminPanel');
const adminLogin = document.getElementById('adminLogin');
const logoutBtn = document.getElementById('logoutBtn');
const adminProducts = document.getElementById('adminProducts');
const productForm = document.getElementById('productForm');

function isAdmin(){ return localStorage.getItem('isAdmin') === '1'; }

function showPanel(){ loginBox.style.display='none'; adminPanel.style.display='block'; renderAdminProducts(); }
function showLogin(){ loginBox.style.display='block'; adminPanel.style.display='none'; }

if (isAdmin()) showPanel(); else showLogin();

adminLogin.addEventListener('submit', e=>{
  e.preventDefault();
  const u = document.getElementById('adminUser').value;
  const p = document.getElementById('adminPass').value;
  if (u === ADMIN_USER && p === ADMIN_PASS){ localStorage.setItem('isAdmin','1'); showPanel(); }
  else alert('Credenciales incorrectas');
});

logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('isAdmin'); showLogin(); });

function loadProducts(){ return JSON.parse(localStorage.getItem('products')||'[]'); }
function saveProducts(list){ localStorage.setItem('products', JSON.stringify(list)); }

function renderAdminProducts(){
  const list = loadProducts();
  adminProducts.innerHTML = '';
  list.forEach(p=>{
    const el = document.createElement('div');
    el.style.display='flex'; el.style.justifyContent='space-between'; el.style.alignItems='center'; el.style.padding='8px 0';
    el.innerHTML = `<div><strong>${p.name}</strong> — $${p.price} — ${p.category}</div>`;
    const actions = document.createElement('div');
    const edit = document.createElement('button'); edit.textContent='Editar'; edit.className='btn'; edit.style.marginRight='8px';
    const del = document.createElement('button'); del.textContent='Eliminar'; del.className='btn';
    edit.addEventListener('click', ()=> fillForm(p));
    del.addEventListener('click', ()=>{ if(confirm('Eliminar producto?')){ deleteProduct(p.id); } });
    actions.appendChild(edit); actions.appendChild(del);
    el.appendChild(actions);
    adminProducts.appendChild(el);
  });
}

function fillForm(p){ document.getElementById('pId').value=p.id; document.getElementById('pName').value=p.name; document.getElementById('pPrice').value=p.price; document.getElementById('pCategory').value=p.category; document.getElementById('pImg').value=p.img||''; document.getElementById('pSizes').value=(p.sizes||[]).join(','); document.getElementById('pColors').value=(p.colors||[]).join(','); }

productForm.addEventListener('submit', e=>{
  e.preventDefault();
  const id = document.getElementById('pId').value;
  const name = document.getElementById('pName').value;
  const price = Number(document.getElementById('pPrice').value)||0;
  const category = document.getElementById('pCategory').value;
  const img = document.getElementById('pImg').value || 'https://images.unsplash.com/photo-1520975682841-5d9fbf2b8f3b?q=80&w=800';
  const sizes = document.getElementById('pSizes').value.split(',').map(s=>s.trim()).filter(Boolean);
  const colors = document.getElementById('pColors').value.split(',').map(s=>s.trim()).filter(Boolean);
  const list = loadProducts();
  if (id){
    const idx = list.findIndex(x=>String(x.id)===String(id));
    if (idx>=0){ list[idx] = {...list[idx],name,price,category,img,sizes,colors}; }
  } else {
    const nid = Date.now(); list.push({id:nid,name,price,category,img,sizes,colors});
  }
  saveProducts(list); renderAdminProducts(); productForm.reset();
});

function deleteProduct(id){ const list=loadProducts().filter(p=>p.id!==id); saveProducts(list); renderAdminProducts(); }
*** End Patch