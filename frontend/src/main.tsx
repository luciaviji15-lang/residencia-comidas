import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import './index.css'

const myCustomTheme = createTheme({

  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: { 
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
  },
  
  defaultRadius: 'sm',

  colors: {
    'coral-app': [
      '#fff0ee',
      '#ffdfda',
      '#ffc0b5',
      '#ff9e8f',
      '#ff7f6b',
      '#ff6247', // Color principal
      '#eb4d35', // Hover
      '#c73b27',
      '#a32b1b',
      '#802013',
    ],
  },
  
  primaryColor: 'coral-app',
  components: {
    Card: {
      defaultProps: {
        shadow: 'md',     
        withBorder: false,  
      },
    },
    Button: {
      defaultProps: {
        fw: 700,           
      },
      styles: {
        root: { transition: 'transform 0.2s ease' }, 
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

    <MantineProvider theme={myCustomTheme}>
      <App />
    </MantineProvider>
  </React.StrictMode>,
)