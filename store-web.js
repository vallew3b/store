// Configuración de Supabase para la tienda web
// Este archivo conecta la página web con la misma base de datos del inventario
// IMPORTANTE: Incluir este script DESPUÉS de cargar Supabase desde CDN:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://pyuqebokjhtwyrojwgxd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IUyaOWBuDvTAURD92VCxQQ_AGQN1-pw';

// Inicializar cliente de Supabase
// El CDN de Supabase expone supabase como variable global con createClient
let supabaseClient;

// Función para inicializar Supabase cuando esté disponible
function inicializarSupabase() {
    try {
        // El CDN de Supabase expone supabase globalmente con createClient
        if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return true;
        }
        // Alternativa: puede estar en window.supabase
        if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return true;
        }
    } catch (e) {
        console.error('Error inicializando Supabase:', e);
    }
    return false;
}

// Intentar inicializar inmediatamente
if (!inicializarSupabase()) {
    // Si no está disponible, esperar a que se cargue
    const checkSupabase = setInterval(() => {
        if (inicializarSupabase()) {
            clearInterval(checkSupabase);
            // Reinicializar la tienda cuando Supabase esté listo
            if (document.readyState === 'complete') {
                inicializarTienda();
            }
        }
    }, 100);
    
    // Timeout después de 10 segundos
    setTimeout(() => {
        clearInterval(checkSupabase);
        if (!supabaseClient) {
            console.error('Supabase JS no se pudo cargar después de 10 segundos. Verifica que el script del CDN esté incluido ANTES de este archivo.');
            mostrarError('Error de conexión. Por favor, recarga la página.');
        }
    }, 10000);
}

// Variable global para almacenar productos
let productos = [];
let carrito = [];

// Cargar productos desde Supabase
async function cargarProductos() {
    if (!supabaseClient) {
        console.error('Supabase no está inicializado');
        mostrarError('Error de conexión. Por favor, recarga la página.');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('productos')
            .select('*, variantes:producto_variantes(*)')
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error cargando productos:', error);
            mostrarError('Error al cargar productos. Por favor, recarga la página.');
            return;
        }

        const productosProcesados = (data || []).map(p => {
            // Normalizar categoría SHORT a SHORTS para que los filtros coincidan
            if (p.categoria && p.categoria.toUpperCase() === 'SHORT') {
                p.categoria = 'SHORTS';
            }
            const variantes = p.variantes || [];
            p.stock = variantes.reduce((sum, v) => sum + (v.stock || 0), 0);
            p.talla = [...new Set(variantes.filter(v => v.stock > 0 && v.talla).map(v => v.talla))].join(', ');
            p.color = [...new Set(variantes.filter(v => v.stock > 0 && v.color).map(v => v.color))].join(', ');
            return p;
        }).filter(p => p.stock > 0);

        productos = productosProcesados;
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error de conexión. Por favor, intenta más tarde.');
    }
}

// Organizar productos por categorías/secciones
function organizarPorCategorias(productosLista) {
    const productosPorCategoria = {};
    
    productosLista.forEach(producto => {
        const categoria = (producto.categoria || 'OTROS').toUpperCase();
        if (!productosPorCategoria[categoria]) {
            productosPorCategoria[categoria] = [];
        }
        productosPorCategoria[categoria].push(producto);
    });
    
    return productosPorCategoria;
}

// Mapeo de nombres de categorías para mostrar
const nombresCategorias = {
    'TODAS': 'Todas',
    'SUDADERAS': 'Sudaderas',
    'PLAYERAS': 'Playeras',
    'CAMISETAS': 'Camisetas',
    'CALCETAS': 'Calcetas',
    'PANS': 'Pans',
    'PANTALONES': 'Pantalones',
    'SHORTS': 'Shorts',
    'PLAYERA MANGA LARGA': 'Playera Manga Larga',
    'POLO': 'Polo',
    'CINTURÓN': 'Cinturón',
    'RELOJ': 'Reloj',
    'SNKRS': 'Sneakers',
    'ACCESORIOS': 'Accesorios',
    'GORRAS': 'Gorras',
    'LENTES': 'Lentes',
    'MOCHILA': 'Mochila',
    'MALETA': 'Maleta',
    'BANDOLERAS': 'Bandoleras',
    'PERFUMES': 'Perfumes',
    'PELUCHES': 'Peluches',
    'OTROS': 'Otros'
};

