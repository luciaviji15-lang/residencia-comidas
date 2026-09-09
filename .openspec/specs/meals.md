# Especificación: Gestión de las Fichas de Comidas

## Funcionalidad: Rellenar ficha de fin de semana y vuelta
El estudiante debe poder indicar si se queda o no a comer el viernes, si quiere picnic y qué día volverá a la residencia.

### Escenario: Envío de la ficha dentro del plazo permitido
- **Given** que el estudiante ha iniciado sesión y es anterior al jueves a las 00:00.
- **When** rellena la ficha indicando su previsión de comidas y cenas del fin de semana y pulsa enviar.
- **Then** el sistema almacena la solicitud y asocia un código QR único para el acceso al comedor.

### Escenario: Intento de envío fuera de plazo
- **Given** que el estudiante intenta modificar o rellenar la ficha.
- **When** el reloj del servidor marca el jueves a las 00:00 o una hora posterior a esta, en la misma semana.
- **Then** el sistema bloquea la acción y muestra un mensaje indicando que el plazo de inscripción está cerrado.

## Funcionalidad: Visualización y Exportación para Cocina
El director debe poder consultar el número de comensales y de picnics.

### Escenario: Exportar datos para el personal de cocina
- **Given** que el director accede al panel de administración.
- **When** solicita el listado de residentes que se quedan el fin de semana.
- **Then** el sistema genera el número de residentes que habrá y un listado detallado listo para exportar.