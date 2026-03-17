// Configuración de Supabase para Checkout
const SUPABASE_URL = 'https://pyuqebokjhtwyrojwgxd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IUyaOWBuDvTAURD92VCxQQ_AGQN1-pw';
let supabaseClient;

// Mercado Pago Public Key
const MP_PUBLIC_KEY = 'APP_USR-35edbaa8-ee11-4e30-8c9e-a22467145899';
const MP_ACCESS_TOKEN = 'APP_USR-8258188563686951-031712-181827d3316dfaa639ad5b7046863d9d-3272401105';

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Inicializar Mercado Pago
const mp = new MercadoPago(MP_PUBLIC_KEY, { locale: 'es-MX' });

function getCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }

const orderSummary = document.getElementById('orderSummary');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutMsg = document.getElementById('checkoutMsg');

// Cargar datos del usuario si está logueado
function cargarDatosUsuario() {
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    if (usuarioLogueado) {
        if (document.getElementById('cName')) document.getElementById('cName').value = `${usuarioLogueado.nombre} ${usuarioLogueado.apellidos || ''}`.trim();
        if (document.getElementById('cEmail')) document.getElementById('cEmail').value = usuarioLogueado.email || '';
        if (document.getElementById('cPhone')) document.getElementById('cPhone').value = usuarioLogueado.telefono || '';
        if (document.getElementById('cCalle')) document.getElementById('cCalle').value = usuarioLogueado.calle || '';
        if (document.getElementById('cColonia')) document.getElementById('cColonia').value = usuarioLogueado.colonia || '';
        if (document.getElementById('cCiudad')) document.getElementById('cCiudad').value = usuarioLogueado.ciudad || '';
        if (document.getElementById('cEstado')) document.getElementById('cEstado').value = usuarioLogueado.estado || '';
        if (document.getElementById('cCP')) document.getElementById('cCP').value = usuarioLogueado.cp || '';
    }
}

function renderOrderSummary() {
    const cart = getCart();
    if (!orderSummary) return;
    if (!cart.length) { orderSummary.innerHTML = '<p>Carrito vacío.</p>'; return; }
    let total = 0;
    orderSummary.innerHTML = cart.map(i => {
        total += i.price * i.qty;
        return `<div style="padding:6px 0; color: #fff;"><strong>${i.name}</strong> ${i.size ? '/ Talla: ' + i.size : ''} ${i.color ? '/ Color: ' + i.color : ''} — $${i.price} x ${i.qty}</div>`;
    }).join('') + `<div style="margin-top:8px; font-size: 1.2rem; color: #b6ff3b;"><strong>Total: $${total.toFixed(2)}</strong></div>`;
}

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cart = getCart();
        if (!cart.length) { alert('Carrito vacío'); return; }

        const customer = {
            name: document.getElementById('cName').value,
            email: document.getElementById('cEmail').value,
            phone: document.getElementById('cPhone').value,
            calle: document.getElementById('cCalle').value,
            colonia: document.getElementById('cColonia').value,
            ciudad: document.getElementById('cCiudad').value,
            estado: document.getElementById('cEstado').value,
            cp: document.getElementById('cCP').value
        };

        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

        // Si el usuario está logueado, actualizar su dirección en Supabase
        const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
        if (usuarioLogueado && supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('usuarios_web')
                    .update({
                        calle: customer.calle,
                        colonia: customer.colonia,
                        ciudad: customer.ciudad,
                        estado: customer.estado,
                        cp: customer.cp,
                        telefono: customer.phone
                    })
                    .eq('email', usuarioLogueado.email);

                if (!error) {
                    const updatedUser = { ...usuarioLogueado, ...customer, telefono: customer.phone };
                    localStorage.setItem('usuarioLogueado', JSON.stringify(updatedUser));
                }
            } catch (err) { console.error('Error actualizando dirección:', err); }
        }

        let total = 0;
        let itemsDetalle = cart.map(i => {
            total += i.price * i.qty;
            return `- ${i.name} (${i.size || 'N/A'}, ${i.color || 'N/A'}) x${i.qty}: $${(i.price * i.qty).toFixed(2)}`;
        }).join('\n');

        if (paymentMethod === 'mercadopago') {
            checkoutMsg.innerHTML = '<strong style="color: #b6ff3b;">Preparando pago con Mercado Pago...</strong>';
            
            try {
                // Crear preferencia de pago con MP API (Inseguro en frontend, pero solicitado por el contexto)
                const preferenceItems = cart.map(i => ({
                    title: `${i.name} (${i.size})`,
                    unit_price: i.price,
                    quantity: i.qty,
                    currency_id: 'MXN'
                }));

                const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        items: preferenceItems,
                        back_urls: {
                            success: window.location.origin + '/index.html?pago=exitoso',
                            failure: window.location.origin + '/index.html?pago=error',
                            pending: window.location.origin + '/index.html?pago=pendiente'
                        },
                        auto_return: 'approved'
                    })
                });

                const preference = await response.json();
                
                if (preference.init_point) {
                    localStorage.removeItem('cart');
                    window.location.href = preference.init_point;
                } else {
                    throw new Error('No se pudo generar el link de pago');
                }
            } catch (error) {
                console.error('Error MP:', error);
                alert('Error al conectar con Mercado Pago. Intenta de nuevo.');
                checkoutMsg.innerHTML = '';
            }

        } else {
            // WhatsApp
            const mensajeWhats = `Hola, quiero realizar un pedido:\n\n*PRODUCTOS:*\n${itemsDetalle}\n\n*TOTAL:* $${total.toFixed(2)}\n\n*DATOS DE ENVÍO:*\n*Nombre:* ${customer.name}\n*Tel:* ${customer.phone}\n*Dirección:* ${customer.calle}, Col. ${customer.colonia}, ${customer.ciudad}, ${customer.estado}, CP: ${customer.cp}`;
            const whatsappLink = `https://wa.me/+527341439779?text=${encodeURIComponent(mensajeWhats)}`;
            
            localStorage.removeItem('cart');
            checkoutMsg.innerHTML = '<strong style="color: #b6ff3b;">Redirigiendo a WhatsApp...</strong>';
            setTimeout(() => {
                window.open(whatsappLink, '_blank');
                window.location.href = 'index.html';
            }, 1500);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosUsuario();
    renderOrderSummary();
});