// Mostrar productos organizados por secciones
function mostrarProductos(productosFiltrados) {
    const productosContainer = document.getElementById('productos-container');
    if (!productosContainer) {
        console.error('No se encontró el contenedor de productos');
        return;
    }

    if (productosFiltrados.length === 0) {
        productosContainer.innerHTML = '<p class="sin-productos">No hay productos disponibles en este momento.</p>';
        return;
    }

    // Organizar productos por categoría
    const productosPorCategoria = organizarPorCategorias(productosFiltrados);
    
    // Orden de las categorías (las que tienen productos primero)
    // NO incluir 'INVENTARIO TOTAL' ya que no debe mostrarse en la web
    const ordenCategorias = ['SUDADERAS', 'PLAYERAS', 'CAMISETAS', 'CALCETAS', 'PANS', 
                            'PANTALONES', 'SHORTS', 'PLAYERA MANGA LARGA', 'POLO', 'CINTURÓN', 
                            'RELOJ', 'SNKRS', 'ACCESORIOS', 
                            'GORRAS', 'LENTES', 'MOCHILA', 
                            'MALETA', 'BANDOLERAS', 'PERFUMES', 'PELUCHES', 'OTROS'];
    
    let html = '';
    
    // Mostrar categorías en orden
    ordenCategorias.forEach(categoria => {
        // Filtrar categorías que no deben mostrarse
        if (categoria === 'INVENTARIO TOTAL' || categoria === 'TODAS') {
            return;
        }
        
        if (productosPorCategoria[categoria] && productosPorCategoria[categoria].length > 0) {
            const nombreCategoria = nombresCategorias[categoria] || categoria;
            html += `
                <section class="seccion-productos" id="seccion-${categoria.toLowerCase().replace(/\s+/g, '-')}">
                    <h2 class="titulo-seccion">${nombreCategoria}</h2>
                    <div class="grid-productos">
                        ${productosPorCategoria[categoria].map(producto => crearCardProducto(producto)).join('')}
                    </div>
                </section>
            `;
        }
    });
    
    // Mostrar categorías que no están en el orden (por si hay nuevas)
    Object.keys(productosPorCategoria).forEach(categoria => {
        // Filtrar categorías que no deben mostrarse
        if (categoria === 'INVENTARIO TOTAL' || categoria === 'TODAS' || ordenCategorias.includes(categoria)) {
            return;
        }
        
        const nombreCategoria = nombresCategorias[categoria] || categoria;
        html += `
            <section class="seccion-productos" id="seccion-${categoria.toLowerCase().replace(/\s+/g, '-')}">
                <h2 class="titulo-seccion">${nombreCategoria}</h2>
                <div class="grid-productos">
                    ${productosPorCategoria[categoria].map(producto => crearCardProducto(producto)).join('')}
                </div>
            </section>
        `;
    });
    
    productosContainer.innerHTML = html;
}

