function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveOrder(order){ const orders = JSON.parse(localStorage.getItem('orders')||'[]'); orders.push(order); localStorage.setItem('orders', JSON.stringify(orders)); }

const orderSummary = document.getElementById('orderSummary');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutMsg = document.getElementById('checkoutMsg');

function renderOrderSummary(){
  const cart = getCart();
  if (!orderSummary) return;
  if (!cart.length) { orderSummary.innerHTML='<p>Carrito vacío.</p>'; return; }
  let total = 0;
  orderSummary.innerHTML = cart.map(i=>{ total += i.price*i.qty; return `<div style="padding:6px 0"><strong>${i.name}</strong> ${i.size?'/ '+i.size:''} ${i.color?'/ '+i.color:''} — $${i.price} x ${i.qty}</div>`; }).join('') + `<div style="margin-top:8px"><strong>Total: $${total}</strong></div>`;
}

if (checkoutForm){
  checkoutForm.addEventListener('submit', e=>{
    e.preventDefault();
    const cart = getCart();
    if (!cart.length){ alert('Carrito vacío'); return; }
    const order = {
      id: Date.now(),
      customer:{ name:document.getElementById('cName').value, email:document.getElementById('cEmail').value, phone:document.getElementById('cPhone').value, address:document.getElementById('cAddress').value, city:document.getElementById('cCity').value, zip:document.getElementById('cZip').value },
      items: cart,
      created: new Date().toISOString()
    };
    saveOrder(order);
    localStorage.removeItem('cart');
    renderOrderSummary();
    checkoutMsg.innerHTML = '<strong>Pedido realizado. Gracias!</strong>';
  });
}

renderOrderSummary();