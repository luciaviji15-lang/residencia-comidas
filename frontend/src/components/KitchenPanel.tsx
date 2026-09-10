import { useState, useEffect } from 'react';
import { Container, Title, Paper, Button, Group, Text, TextInput, SimpleGrid, Card, Accordion,Badge } from '@mantine/core';
import { Scanner } from '@yudiel/react-qr-scanner';
import { api } from '../services/api';

interface KitchenPanelProps {
  onLogout: () => void;
}

export default function KitchenPanel({ onLogout }: KitchenPanelProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
      // ¡Volvemos a poner admin/all para que coincida con tu backend!
      api.get('/meals/admin/all')
        .then(res => {
          console.log("Datos recibidos del backend:", res.data); // Añadimos el chivato
          setSubmissions(res.data);
        })
        .catch(err => console.error("Error cargando datos", err));
    }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanError('');
    setScanResult(null);
    try {
      const res = await api.get(`/meals/validate/${qrInput}`);
      setScanResult(res.data);
      setQrInput('');
    } catch (err) {
      setScanError('QR no encontrado o no válido ❌');
    }
  };

  const handleCameraScan = async (detectedText: string) => {
    setShowCamera(false); // Apagamos la cámara al detectar uno
    setQrInput(detectedText); // Lo ponemos en la caja visualmente
    setScanError('');
    setScanResult(null);
    
    try {
      const res = await api.get(`/meals/validate/${detectedText}`);
      setScanResult(res.data);
      setQrInput(''); // Limpiamos para el siguiente alumno
    } catch (err) {
      setScanError('QR no encontrado o no válido ❌');
    }
  };

// Función auxiliar para inicializar los contadores a 0
  const defaultStats = () => ({ total: 0, estandar: 0, vegano: 0, celiaco: 0, lactosa: 0 });

  const mealTotals = submissions.reduce((acc, sub) => {
    const user = sub.user || {};
    const isEstandar = !user.isVegan && !user.isCeliac && !user.lactoseIntolerant;

    // Función auxiliar para contar las dietas de una comida concreta
    const countMeal = (mealKey: string) => {
      if (sub.selection && sub.selection[mealKey]) {
        acc[mealKey].total++;
        if (isEstandar) acc[mealKey].estandar++;
        if (user.isVegan) acc[mealKey].vegano++;
        if (user.isCeliac) acc[mealKey].celiaco++;
        if (user.lactoseIntolerant) acc[mealKey].lactosa++;
      }
    };

    countMeal('fridayDinner');
    countMeal('saturdayLunch');
    countMeal('saturdayDinner');
    countMeal('sundayLunch');
    countMeal('sundayDinner');

    return acc;
  }, {
    fridayDinner: defaultStats(),
    saturdayLunch: defaultStats(),
    saturdayDinner: defaultStats(),
    sundayLunch: defaultStats(),
    sundayDinner: defaultStats()
  });

  // Configuración de los paneles para no repetir código visual
  const mealsConfig = [
    { key: 'fridayDinner', label: 'Viernes - Cena', color: 'blue' },
    { key: 'saturdayLunch', label: 'Sábado - Comida', color: 'orange' },
    { key: 'saturdayDinner', label: 'Sábado - Cena', color: 'orange' },
    { key: 'sundayLunch', label: 'Domingo - Comida', color: 'teal' },
    { key: 'sundayDinner', label: 'Domingo - Cena', color: 'teal' },
  ];

  return (
    <Container size="lg" my={40}>
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Panel de Cocina 🧑‍🍳</Title>
          <Text c="dimmed">Control de acceso y previsión de raciones</Text>
        </div>
        <Button color="red" variant="outline" onClick={onLogout}>Cerrar sesión</Button>
      </Group>

      {/* ESCÁNER QR */}
      <Paper withBorder shadow="sm" p="md" radius="md" mb="xl" bg="gray.0">
        <Title order={4} mb="sm">Escáner de Cafetería 📷</Title>
        <Group mb="md">
          <Button 
            onClick={() => setShowCamera(!showCamera)} 
            color={showCamera ? 'red' : 'blue'} 
            variant="light"
          >
            {showCamera ? 'Apagar Cámara ❌' : 'Activar Cámara del Móvil 📱'}
          </Button>
        </Group>

        {showCamera && (
          <div style={{ maxWidth: 300, margin: '0 auto', marginBottom: '20px', borderRadius: '10px', overflow: 'hidden' }}>
            <Scanner 
              onScan={(result: any) => {
                // La librería devuelve un array de resultados, cogemos el primero
                if (result && result.length > 0) {
                  handleCameraScan(result[0].rawValue);
                }
              }} 
            />
          </div>
        )}
        <form onSubmit={handleScan}>
          <Group align="flex-end">
            <TextInput 
              label="Pistola QR / Código manual" 
              placeholder="Haz clic aquí y escanea..." 
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              style={{ flex: 1 }}
              autoFocus
            />
            <Button type="submit" color="dark">Validar Pase</Button>
          </Group>
        </form>

        {scanError && <Text c="red" fw={700} mt="md">{scanError}</Text>}
        {scanResult && (
          <Paper mt="md" p="md" radius="sm" bg="green.1" withBorder>
            <Text c="green.9" fw={900} size="lg">✅ ¡Pase Válido!</Text>
            <Text><b>Habitación:</b> {scanResult.user?.roomNumber || 'N/D'}</Text>
            {/* Ocultamos el DNI por privacidad, cocina no lo necesita */}
          </Paper>
        )}
      </Paper>

      {/* RESUMEN DE RACIONES */}
      <Title order={4} mb="md">Previsión de Raciones Totales</Title>
      <Accordion variant="separated" radius="md" mb="xl">
        {mealsConfig.map((meal) => {
          // Extraemos los datos calculados para esta comida específica
          const stats = mealTotals[meal.key as keyof typeof mealTotals];
          
          return (
            <Accordion.Item key={meal.key} value={meal.key}>
              <Accordion.Control>
                <Group justify="space-between" pr="md">
                  <Text fw={700} size="lg">{meal.label}</Text>
                  <Badge size="lg" color={meal.color} variant="light">
                    {stats.total} raciones totales
                  </Badge>
                </Group>
              </Accordion.Control>
              
              <Accordion.Panel>
                <SimpleGrid cols={{ base: 2, sm: 4 }} mt="sm">
                  <Card withBorder padding="sm" radius="md" bg="gray.0">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>🍽️ Estándar</Text>
                    <Text size="xl" fw={900}>{stats.estandar}</Text>
                  </Card>
                  
                  {/* Cambiado bg="green.50" por bg="green.0" */}
                  <Card withBorder padding="sm" radius="md" bg="green.0">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>🌱 Vegano</Text>
                    <Text size="xl" fw={900} c="green.9">{stats.vegano}</Text>
                  </Card>
                  
                  {/* Cambiado bg="yellow.50" por bg="yellow.0" */}
                  <Card withBorder padding="sm" radius="md" bg="yellow.0">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>🌾 Sin Gluten</Text>
                    <Text size="xl" fw={900} c="yellow.9">{stats.celiaco}</Text>
                  </Card>
                  
                  {/* Cambiado bg="blue.50" por bg="blue.0" */}
                  <Card withBorder padding="sm" radius="md" bg="blue.0">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>🥛 Sin Lactosa</Text>
                    <Text size="xl" fw={900} c="blue.9">{stats.lactosa}</Text>
                  </Card>
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Container>
  );
}