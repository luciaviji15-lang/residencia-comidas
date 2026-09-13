import { useState, useEffect } from 'react';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Container, 
  Paper, 
  Title, 
  Text, 
  Stack, 
  Notification,
} from '@mantine/core';
import { api } from './services/api';
import AdminPanel from './components/AdminPanel';
import KitchenPanel from './components/KitchenPanel';
import StudentPanel from './components/StudentPanel';


export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  
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


  if (!token) {
    return (
      <Container size={420} my={40}>
        <Title ta="center" fw={700}>Residencia Universitaria Santo Tomás de Aquino</Title>
        <Text c="dark.9" size="sm" ta="center" mt={6}  >Gestión de las Comidas del Fin de Semana</Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleLogin}>
            <Stack>
              {error && <Notification color="red" onClose={() => setError('')}>{error}</Notification>}
              <TextInput label="DNI" placeholder="87654321A" required value={dni} onChange={(e) => setDni(e.target.value)} />
              <PasswordInput label="Contraseña" placeholder="Introduce tu contraseña " required value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" fullWidth mt="l">Iniciar Sesión</Button>
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

  if (user?.role === 'STUDENT') {
    return <StudentPanel user={user} onLogout={handleLogout} />;
  }


  return (
    <Container ta="center" mt="xl">
      <Title>Error de acceso</Title>
      <Text>Tu usuario no tiene un rol válido asignado.</Text>
      <Button mt="md" onClick={handleLogout}>Volver al inicio</Button>
    </Container>
  );
}