// Crear card de producto individual
function crearCardProducto(producto) {
    const imagenUrl = producto.imagen 
        ? (producto.imagen.startsWith('http') 
            ? producto.imagen 
            : `${SUPABASE_URL}/storage/v1/object/public/imagenes/${producto.imagen}`)
        : 'https://via.placeholder.com/300x300?text=Sin+Imagen';
    
    const precio = parseFloat(producto.precio_venta || producto.precio || 0).toFixed(2);
    const categoria = producto.categoria || 'OTROS';
    
    // Procesar tallas
    const tallasDisponibles = (producto.talla || '').split(',').map(t => t.trim()).filter(t => t !== '');
    let tallasHTML = '';
    
    if (tallasDisponibles.length > 0) {
        tallasHTML = `
            <div class="selector-tallas" style="margin-top: 10px;">
                <label style="font-size: 0.8rem; color: #aaa; display: block; margin-bottom: 5px;">Selecciona Talla:</label>
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    ${tallasDisponibles.map(t => `
                        <button class="talla-btn" 
                                data-id="${producto.id}" 
                                data-talla="${t}" 
                                onclick="event.preventDefault(); event.stopPropagation(); seleccionarTalla(this, '${t}')" 
                                style="background: #222; border: 1px solid #444; color: #fff; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; position: relative; z-index: 100;">
                            ${t}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    return `
        <div class="producto-card" data-categoria="${categoria}" style="position: relative; overflow: hidden; background: #111; border-radius: 10px; border: 1px solid #222;">
            <div class="producto-imagen-container">
                <img src="${imagenUrl}" alt="${producto.nombre}" class="producto-imagen" 
                     onerror="this.src='https://via.placeholder.com/300x300?text=Sin+Imagen'"
                     style="width: 100%; height: 220px; object-fit: cover;">
            </div>
            <div class="producto-info" style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 class="producto-nombre" style="margin: 0; flex: 1; font-size: 1.1rem; color: #ffffffff;">${producto.nombre}</h3>
                    <button onclick="event.preventDefault(); event.stopPropagation(); mostrarDetallesProducto(${producto.id})" 
                            style="background: none; border: 1px solid #dc1237ff; color: #dc1237ff; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; margin-left: 10px; white-space: nowrap; font-weight: bold;">
                        VER DETALLES
                    </button>
                </div>
                <div class="producto-detalles" style="margin-top: 5px; color: #fff; font-size: 0.9rem;">
                    ${producto.color ? `<span>Color: ${producto.color}</span>` : ''}
                </div>
                ${tallasHTML}
                <div class="producto-precio" style="margin-top: 10px;">
                    <span class="precio" style="font-size: 1.4rem; font-weight: bold; color: #6C7BFF;">$${precio}</span>
                </div>
                <button onclick="event.preventDefault(); event.stopPropagation(); agregarAlCarritoConTalla(${producto.id})" 
                   class="btn-agregar-carrito" 
                   style="display: block; width: 100%; text-align: center; padding: 12px; background: #b6ff3b; color: #000; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; margin-top: 12px; transition: background 0.3s; position: relative; z-index: 50;">
                    AGREGAR AL CARRITO
                </button>
            </div>
        </div>
    `;
}

// Global para rastrear talla seleccionada por producto
let tallasSeleccionadas = {};

function seleccionarTalla(btn, talla) {
    const productId = btn.getAttribute('data-id');
    tallasSeleccionadas[productId] = talla;
    
    // Resetear estilos de otros botones del mismo producto
    btn.parentElement.querySelectorAll('.talla-btn').forEach(b => {
        b.style.background = '#222';
        b.style.borderColor = '#444';
        b.style.color = '#fff';
    });
    
    // Marcar el seleccionado
    btn.style.background = '#b6ff3b';
    btn.style.borderColor = '#b6ff3b';
    btn.style.color = '#000';
}

function agregarAlCarritoConTalla(productoId) {
    const talla = tallasSeleccionadas[productoId];
    const producto = productos.find(p => p.id === productoId);
    
    // Si el producto tiene tallas pero no se seleccionó ninguna
    if ((producto.talla || '').split(',').filter(t => t.trim() !== '').length > 0 && !talla) {
        alert('Por favor selecciona una talla antes de agregar al carrito');
        return;
    }

    let varianteSeleccionada = null;
    if (producto.variantes && producto.variantes.length > 0) {
        if (talla) {
            varianteSeleccionada = producto.variantes.find(v => v.talla === talla);
        } else {
            varianteSeleccionada = producto.variantes[0];
        }
    }

    const varianteId = varianteSeleccionada ? (varianteSeleccionada.id || null) : null;
    const stockDisponible = varianteSeleccionada ? (varianteSeleccionada.stock || 0) : (producto.stock || 0);

    // Validar stock antes de agregar
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.id === productoId && i.size === talla);
    
    const currentQty = existing ? existing.qty : 0;
    if (currentQty + 1 > stockDisponible) {
        alert(`Lo sentimos, solo quedan ${stockDisponible} unidades disponibles de esta variante.`);
        return;
    }
    
    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            id: producto.id,
            variante_id: varianteId,
            name: producto.nombre,
            price: parseFloat(producto.precio_venta || producto.precio || 0),
            qty: 1,
            size: talla || 'N/A',
            color: varianteSeleccionada ? (varianteSeleccionada.color || producto.color || 'N/A') : (producto.color || 'N/A'),
            image: producto.imagen,
            stock: stockDisponible // Guardamos el stock para validarlo en la página del carrito
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    mostrarMensaje('¡Producto agregado al carrito!');
}

