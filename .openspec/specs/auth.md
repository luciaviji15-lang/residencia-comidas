## Funcionalidad: Autenticación y Control de Acceso por Roles
El usuario debe poder identificarse en el sistema con su DNI y contraseña para acceder al panel que le corresponde.

### Escenario: Inicio de sesión correcto
- **Given** que el usuario está en el apartado de login.
- **When** introduce su DNI y contraseña correctos y pulsa iniciar sesión.
- **Then** se valida la información y se lleva al usuario al panel que le corresponde.

### Escenario: Acceso denegado 
- **Given** un usuario que no existe intenta iniciar sesión.
- **When** el sistema comprueba la información introducida en el login.
- **Then** bloquea el acceso y muestra un mensaje de error.