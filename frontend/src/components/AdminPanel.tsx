import { useState, useEffect } from 'react';
import { Container, Title, Paper, Table, Button, Group, Text, Badge, Card, SimpleGrid } from '@mantine/core';
import { api } from '../services/api';

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    // Pedimos todas las fichas de todos los alumnos
    api.get('/meals/admin/all')
      .then(res => setSubmissions(res.data))
      .catch(err => console.error("Error cargando datos del admin", err));
  }, []);

  // Calculamos los totales sumando las selecciones
  const mealTotals = submissions.reduce((totales, sub) => {
    if (sub.selection.fridayDinner) totales.fridayDinner++;
    if (sub.selection.saturdayLunch) totales.saturdayLunch++;
    if (sub.selection.saturdayDinner) totales.saturdayDinner++;
    if (sub.selection.sundayLunch) totales.sundayLunch++;
    if (sub.selection.sundayDinner) totales.sundayDinner++;
    return totales;
  }, {
    fridayDinner: 0,
    saturdayLunch: 0,
    saturdayDinner: 0,
    sundayLunch: 0,
    sundayDinner: 0
  });

  // Función mágica que convierte los datos en un archivo CSV y lo descarga
  const downloadCSV = () => {
    // 1. Cabeceras del Excel
    let csvContent = "Semana,DNI,Habitacion,Viernes Cena,Sabado Comida,Sabado Cena,Domingo Comida,Domingo Cena\n";

    // 2. Rellenar las filas
    submissions.forEach(sub => {
      const row = [
        sub.weekId,
        sub.user?.dni || 'Sin DNI',
        sub.user?.roomNumber || 'N/D',
        sub.selection.fridayDinner ? 'SI' : 'NO',
        sub.selection.saturdayLunch ? 'SI' : 'NO',
        sub.selection.saturdayDinner ? 'SI' : 'NO',
        sub.selection.sundayLunch ? 'SI' : 'NO',
        sub.selection.sundayDinner ? 'SI' : 'NO'
      ];
      csvContent += row.join(",") + "\n";
    });

    // 3. Crear el archivo y forzar la descarga en el navegador
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `comidas_residencia_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container size="lg" my={40}>
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Panel de Dirección</Title>
          <Text c="dimmed">Gestión de menús y exportación a cocina</Text>
        </div>
        <Button color="red" variant="outline" onClick={onLogout}>Cerrar sesión</Button>
      </Group>

      {/* ---> NUEVO BLOQUE DE RESUMEN PARA COCINA <--- */}
      <Title order={4} mb="md">Resumen Total para Cocina</Title>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} mb="xl">
        <Card withBorder radius="md" p="md" bg="blue.0">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Viernes - Cena</Text>
          <Text size="xl" fw={900} c="blue.7">{mealTotals.fridayDinner} raciones</Text>
        </Card>

        <Card withBorder radius="md" p="md" bg="orange.0">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Sábado - Comida</Text>
          <Text size="xl" fw={900} c="orange.7">{mealTotals.saturdayLunch} raciones</Text>
        </Card>

        <Card withBorder radius="md" p="md" bg="orange.0">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Sábado - Cena</Text>
          <Text size="xl" fw={900} c="orange.7">{mealTotals.saturdayDinner} raciones</Text>
        </Card>

        <Card withBorder radius="md" p="md" bg="teal.0">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Domingo - Comida</Text>
          <Text size="xl" fw={900} c="teal.7">{mealTotals.sundayLunch} raciones</Text>
        </Card>

        <Card withBorder radius="md" p="md" bg="teal.0">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Domingo - Cena</Text>
          <Text size="xl" fw={900} c="teal.7">{mealTotals.sundayDinner} raciones</Text>
        </Card>
      </SimpleGrid>
      {/* ------------------------------------------- */}

      {/* Aquí debajo ya va tu <Paper> con la tabla y el botón de CSV que ya tenías */}
      <Paper withBorder shadow="md" p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Fichas Recibidas ({submissions.length})</Title>
          <Button color="green" onClick={downloadCSV}>
            Descargar Excel (CSV)
          </Button>
        </Group>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Semana</Table.Th>
              <Table.Th>DNI Alumno</Table.Th>
              <Table.Th>Hab.</Table.Th>
              <Table.Th>V - Cena</Table.Th>
              <Table.Th>S - Com</Table.Th>
              <Table.Th>S - Cena</Table.Th>
              <Table.Th>D - Com</Table.Th>
              <Table.Th>D - Cena</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {submissions.map((sub) => (
              <Table.Tr key={sub.id}>
                <Table.Td><Badge>{sub.weekId}</Badge></Table.Td>
                <Table.Td fw={500}>{sub.user?.dni}</Table.Td>
                <Table.Td>{sub.user?.roomNumber}</Table.Td>
                <Table.Td>{sub.selection.fridayDinner ? '✅' : '❌'}</Table.Td>
                <Table.Td>{sub.selection.saturdayLunch ? '✅' : '❌'}</Table.Td>
                <Table.Td>{sub.selection.saturdayDinner ? '✅' : '❌'}</Table.Td>
                <Table.Td>{sub.selection.sundayLunch ? '✅' : '❌'}</Table.Td>
                <Table.Td>{sub.selection.sundayDinner ? '✅' : '❌'}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}