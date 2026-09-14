# Especificación: Gestión de las Fichas de Comidas

## Funcionalidad: Rellenar ficha de fin de semana
El estudiante debe poder indicar si se queda o no a comer el viernes, sábado y domingo.

## Funcionalidad: Visualización y Exportación para Cocina
El director debe poder consultar el número de comensales y de picnics.

### Escenario: Envío de la ficha dentro del plazo permitido
- **Given**  el estudiante ha iniciado sesión y es anterior al jueves a las 00:00.
- **When** rellena la ficha indicando su previsión de comidas y cenas del fin de semana y lo envia.
- **Then** el sistema almacena la solicitud y le da al residente un código QR único para acceder al comedor.

### Escenario: Intento de envío fuera de plazo
- **Given**  el estudiante intenta modificar o rellenar la ficha.
- **When** el reloj del servidor marca el jueves a las 00:00 o una hora posterior a esta, en la misma semana.
- **Then** se bloquea la acción y muestra un mensaje indicando que el plazo ya está cerrado.

### Escenario: Exportar datos para el personal de cocina
- **Given**  el director accede al panel de administración.
- **When** solicita el listado de residentes que y las raciones que se tienen que preparar para el fin de semana.
- **Then** el sistema genera el número de residentes que habrá y un listado detallado en excel de las raciones que se deben prepara.