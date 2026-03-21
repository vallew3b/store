const SUPABASE_URL = 'https://pyuqebokjhtwyrojwgxd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IUyaOWBuDvTAURD92VCxQQ_AGQN1-pw';
let supabaseClient;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); renderCart(); updateCartHeader(); }

const cartList = document.getElementById('cartList');

async function renderCart(){
  if (!cartList) return;
  const cart = getCart();
  cartList.innerHTML='';
  if (!cart.length) { cartList.innerHTML = '<p>Tu carrito está vacío.</p>'; return; }

  // Consultar stock real de todos los productos en el carrito
  let stockReal = {};
  if (supabaseClient) {
    try {
      const ids = [...new Set(cart.map(item => item.id))];
      const { data, error } = await supabaseClient
        .from('productos')
        .select('id, variantes:producto_variantes(stock, talla)')
        .in('id', ids);
      
      if (!error && data) {
        data.forEach(p => {
          const variantes = p.variantes || [];
          cart.filter(item => item.id === p.id).forEach(item => {
            if (item.size && item.size !== 'N/A') {
              const v = variantes.find(va => va.talla === item.size);
              stockReal[`${item.id}-${item.size}`] = v ? v.stock : 0;
            } else {
              stockReal[item.id] = variantes.reduce((sum, v) => sum + (v.stock || 0), 0);
            }
          });
        });
      }
    } catch (e) { console.error("Error validando stock:", e); }
  }

  cart.forEach(item=>{
    const stockKey = (item.size && item.size !== 'N/A') ? `${item.id}-${item.size}` : item.id;
    const realAvailable = stockReal[stockKey] !== undefined ? stockReal[stockKey] : (item.stock || 0);
    
    // Si la cantidad en carrito supera el stock real, ajustarla automáticamente
    if (item.qty > realAvailable) {
        item.qty = realAvailable;
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    const el = document.createElement('div');
    el.style.display='flex'; el.style.justifyContent='space-between'; el.style.alignItems='center'; el.style.padding='12px 0';
    el.style.borderBottom='1px solid #222';
    el.innerHTML = `
        <div>
            <strong>${item.name}</strong>${item.size?(' / '+item.size):''}${item.color?(' / '+item.color):''} 
            <div style="color: #b6ff3b;">$${item.price} x ${item.qty}</div>
            <div style="font-size: 0.8rem; color: #888;">Disponibles: ${realAvailable}</div>
        </div>`;
    
    const actions = document.createElement('div');
    actions.style.display='flex'; actions.style.gap='5px';
    
    const plus = document.createElement('button'); plus.textContent='+'; plus.className='btn';
    const minus = document.createElement('button'); minus.textContent='-'; minus.className='btn';
    const del = document.createElement('button'); del.textContent='Eliminar'; del.className='btn';
    
    plus.addEventListener('click', ()=>{ 
        if (item.qty >= realAvailable) {
            alert(`Lo sentimos, no hay más stock. Máximo: ${realAvailable}`);
            return;
        }
        item.qty++; 
        saveCart(cart); 
    });
    
    minus.addEventListener('click', ()=>{ if(item.qty>1){ item.qty--; saveCart(cart); } });
    del.addEventListener('click', ()=>{ if(confirm('Eliminar item?')){ const idx = cart.findIndex(i=>i.id===item.id && i.size === item.size); cart.splice(idx,1); saveCart(cart); } });
    
    actions.appendChild(plus); actions.appendChild(minus); actions.appendChild(del);
    el.appendChild(actions);
    cartList.appendChild(el);
  });
}

function updateCartHeader(){ const cart = getCart(); const count = cart.reduce((s,i)=>s+i.qty,0); const btn = document.getElementById('cartBtn'); if(btn) btn.textContent = `Carrito (${count})`; }

// Cargar Supabase y renderizar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { renderCart(); updateCartHeader(); });
} else {
    renderCart(); updateCartHeader();
}