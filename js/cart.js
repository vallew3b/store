function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); renderCart(); updateCartHeader(); }

const cartList = document.getElementById('cartList');

function renderCart(){
  if (!cartList) return;
  const cart = getCart();
  cartList.innerHTML='';
  if (!cart.length) { cartList.innerHTML = '<p>Tu carrito está vacío.</p>'; return; }
  cart.forEach(item=>{
    const el = document.createElement('div');
    el.style.display='flex'; el.style.justifyContent='space-between'; el.style.alignItems='center'; el.style.padding='8px 0';
    el.innerHTML = `<div><strong>${item.name}</strong>${item.size?(' / '+item.size):''}${item.color?(' / '+item.color):''} <div>$${item.price} x ${item.qty}</div></div>`;
    const actions = document.createElement('div');
    const plus = document.createElement('button'); plus.textContent='+'; plus.className='btn';
    const minus = document.createElement('button'); minus.textContent='-'; minus.className='btn';
    const del = document.createElement('button'); del.textContent='Eliminar'; del.className='btn';
    plus.addEventListener('click', ()=>{ item.qty++; saveCart(cart); });
    minus.addEventListener('click', ()=>{ if(item.qty>1){ item.qty--; saveCart(cart); } });
    del.addEventListener('click', ()=>{ if(confirm('Eliminar item?')){ const idx = cart.findIndex(i=>i.id===item.id); cart.splice(idx,1); saveCart(cart); } });
    actions.appendChild(plus); actions.appendChild(minus); actions.appendChild(del);
    el.appendChild(actions);
    cartList.appendChild(el);
  });
}

function updateCartHeader(){ const cart = getCart(); const count = cart.reduce((s,i)=>s+i.qty,0); const btn = document.getElementById('cartBtn'); if(btn) btn.textContent = `Carrito (${count})`; }

renderCart(); updateCartHeader();