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

  // 1. Identificamos cuál es la semana más reciente (la actual)
  const latestWeekId = submissions.reduce((max, sub) => (sub.weekId > max ? sub.weekId : max), "");

  // 2. Filtramos para que la pantalla principal SOLO muestre la semana actual
  const currentWeekSubmissions = submissions.filter(sub => sub.weekId === latestWeekId);

  // 3. Calculamos los totales exclusivamente con la semana actual
  const mealTotals = currentWeekSubmissions.reduce((totales, sub) => {
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

  const downloadCSV = (onlyCurrentWeek: boolean = false) => {
    const dataToExport = onlyCurrentWeek 
      ? currentWeekSubmissions
      : submissions;

    if (dataToExport.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    let csvContent = "Semana,DNI,Habitacion,Viernes Cena,Sabado Comida,Sabado Cena,Domingo Comida,Domingo Cena,Vegano,Sin Gluten,Sin Lactosa,Sin Huevo\n";

    const resumen = {
      viernesCena: 0, sabadoComida: 0, sabadoCena: 0, domingoComida: 0, domingoCena: 0
    };
    
    const resumenDietas: Record<string, number> = {};

    dataToExport.forEach(sub => {
      const u = sub.user || {};
      
      if (sub.selection.fridayDinner) resumen.viernesCena++;
      if (sub.selection.saturdayLunch) resumen.sabadoComida++;
      if (sub.selection.saturdayDinner) resumen.sabadoCena++;
      if (sub.selection.sundayLunch) resumen.domingoComida++;
      if (sub.selection.sundayDinner) resumen.domingoCena++;

      const pideComida = sub.selection.fridayDinner || sub.selection.saturdayLunch || sub.selection.saturdayDinner || sub.selection.sundayLunch || sub.selection.sundayDinner;
      
      if (pideComida) {
        let perfilArray = [];
        if (u.isVegan) perfilArray.push("Vegano");
        if (u.isCeliac) perfilArray.push("Sin Gluten");
        if (u.lactoseIntolerant) perfilArray.push("Sin Lactosa");
        if (u.eggAlergic) perfilArray.push("Sin Huevo");
        
        let nombrePerfil = perfilArray.length > 0 ? perfilArray.join(" + ") : "Estándar";
        resumenDietas[nombrePerfil] = (resumenDietas[nombrePerfil] || 0) + 1;
      }

      const row = [
        sub.weekId,
        u.dni || 'Sin DNI',
        u.roomNumber || 'N/D',
        sub.selection.fridayDinner ? 'SI' : 'NO',
        sub.selection.saturdayLunch ? 'SI' : 'NO',
        sub.selection.saturdayDinner ? 'SI' : 'NO',
        sub.selection.sundayLunch ? 'SI' : 'NO',
        sub.selection.sundayDinner ? 'SI' : 'NO',
        u.isVegan ? 'SI' : 'NO',
        u.isCeliac ? 'SI' : 'NO',
        u.lactoseIntolerant ? 'SI' : 'NO',
        u.eggAlergic ? 'SI' : 'NO'
      ];
      csvContent += row.join(",") + "\n";
    });

    csvContent += "\n\n"; 
    csvContent += "--- RESUMEN TOTAL DE RACIONES ---\n";
    csvContent += "Turno,Total\n";
    csvContent += `Viernes Cena,${resumen.viernesCena}\n`;
    csvContent += `Sabado Comida,${resumen.sabadoComida}\n`;
    csvContent += `Sabado Cena,${resumen.sabadoCena}\n`;
    csvContent += `Domingo Comida,${resumen.domingoComida}\n`;
    csvContent += `Domingo Cena,${resumen.domingoCena}\n`;
    
    csvContent += "\n";
    csvContent += "--- PERFILES DE DIETA ESPECIAL (Alumnos que comen) ---\n";
    csvContent += "Perfil,Total Alumnos\n";
    
    Object.entries(resumenDietas).forEach(([perfil, cantidad]) => {
      if (perfil !== "Estándar") {
        csvContent += `${perfil},${cantidad}\n`;
      }
    });

    const prefix = onlyCurrentWeek ? `menus_${latestWeekId}` : `historico_completo`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${prefix}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container size="lg" my={40}>
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Area de Dirección</Title>
          <Text c="dimmed">Información de menús y exportación para cocina (Semana: <Badge size="lg">{latestWeekId || 'Cargando...'}</Badge>)</Text>
        </div>
        <Button color="red" variant="outline" onClick={onLogout}>Cerrar sesión</Button>
      </Group>

      <Title order={4} mb="md">Resumen Total para Cocina (Semana Actual)</Title>
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

      <Paper withBorder shadow="md" p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Fichas de la Semana ({currentWeekSubmissions.length})</Title>
          
          <Group>
            <Button 
              variant="default" 
              onClick={() => downloadCSV(false)}
            >
              Descargar Historial
            </Button>
            <Button 
              variant="gradient" 
              gradient={{ from: 'teal', to: 'green' }} 
              onClick={() => downloadCSV(true)}
            >
              CSV Semana Actual
            </Button>
          </Group>
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
            {currentWeekSubmissions.map((sub) => (
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