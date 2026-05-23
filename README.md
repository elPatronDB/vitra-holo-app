🔮 Vitra Holo App
¡Bienvenido a Vitra Holo! La plataforma web diseñada para dar vida a tus imágenes y animaciones en tres dimensiones mediante pirámides y prismas holográficos físicos.

Accede a la versión oficial aquí: vitra-holo-app-db-01.web.app

Esta aplicación te permite crear, gestionar y proyectar hologramas (incluyendo GIFs animados) con un sistema avanzado de doble pantalla sincronizada en tiempo real y herramientas de calibración milimétrica adaptadas a prismas físicos de 2x2 pulgadas o mayores.

✨ Características Principales
🎨 Interfaz de Alta Fidelidad: Diseño oscuro premium con efectos translúcidos (glassmorphism) y transiciones fluidas optimizadas para dispositivos móviles y monitores FUHD.
🔄 Sincronización Remota Inteligente: Vincula una segunda pantalla (tablet, móvil o Smart TV) como proyector dedicado y contrólala en tiempo real desde tu teléfono móvil.
📐 Calibración Dinámica de Prisma:
Apertura Central (Gap): Separa las imágenes del centro para que coincidan con la base plana de 2x2 pulgadas de tu prisma físico.
Tamaño (Size): Escala el holograma para que se ajuste exactamente a las caras de cristal sin desbordarse.
👾 Soporte Completo de GIFs Animados: Sube tus propios GIFs animados sin perder la animación. El sistema renderiza las 4 caras del holograma de manera dinámica usando rotaciones puras en el cliente.
🔋 Wake Lock Automático: Evita que la pantalla local o remota se apague o entre en suspensión durante una proyección holográfica.
🌑 Negro Absoluto (#000000): Pantallas de proyección completamente negras, libres de halos o sombras artificiales, para que solo la luz del holograma se refleje en el cristal.
🧠 Generación con IA: Diseña hologramas personalizados a través de descripciones de texto y múltiples estilos artísticos (Cyberpunk, Realista, Abstracto, Minimalista).
🚀 Guía de Inicio Rápido (Cómo Empezar)
Paso 1: Accede a la Aplicación
Abre Vitra Holo App en tu navegador.
Inicia sesión con tu cuenta para acceder a tu galería personal de hologramas.
Paso 2: Sube o Genera tu Holograma
Subir un archivo propio: Ve a la pestaña Crear (ícono de destellos), selecciona Subir Archivo e ingresa un GIF, PNG o JPG. ¡Tus GIFs se subirán respetando su animación original!
Generar con IA: En la pestaña Crear, escribe lo que deseas ver en el cuadro de texto, elige tu estilo favorito y presiona Generar Holograma.
Paso 3: Enlaza tu Pantalla de Proyección (Recomendado)
Para usar dos dispositivos (ej. tu móvil como control remoto y una tablet bajo el prisma físico):

En tu móvil, ve a la pestaña Ajustes.
Presiona el botón Ver Enlace Remoto.
Escanea el código QR que aparece en pantalla con la cámara de tu tablet (o copia y abre el enlace de sincronización).
La tablet entrará en modo de espera con una pantalla negra de radar. Presiona Pantalla Completa en el aviso superior de la tablet.
Paso 4: ¡A Proyectar!
En tu móvil, selecciona el holograma que quieres mostrar en la pestaña Galería.
Ve a la pestaña Proyectar y selecciona Modo Remoto para activar la transmisión en la tablet.
Coloca tu prisma holográfico de 2x2 pulgadas centrado sobre la pantalla de la tablet en una habitación oscura.
Mueve los deslizadores de Apertura Central y Tamaño de Escala en tu móvil hasta que las imágenes coincidan milimétricamente con el cristal de tu prisma físico.
Regula el nivel de Lúmenes y Brillo para obtener la máxima nitidez.
🛠️ Instalación y Ejecución Local (Desarrolladores)
Si deseas clonar y ejecutar este proyecto en tu propio entorno local:

Requisitos Previos
Node.js (versión 18 o superior recomendada)
Una cuenta de Firebase (si deseas configurar tus propias credenciales)
Pasos
Instalar dependencias:

bash

npm install
Configurar variables de entorno: Crea un archivo .env.local en la raíz del proyecto y agrega tus claves de Firebase:

env

VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_id
VITE_FIREBASE_APP_ID=tu_app_id
Iniciar el servidor de desarrollo:

bash

npm run dev
Abre http://localhost:5173 en tu navegador para ver la aplicación.

💡 Consejos para la Proyección Holográfica Ideal
Habitación a oscuras: Cuanto menos luz ambiental haya en el entorno, más vívida e impactante se verá la proyección tridimensional.
Pantalla limpia: Limpia perfectamente el cristal de tu prisma y la pantalla de proyección para evitar reflejos indeseados por polvo o huellas.
Ajuste del negro: Utiliza archivos con fondo negro puro (#000000). La app está diseñada para suprimir cualquier halo luminoso grisáceo y asegurar que solo el objeto de color brille en el centro del prisma.
Calibración remota: No necesitas tocar la tablet una vez que la dejes en el suelo o base de proyección. Haz todos los ajustes geométricos y cambios de hologramas cómodamente desde tu móvil a distancia.
