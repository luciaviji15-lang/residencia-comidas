import { useState, useEffect } from 'react';
import { Card, Avatar, Text, Group, Badge, Stack, Button, Modal, Checkbox, Paper, Table, Notification, TextInput, Title, List } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { api } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

interface StudentPanelProps {
  user: any;
  onLogout: () => void;
}

export default function StudentPanel({ user, onLogout }: StudentPanelProps) {
  
  
  const [opened, { open, close }] = useDisclosure(false);
  
  const avatarUrl = user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.dni}`;
  const [diet, setDiet] = useState({
    isVegan: user.isVegan || false,
    isCeliac: user.isCeliac || false,
    lactoseIntolerant: user.lactoseIntolerant || false,
    eggAlergic: user.eggAlergic || false,
    avatarUrl: user.avatarUrl || ''

  });

  const [selection, setSelection] = useState({
    fridayDinner: false,
    saturdayLunch: false,
    saturdayDinner: false,
    sundayLunch: false,
    sundayDinner: false,
  });
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  // Cargar el historial y la última selección al abrir el panel
  useEffect(() => {
    if (user && user.id) {
      api.get(`/meals/history/${user.id}`)
        .then(res => {
          setHistory(res.data);
          if (res.data && res.data.length > 0) {
            setQrToken(res.data[0].qrCodeToken);
            setSelection(res.data[0].selection);
          }
        })
        .catch(err => {
          console.error("Error al cargar historial:", err);
        });
    }
  }, [user, successMessage]);

const handleSaveDiet = async () => {
    try {
      const userId = user.id || user.sub; 
      
      // VOLVEMOS A USAR /diet AQUÍ
      const response = await api.patch(`/users/${userId}/diet`, diet);
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...storedUser, ...response.data };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload(); 
    } catch (error) {
      console.error("Error al guardar perfil:", error);
    }
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
      setError(err.response?.data?.message || 'Error al enviar la ficha');
    }
  };

  return (
    <>
      {/* Cabecera del Alumno (Perfil) */}
      <Card radius="xl" p="xl" className="tarjeta-app" mb="xl">
        <div className="portada-perfil" />
        <Avatar 
            src={avatarUrl} 
            size={100} 
            radius="100%" 
            style={{ border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'white' }} 
        />
        
        <Group justify="flex-end" align="flex-end" mt="-50px" mb="md">
          
          <Button 
            variant="gradient" 
            gradient={{ from: 'orange', to: 'red' }} 
            radius="xl"
            onClick={open}
            style={{ boxShadow: '0 4px 15px rgba(255, 94, 0, 0.3)' }}
          >
            Editar Perfil
          </Button>

          <Button color="red" variant="outline" onClick={onLogout}>Cerrar sesión</Button>
        </Group>

        <Stack gap="xs" mt="sm">
          
          
          <Group gap="xs">
            <Badge color="dark" size="sm" variant="transparent" pl={0}>
              DNI: {user.dni}
            </Badge>
            <Badge color="gray" size="sm" variant="light" radius="sm">
              Habitación: {user.roomNumber || 'No asignada'}
            </Badge>
          </Group>
          
          <Group mt="md" gap="xs">
            {user.isVegan && <Badge size="lg" color="green" variant="light" radius="xl">🌱 Vegano/a</Badge>}
            {user.isCeliac && <Badge size="lg" color="yellow" variant="light" radius="xl">🌾 Sin Gluten</Badge>}
            {user.lactoseIntolerant && <Badge size="lg" color="blue" variant="light" radius="xl">🥛 Sin Lactosa</Badge>}
            {user.eggAlergic && <Badge size="lg" color="orange" variant="light" radius="xl">🥚 Sin Huevo</Badge>}
            
            {!user.isVegan && !user.isCeliac && !user.lactoseIntolerant && !user.eggAlergic && (
              <Badge size="lg" color="gray" variant="light" radius="xl">🍽️ Dieta Estándar</Badge>
            )}

            {/* Añade esto dentro del formulario del Modal */}

          </Group>
        </Stack>
      </Card>

      {/* Menú Teórico del Fin de Semana */}
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

      {/* Formulario de Selección de Comidas */}
      <Paper withBorder shadow="md" p={30} radius="md" mb="xl">
        <Title order={3} mb="md">Selección de Comidas</Title>
        <Text size="xs" c="dimmed" mb="xl">El plazo límite para modificar las comidas finaliza el jueves a las 00:00.</Text>

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

            <Button type="submit" mt="md">Guardar Comidas</Button>
          </Stack>
        </form>

        {/* QR Code */}
        {qrToken && (
          <Paper mt="xl" p="lg" bg="gray.0" radius="md" withBorder>
            <Title order={4} ta="center" mb="md">Pase para Comedor</Title>
            <Group justify="center" mb="md">
              <QRCodeSVG 
                value={qrToken} 
                size={180} 
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"} 
              />
            </Group>
            <Text ta="center" size="xs" c="dimmed" tt="uppercase">Código manual</Text>
            <Text ta="center" size="sm" ff="monospace" fw={600}>{qrToken}</Text>
          </Paper>
        )}

        {/* Historial */}
        {history.length > 0 && (
          <Paper mt="xl" p="md" withBorder radius="md">
            <Title order={4} mb="sm">Tus Fichas Guardadas</Title>
            
            {history.map((sub, index) => (
              <Paper key={index} withBorder p="sm" mb="sm" bg="gray.0">
                <Text fw={600} mb="xs">
                  Semana: {sub.weekId} (QR: {sub.qrCodeToken ? sub.qrCodeToken.substring(0, 8) : '---'})
                </Text>
                
                <List size="sm" spacing="xs" icon="🍽️">
                  {Object.entries(sub.selection)
                    .filter(([_, value]) => value === true)
                    .map(([key]) => {
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

      {/* Modal para Editar Preferencias (Dietas) */}
      <Modal opened={opened} onClose={close} title="Mis Preferencias Alimentarias" centered radius="md">
        <Stack>
          <Checkbox 
            label="🌱 Dieta Vegana / Vegetariana" 
            checked={diet.isVegan}
            onChange={(e) => setDiet({ ...diet, isVegan: e.currentTarget.checked })}
          />
          <Checkbox 
            label="🌾 Intolerancia al Gluten (Celíaco)" 
            checked={diet.isCeliac}
            onChange={(e) => setDiet({ ...diet, isCeliac: e.currentTarget.checked })}
          />
          <Checkbox 
            label="🥛 Intolerancia a la Lactosa" 
            checked={diet.lactoseIntolerant}
            onChange={(e) => setDiet({ ...diet, lactoseIntolerant: e.currentTarget.checked })}
          />
          <Checkbox 
            label="🥚 Alérgico al huevo" 
            checked={diet.eggAlergic}
            onChange={(e) => setDiet({ ...diet, eggAlergic: e.currentTarget.checked })}
          />

          <TextInput 
              label="URL de tu foto de perfil" 
              placeholder="Pega aquí el enlace de tu foto"
              value={diet.avatarUrl}
              onChange={(e) => setDiet({ ...diet, avatarUrl: e.currentTarget.value })}
          />

          <Button 
            fullWidth 
            mt="md" 
            onClick={handleSaveDiet}
            variant="gradient" 
            gradient={{ from: 'orange', to: 'red' }}
            radius="xl"
          >
            Guardar Cambios
          </Button>
        </Stack>
      </Modal>
    </>
  );
}