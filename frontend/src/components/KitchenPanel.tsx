import { useState, useEffect } from 'react';
import { Container, Title, Paper, Button, Group, Text, TextInput, SimpleGrid, Card } from '@mantine/core';
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
    // Pedimos las fichas solo para calcular los totales de cocina
    api.get('/meals/admin/all')
      .then(res => setSubmissions(res.data))
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

  const mealTotals = submissions.reduce((totales, sub) => {
    if (sub.selection.fridayDinner) totales.fridayDinner++;
    if (sub.selection.saturdayLunch) totales.saturdayLunch++;
    if (sub.selection.saturdayDinner) totales.saturdayDinner++;
    if (sub.selection.sundayLunch) totales.sundayLunch++;
    if (sub.selection.sundayDinner) totales.sundayDinner++;
    return totales;
  }, {
    fridayDinner: 0, saturdayLunch: 0, saturdayDinner: 0, sundayLunch: 0, sundayDinner: 0
  });

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
      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} mb="xl">
        <Card withBorder radius="md" p="md" bg="blue.0">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Viernes - Cena</Text>
          <Text size="xl" fw={900} c="blue.7">{mealTotals.fridayDinner}</Text>
        </Card>
        <Card withBorder radius="md" p="md" bg="orange.0">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Sábado - Comida</Text>
          <Text size="xl" fw={900} c="orange.7">{mealTotals.saturdayLunch}</Text>
        </Card>
        <Card withBorder radius="md" p="md" bg="orange.0">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Sábado - Cena</Text>
          <Text size="xl" fw={900} c="orange.7">{mealTotals.saturdayDinner}</Text>
        </Card>
        <Card withBorder radius="md" p="md" bg="teal.0">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Domingo - Comida</Text>
          <Text size="xl" fw={900} c="teal.7">{mealTotals.sundayLunch}</Text>
        </Card>
        <Card withBorder radius="md" p="md" bg="teal.0">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Domingo - Cena</Text>
          <Text size="xl" fw={900} c="teal.7">{mealTotals.sundayDinner}</Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}