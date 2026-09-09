import { useState } from 'react';
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
  Notification
} from '@mantine/core';
import { api } from './services/api';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [selection, setSelection] = useState({
    fridayDinner: false,
    saturdayLunch: false,
    saturdayDinner: false,
    sundayLunch: false,
    sundayDinner: false,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [qrToken, setQrToken] = useState('');

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

  return (
    <Container size={600} my={40}>
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Panel del Residente</Title>
          <Text size="sm" c="dimmed">DNI: {user?.dni} | Habitación: {user?.roomNumber || 'N/D'}</Text>
        </div>
        <Button color="red" variant="outline" onClick={handleLogout}>Cerrar sesión</Button>
      </Group>

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
          <Paper mt="xl" p="md" bg="gray.1" radius="sm">
            <Text fw={500} ta="center">Tu Token QR de Acceso:</Text>
            <Text ta="center" size="sm" ff="monospace" mt={5}>{qrToken}</Text>
          </Paper>
        )}
      </Paper>
    </Container>
  );
}