// Filtrar productos por categoría
function filtrarPorCategoria(categoria) {
    if (categoria === 'TODOS' || categoria === 'Todos') {
        mostrarProductos(productos);
        // Scroll suave a la primera sección
        setTimeout(() => {
            const primeraSeccion = document.querySelector('.seccion-productos');
            if (primeraSeccion) {
                primeraSeccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    } else {
        const productosFiltrados = productos.filter(p => 
            (p.categoria || '').toUpperCase() === categoria.toUpperCase()
        );
        mostrarProductos(productosFiltrados);
        
        // Scroll suave a la sección de la categoría
        setTimeout(() => {
            const seccion = document.getElementById(`seccion-${categoria.toLowerCase()}`);
            if (seccion) {
                seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
    
    // Actualizar botones activos
    document.querySelectorAll('.categoria-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-categoria') === categoria) {
            btn.classList.add('active');
        }
    });
}

// Agregar producto al carrito
function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    if (producto.stock <= 0) {
        alert('Este producto no tiene stock disponible');
        return;
    }

    const itemEnCarrito = carrito.find(item => item.id === productoId);
    
    if (itemEnCarrito) {
        if (itemEnCarrito.cantidad >= producto.stock) {
            alert('No hay suficiente stock disponible');
            return;
        }
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio_venta || producto.precio || 0),
            cantidad: 1,
            stock: producto.stock
        });
    }

    actualizarCarrito();
    mostrarMensaje('Producto agregado al carrito');
}

// Actualizar visualización del carrito
function actualizarCarrito() {
    const carritoCount = document.getElementById('carrito-count');
    const carritoTotal = document.getElementById('carrito-total');
    
    if (carritoCount) {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        carritoCount.textContent = `(${totalItems})`;
    }
    
    if (carritoTotal) {
        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        carritoTotal.textContent = `$${total.toFixed(2)}`;
    }
}

// Mostrar mensaje temporal
function mostrarMensaje(mensaje) {
    // Crear elemento de mensaje si no existe
    let mensajeEl = document.getElementById('mensaje-flotante');
    if (!mensajeEl) {
        mensajeEl = document.createElement('div');
        mensajeEl.id = 'mensaje-flotante';
        mensajeEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(mensajeEl);
    }
    
    mensajeEl.textContent = mensaje;
    mensajeEl.style.display = 'block';
    
    setTimeout(() => {
        mensajeEl.style.display = 'none';
    }, 3000);
}

// Mostrar error
function mostrarError(mensaje) {
    const productosContainer = document.getElementById('productos-container');
    if (productosContainer) {
        productosContainer.innerHTML = `
            <div class="error-mensaje">
                <p>${mensaje}</p>
                <button onclick="cargarProductos()">Reintentar</button>
            </div>
        `;
    }
}

// Buscar productos
function buscarProductos(termino) {
    if (!termino || termino.trim() === '') {
        mostrarProductos(productos);
        return;
    }

    const terminoLower = termino.toLowerCase();
    const productosFiltrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(terminoLower) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(terminoLower)) ||
        (p.codigo && p.codigo.toLowerCase().includes(terminoLower))
    );
    
    mostrarProductos(productosFiltrados);
}

