<div align="center">
  <img src="/public/iconox.png" alt="FaceTime Tracker Logo" width="200" />
  <h1>FaceTime Tracker</h1>
  <p>Monitor de Tiempo de Exposición a la Cámara</p>
  <p><em>Creado por Carlos Freire - 23 de Mayo 2025</em></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![GitHub stars](https://img.shields.io/github/stars/420btc/facedetection?style=social)](https://github.com/420btc/facedetection/stargazers)
  [![GitHub issues](https://img.shields.io/github/issues/420btc/facedetection)](https://github.com/420btc/facedetection/issues)
</div>

## 🎯 ¿Qué es FaceTime Tracker?

FaceTime Tracker es una aplicación web que utiliza inteligencia artificial para detectar y registrar el tiempo que pasas frente a la cámara. Especialmente útil para medir la exposición a videollamadas, clases virtuales o cualquier actividad que requiera el uso de cámara web. Con una interfaz intuitiva, te permite llevar un registro detallado de tu tiempo de exposición a la cámara, con estadísticas y visualizaciones fáciles de entender.

## ✨ Características Principales

- 👁️ **Detección facial en tiempo real** con TensorFlow.js
- ⏱️ **Registro preciso** del tiempo de exposición con historial detallado
- 📊 **Panel de estadísticas** con gráficos interactivos
- 🔔 **Notificaciones** para recordatorios de descanso
- 🌓 **Modo oscuro/claro** para mayor comodidad visual
- 📱 **Diseño responsivo** que funciona en cualquier dispositivo
- 🔄 **Sincronización** entre dispositivos (próximamente)
- 🔒 **Privacidad primero**: Todo el procesamiento ocurre localmente

## 🚀 Empezando

### Requisitos Previos

- Node.js 16.14 o superior
- NPM 8.0 o superior
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Cámara web

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/420btc/facedetection.git
   cd facedetection
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

4. Abre tu navegador y visita:
   ```
   http://localhost:3000
   ```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 13+** - Framework de React para aplicaciones web
- **TypeScript** - JavaScript tipado para mejor desarrollo
- **Tailwind CSS** - Utilidades CSS para un diseño rápido
- **Chart.js** - Para visualización de datos
- **Framer Motion** - Animaciones fluidas

### IA y Procesamiento
- **TensorFlow.js** - Para detección facial en el navegador
- **Face Landmarks Detection** - Modelo de detección de puntos faciales

### Otras Herramientas
- **ESLint** - Análisis de código estático
- **Prettier** - Formateo de código
- **Husky** - Git hooks

## 📝 Uso

1. **Iniciar una nueva sesión**: Haz clic en "Iniciar Monitoreo"
2. **Permite el acceso a la cámara** cuando tu navegador lo solicite
3. **Mantente en el marco de la cámara** para el seguimiento
4. **Revisa tus estadísticas** en tiempo real
5. **Consulta tu historial** de sesiones anteriores

## ⚙️ Configuración

Puedes personalizar la aplicación modificando el archivo `.env.local`:

```env
NEXT_PUBLIC_APP_NAME=FaceTime Tracker
NEXT_PUBLIC_DEFAULT_SESSION_MINUTES=60
NEXT_PUBLIC_REMINDER_MINUTES=20
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, lee nuestras [pautas de contribución](CONTRIBUTING.md) para más detalles.

1. Haz un Fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

## 🙏 Reconocimientos

- Equipo de TensorFlow.js por su increíble biblioteca
- Comunidad de código abierto por su apoyo continuo
- A todos los contribuyentes que ayudan a mejorar este proyecto

## 📞 Contacto

Carlos Freire - [@tu_usuario](https://twitter.com/tu_usuario) - correo@ejemplo.com

Enlace del proyecto: [https://github.com/420btc/facedetection](https://github.com/420btc/facedetection)

---

<div align="center">
  Hecho con ❤️ por la comunidad de código abierto
</div>

### 📦 Otros Módulos Clave
- `@tensorflow/tfjs`: Biblioteca principal de TensorFlow.js
- `@tensorflow-models/face-landmarks-detection`: Modelo pre-entrenado para detección de puntos faciales
- `react-webcam`: Componente de React para acceder a la cámara web
- `tailwindcss`: Framework CSS para estilos rápidos y responsivos

## 🚀 Cómo Empezar

### Requisitos Previos
- Node.js 16.8 o superior
- NPM o Yarn
- Navegador web moderno con soporte para WebGL

### Instalación

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd mi-app-deteccion-facial
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📝 Uso

1. Concede los permisos de cámara cuando se te solicite.
2. La aplicación comenzará a detectar automáticamente tu rostro.
3. El contador registrará el tiempo que pasas frente a la cámara.
4. Revisa tu historial de sesiones en la sección correspondiente.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Siéntete libre de abrir un issue o enviar un pull request.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

<p align="center">
  <em>Desarrollado con ❤️ por Carlos Freire</em>
</p>

