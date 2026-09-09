# Especificación: Validación por Código QR

## Funcionalidad: Control de acceso al comedor
El estudiante que se haya inscrito debe poder fichar al entrar al comedor.

### Escenario: Escaneo de QR válido
- **Given** que el estudiante se ha inscrito correctamente a la comida, cena o picnic del viernes.
- **When** se escanea el código QR de su perfil en la entrada del comedor.
- **Then** el sistema valida que tiene derecho a comer hoy y registra su asistencia con éxito.