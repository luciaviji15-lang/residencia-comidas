import { useState, useEffect } from 'react';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Container, 
  Paper, 
  Title, 
  Text, 
  Checkbox, 
  Stack, 
  Group,
  Notification,
  Table,
  List
} from '@mantine/core';
import { api } from './services/api';
import AdminPanel from './components/AdminPanel';
import KitchenPanel from './components/KitchenPanel';
import StudentPanel from './components/StudentPanel';
import { QRCodeSVG } from 'qrcode.react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

// ...
  const [history, setHistory] = useState<any[]>([]);



  const [selection, setSelection] = useState({
    fridayDinner: false,
    saturdayLunch: false,
    saturdayDinner: false,
    sundayLunch: false,
    sundayDinner: false,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [qrToken, setQrToken] = useState('');


  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      console.log("Pidiendo historial para el usuario:", user.id);
      
      api.get(`/meals/history/${user.id}`)
        .then(res => {
          setHistory(res.data);
          
          // ¡LA MAGIA AQUÍ! Si el alumno ya tiene fichas, cargamos la última automáticamente
          if (res.data && res.data.length > 0) {
            setQrToken(res.data[0].qrCodeToken); // Mostramos el QR guardado
            setSelection(res.data[0].selection); // Rellenamos las casillas con lo que pidió
          }
        })
        .catch(err => {
          console.error("Error al cargar historial:", err);
        });
    }
  }, [user, successMessage]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { dni, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const handleMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      const response = await api.post('/meals/submit', {
        userId: user.id,
        selection,
      });
      setSuccessMessage('¡Ficha de fin de semana guardada con éxito!');
      setQrToken(response.data.qrCodeToken);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar la ficha (comprueba el límite del miércoles)');
    }
  };

  if (!token) {
    return (
      <Container size={420} my={40}>
        <Title ta="center" fw={900}>Residencia UCLM</Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>Gestión de Comidas de Fin de Semana</Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleLogin}>
            <Stack>
              {error && <Notification color="red" onClose={() => setError('')}>{error}</Notification>}
              <TextInput label="DNI" placeholder="12345678A" required value={dni} onChange={(e) => setDni(e.target.value)} />
              <PasswordInput label="Contraseña" placeholder="Tu contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" fullWidth mt="l">Entrar</Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    );
  }

if (user?.role === 'ADMIN') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  if (user?.role === 'KITCHEN') {
    return <KitchenPanel onLogout={handleLogout} />;
  }


  return (
    <Container size={600} my={40}>
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Panel del Residente</Title>
          <Text size="sm" c="dimmed">DNI: {user?.dni} | Habitación: {user?.roomNumber || 'N/D'}</Text>
        </div>
        <Button color="red" variant="outline" onClick={handleLogout}>Cerrar sesión</Button>
      </Group>
      <StudentPanel user={user} />

      <Paper withBorder shadow="sm" p="md" radius="md" mb="xl">
        <Title order={4} mb="sm">Menú de este fin de semana</Title>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Día</Table.Th>
              <Table.Th>Comida (14:00)</Table.Th>
              <Table.Th>Cena (21:00)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td fw={500}>Viernes</Table.Td>
              <Table.Td c="dimmed">-</Table.Td>
              <Table.Td>Pizza casera y ensalada</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={500}>Sábado</Table.Td>
              <Table.Td>Macarrones gratinados y lomo</Table.Td>
              <Table.Td>Sopa, tortilla de patatas</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={500}>Domingo</Table.Td>
              <Table.Td>Paella mixta</Table.Td>
              <Table.Td>Hamburguesa con patatas</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Paper>

      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={3} mb="md">Selección de Comidas</Title>
        <Text size="xs" c="dimmed" mb="xl">Recuerda que el plazo límite para modificar las comidas finaliza el miércoles a las 00:00.</Text>

        {error && <Notification color="red" mb="md" onClose={() => setError('')}>{error}</Notification>}
        {successMessage && <Notification color="green" mb="md" onClose={() => setSuccessMessage('')}>{successMessage}</Notification>}

        <form onSubmit={handleMealSubmit}>
          <Stack>
            <Checkbox 
              label="Viernes - Cena" 
              checked={selection.fridayDinner} 
              onChange={(e) => setSelection({ ...selection, fridayDinner: e.currentTarget.checked })} 
            />
            <Checkbox 
              label="Sábado - Comida" 
              checked={selection.saturdayLunch} 
              onChange={(e) => setSelection({ ...selection, saturdayLunch: e.currentTarget.checked })} 
            />
            <Checkbox 
              label="Sábado - Cena" 
              checked={selection.saturdayDinner} 
              onChange={(e) => setSelection({ ...selection, saturdayDinner: e.currentTarget.checked })} 
            />
            <Checkbox 
              label="Domingo - Comida" 
              checked={selection.sundayLunch} 
              onChange={(e) => setSelection({ ...selection, sundayLunch: e.currentTarget.checked })} 
            />
            <Checkbox 
              label="Domingo - Cena" 
              checked={selection.sundayDinner} 
              onChange={(e) => setSelection({ ...selection, sundayDinner: e.currentTarget.checked })} 
            />

            <Button type="submit" mt="md">Guardar Selección</Button>
          </Stack>
        </form>

        {qrToken && (
          <Paper mt="xl" p="lg" bg="gray.0" radius="md" withBorder>
            <Title order={4} ta="center" mb="md">Tu Pase de Comedor 🎫</Title>
            
            {/* Aquí generamos el cuadradito negro del QR */}
            <Group justify="center" mb="md">
              <QRCodeSVG 
                value={qrToken} 
                size={180} 
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"} // Nivel alto de corrección de errores
              />
            </Group>
            
            {/* Dejamos el texto por si el lector falla y hay que teclearlo a mano */}
            <Text ta="center" size="xs" c="dimmed" tt="uppercase">Código manual (en caso de fallo del lector)</Text>
            <Text ta="center" size="sm" ff="monospace" fw={600}>{qrToken}</Text>
          </Paper>
        )}

        {history.length > 0 && (
          <Paper mt="xl" p="md" withBorder radius="md">
            <Title order={4} mb="sm">Tus Fichas Guardadas</Title>
            
            {history.map((sub, index) => (
              <Paper key={index} withBorder p="sm" mb="sm" bg="gray.0">
                <Text fw={600} mb="xs">
                  Ficha actual (QR: {sub.qrCodeToken ? sub.qrCodeToken.substring(0, 8) : '---'})
                </Text>
                
                <List size="sm" spacing="xs" icon="🍽️">
                  {/* Recorremos el objeto selection y mostramos solo los que están a true */}
                  {Object.entries(sub.selection)
                    .filter(([key, value]) => value === true)
                    .map(([key]) => {
                      // Diccionario para traducir del inglés de la base de datos a español
                      const nombresComidas: Record<string, string> = {
                        fridayDinner: 'Viernes - Cena',
                        saturdayLunch: 'Sábado - Comida',
                        saturdayDinner: 'Sábado - Cena',
                        sundayLunch: 'Domingo - Comida',
                        sundayDinner: 'Domingo - Cena'
                      };
                      return <List.Item key={key}>{nombresComidas[key]}</List.Item>;
                    })}
                </List>
              </Paper>
            ))}
          </Paper>
        )}

      </Paper>
    </Container>
  );
}