// Mostrar detalles del producto en modal
function mostrarDetallesProducto(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const imagenUrl = producto.imagen 
        ? (producto.imagen.startsWith('http') 
            ? producto.imagen 
            : `${SUPABASE_URL}/storage/v1/object/public/imagenes/${producto.imagen}`)
        : 'https://via.placeholder.com/600x600?text=Sin+Imagen';
    
    const precio = parseFloat(producto.precio_venta || producto.precio || 0).toFixed(2);
    
    // Crear modal si no existe
    let modal = document.getElementById('modal-producto');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-producto';
        modal.className = 'modal-producto';
        modal.innerHTML = `
            <div class="modal-contenido">
                <span class="modal-cerrar">&times;</span>
                <div class="modal-body">
                    <div class="modal-imagen-container">
                        <img id="modal-imagen" src="" alt="" class="modal-imagen">
                    </div>
                    <div class="modal-info">
                        <h2 id="modal-nombre"></h2>
                        <p id="modal-descripcion" class="modal-descripcion"></p>
                        <div id="modal-detalles" class="modal-detalles"></div>
                        <div class="modal-precio">
                            <span id="modal-precio-texto"></span>
                        </div>
                        <div style="margin-top: 1.5rem; text-align: center;">
                            <a id="modal-whatsapp-btn" class="btn-whatsapp" target="_blank" href="#">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp">
                                comprar por whatsapp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Cerrar modal al hacer clic en X o fuera del contenido
        modal.querySelector('.modal-cerrar').addEventListener('click', cerrarModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModal();
            }
        });
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                cerrarModal();
            }
        });
    }
    
    // Llenar información del producto
    document.getElementById('modal-imagen').src = imagenUrl;
    document.getElementById('modal-imagen').alt = producto.nombre;
    document.getElementById('modal-nombre').textContent = producto.nombre;
    // Actualizar enlace de WhatsApp dinámicamente con mensaje detallado
    var whatsappBtn = document.getElementById('modal-whatsapp-btn');
    if (whatsappBtn) {
        let mensajeWhats = `Hola, me interesa este producto:\n\n*Producto:* ${producto.nombre}`;
        if (producto.codigo) mensajeWhats += `\n*Código:* ${producto.codigo}`;
        if (producto.talla) mensajeWhats += `\n*Talla:* ${producto.talla}`;
        if (producto.color) mensajeWhats += `\n*Color:* ${producto.color}`;
        mensajeWhats += `\n*Precio:* $${precio}`;
        mensajeWhats += `\n\n*Ver imagen:* ${imagenUrl}`;
        
        whatsappBtn.href = `https://wa.me/+527341439779?text=${encodeURIComponent(mensajeWhats)}`;
    }
    
    const descripcionEl = document.getElementById('modal-descripcion');
    if (producto.descripcion) {
        descripcionEl.textContent = producto.descripcion;
        descripcionEl.style.display = 'block';
    } else {
        descripcionEl.style.display = 'none';
    }
    
    const detallesEl = document.getElementById('modal-detalles');
    let detallesHTML = '';
    if (producto.codigo) {
        detallesHTML += `<p><strong>Código:</strong> ${producto.codigo}</p>`;
    }
    if (producto.talla) {
        detallesHTML += `<p><strong>Talla:</strong> ${producto.talla}</p>`;
    }
    if (producto.color) {
        detallesHTML += `<p><strong>Color:</strong> ${producto.color}</p>`;
    }
    if (producto.categoria) {
        detallesHTML += `<p><strong>Categoría:</strong> ${nombresCategorias[producto.categoria.toUpperCase()] || producto.categoria}</p>`;
    }
    detallesEl.innerHTML = detallesHTML || '<p>Sin detalles adicionales</p>';
    
    document.getElementById('modal-precio-texto').textContent = `$${precio}`;
    
    // Mostrar modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function cerrarModal() {
    const modal = document.getElementById('modal-producto');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cargar productos cuando la página esté lista y Supabase esté inicializado
function inicializarTienda() {
    // Forzar scroll al inicio de la página al cargar
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    if (!supabaseClient) {
        // Esperar un poco más si Supabase aún no está listo
        setTimeout(inicializarTienda, 100);
        return;
    }
    
    cargarProductos();
    
    // Configurar búsqueda si existe
    const buscarInput = document.getElementById('buscar-producto');
    if (buscarInput) {
        buscarInput.addEventListener('input', (e) => {
            buscarProductos(e.target.value);
        });
    }
    
    // Configurar botones de categoría
    document.querySelectorAll('.categoria-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const categoria = btn.getAttribute('data-categoria');
            filtrarPorCategoria(categoria);
        });
    });
}

// Esperar a que el DOM y Supabase estén listos
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarTienda);
} else {
    inicializarTienda();
}

// Recargar productos cada 30 segundos para mantener sincronización
let usuarioInteractuando = false;

window.addEventListener('scroll', () => {
    usuarioInteractuando = true;
});

setInterval(() => {
    if (!usuarioInteractuando) {
        cargarProductos();
    }
    usuarioInteractuando = false;
}, 30000);


