import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'

// 🎨 AQUÍ CREAMOS LA PERSONALIDAD DE TU APP
const myCustomTheme = createTheme({
  // 1. Aplicamos la nueva letra a todo
  fontFamily: '"Outfit", sans-serif',
  headings: { fontFamily: '"Outfit", sans-serif' },
  
  // 2. Bordes más redondeados (estilo app móvil)
  defaultRadius: 'xl',
  
  // 3. Puedes definir un color principal (Ejemplo: Coral/Naranja cálido)
  primaryColor: 'orange',

  // 4. Personalizamos los componentes por defecto
  components: {
    Card: {
      defaultProps: {
        shadow: 'md',       // Sombras más suaves y modernas
        withBorder: false,  // Quitamos las líneas grises de los bordes
      },
    },
    Button: {
      defaultProps: {
        fw: 700,            // Botones con letra más gordita (bold)
      },
      styles: {
        root: { transition: 'transform 0.2s ease' }, // Pequeña animación al pasar el ratón
      }
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
        radius: 'lg',
      }
    }
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* LE PASAMOS NUESTRO TEMA AL PROVIDER */}
    <MantineProvider theme={myCustomTheme}>
      <App />
    </MantineProvider>
  </React.StrictMode>,
)