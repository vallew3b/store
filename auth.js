// Configuración de Supabase para Autenticación
const SUPABASE_URL = 'https://pyuqebokjhtwyrojwgxd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IUyaOWBuDvTAURD92VCxQQ_AGQN1-pw';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Registro de usuarios
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('regNombre').value;
        const apellidos = document.getElementById('regApellidos').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPass').value;
        const confirmPassword = document.getElementById('regPassConfirm').value;
        const msg = document.getElementById('regMsg');

        if (password !== confirmPassword) {
            msg.textContent = 'Las contraseñas no coinciden';
            return;
        }

        try {
            // Verificar si el usuario ya existe
            const { data: existingUser, error: checkError } = await supabaseClient
                .from('usuarios_web')
                .select('email')
                .eq('email', email)
                .single();

            if (existingUser) {
                msg.textContent = 'El correo ya está registrado';
                return;
            }

            // Insertar nuevo usuario (solo datos básicos)
            const { data, error } = await supabaseClient
                .from('usuarios_web')
                .insert([
                    { 
                        nombre, 
                        apellidos, 
                        email, 
                        password 
                    }
                ]);

            if (error) throw error;

            msg.style.color = '#b6ff3b';
            msg.textContent = 'Registro exitoso. Redirigiendo...';
            setTimeout(() => window.location.href = 'login.html', 2000);

        } catch (error) {
            console.error('Error:', error);
            msg.textContent = 'Error al registrarse. Intenta de nuevo.';
        }
    });
}

// Inicio de sesión
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPass').value;
        const msg = document.getElementById('loginMsg');

        try {
            const { data, error } = await supabaseClient
                .from('usuarios_web')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .single();

            if (error || !data) {
                msg.textContent = 'Correo o contraseña incorrectos';
                return;
            }

            // Guardar sesión en localStorage
            localStorage.setItem('usuarioLogueado', JSON.stringify({
                nombre: data.nombre,
                apellidos: data.apellidos,
                email: data.email,
                calle: data.calle,
                colonia: data.colonia,
                ciudad: data.ciudad,
                estado: data.estado,
                cp: data.cp,
                telefono: data.telefono
            }));

            msg.style.color = '#b6ff3b';
            msg.textContent = 'Inicio de sesión exitoso. Redirigiendo...';
            setTimeout(() => window.location.href = 'index.html', 1500);

        } catch (error) {
            console.error('Error:', error);
            msg.textContent = 'Error al iniciar sesión';
        }
    });
}

// Función para actualizar el header según el estado del usuario
function actualizarHeader() {
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    const userDisplayName = document.getElementById('userDisplayName');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    if (usuarioLogueado && userDisplayName && userDropdownMenu) {
        userDisplayName.textContent = `Hola, ${usuarioLogueado.nombre}`;
        userDisplayName.style.display = 'block';
        userDropdownMenu.innerHTML = `
            <a href="#" id="btnLogout">Cerrar Sesión</a>
        `;

        document.getElementById('btnLogout').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogueado');
            window.location.reload();
        });
    } else if (userDropdownMenu) {
        userDisplayName.style.display = 'none';
        userDropdownMenu.innerHTML = `
            <a href="login.html">Iniciar Sesión</a>
            <a href="register.html">Registrarse</a>
        `;
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', actualizarHeader);
