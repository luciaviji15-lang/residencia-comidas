import { useEffect, useState } from 'react';
import { Table, Title, Container, Paper, Text, Button, Group } from '@mantine/core';
import { api } from '../services/api';

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    api.get('/meals/admin/summary')
      .then((res) => setSubmissions(res.data))
      .catch((err) => console.error('Error al cargar resumen:', err));
  }, []);

  return (
    <Container size={900} my={40}>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Panel de Cocina / Dirección</Title>
        <Button color="red" variant="outline" onClick={onLogout}>Cerrar sesión</Button>
      </Group>

      <Paper withBorder shadow="md" p={20} radius="md">
        <Title order={3} mb="md">Resumen de Fichas de Fin de Semana</Title>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>DNI</Table.Th>
              <Table.Th>Habitación</Table.Th>
              <Table.Th>Viernes C.</Table.Th>
              <Table.Th>Sábado M.</Table.Th>
              <Table.Th>Sábado C.</Table.Th>
              <Table.Th>Domingo M.</Table.Th>
              <Table.Th>Domingo C.</Table.Th>
              <Table.Th>Token QR</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {submissions.map((sub) => (
              <Table.Tr key={sub.id}>
                <Table.Td>{sub.user?.dni}</Table.Td>
                <Table.Td>{sub.user?.roomNumber || 'N/D'}</Table.Td>
                <Table.Td>{sub.selection.fridayDinner ? 'Sí' : '-'}</Table.Td>
                <Table.Td>{sub.selection.saturdayLunch ? 'Sí' : '-'}</Table.Td>
                <Table.Td>{sub.selection.saturdayDinner ? 'Sí' : '-'}</Table.Td>
                <Table.Td>{sub.selection.sundayLunch ? 'Sí' : '-'}</Table.Td>
                <Table.Td>{sub.selection.sundayDinner ? 'Sí' : '-'}</Table.Td>
                <Table.Td><Text size="xs" ff="monospace">{sub.qrCodeToken.substring(0, 8)}...</Text></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}