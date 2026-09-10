import { useState } from 'react';
import { Card, Avatar, Text, Group, Badge, Stack, Button, Modal, Checkbox } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { api } from '../services/api';

interface StudentProfileProps {
  user: any;
}

export default function StudentProfile({ user }: StudentProfileProps) {
  const avatarUrl = user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.dni}`;
  
  // hook de Mantine para controlar si la ventana está abierta o cerrada
  const [opened, { open, close }] = useDisclosure(false);
  
  // Estado para guardar temporalmente lo que el usuario va marcando
  const [diet, setDiet] = useState({
    isVegan: user.isVegan || false,
    isCeliac: user.isCeliac || false,
    lactoseIntolerant: user.lactoseIntolerant || false,
    eggAlergic : user.eggAlergic || false
  });

    
    const handleSave = async () => {
        try {
        const userId = user.id || user.sub; 
        await api.patch(`/users/${userId}/diet`, diet);
        
        // 1. Leemos el usuario que teníamos guardado
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // 2. Le inyectamos las nuevas dietas
        const updatedUser = { ...storedUser, ...diet };
        
        // 3. Lo volvemos a guardar en la memoria
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // 4. Ahora sí, recargamos la página y ya saldrá actualizado
        window.location.reload(); 
        } catch (error) {
        console.error("Error al guardar:", error);
        }
    };

  return (
    <>
      <Card withBorder radius="md" p="xl" bg="gray.0" mb="xl">
        <Group wrap="nowrap" justify="space-between" align="flex-start">
          <Group wrap="nowrap">
            <Avatar src={avatarUrl} size={120} radius="100%" />
            <Stack gap="xs">
              <Text fz="xl" fw={700}>Alumno/a</Text>
              <Text c="dimmed" fw={500}>DNI: {user.dni}</Text>
              <Text c="dimmed" fw={500}>Habitación: {user.roomNumber || 'No asignada'}</Text>
              
              <Group mt="sm">
                {user.isVegan && <Badge color="green" variant="light">🌱 Vegano/a</Badge>}
                {user.isCeliac && <Badge color="yellow" variant="light">🌾 Sin Gluten</Badge>}
                {user.lactoseIntolerant && <Badge color="blue" variant="light">🥛 Sin Lactosa</Badge>}
                {user.eggAlergic && <Badge color="blue" variant="light"> 🥚 Alérgico al huevo</Badge>}
                {!user.isVegan && !user.isCeliac && !user.lactoseIntolerant && (
                  <Badge color="gray" variant="light">🍽️ Dieta Estándar</Badge>
                )}
              </Group>
            </Stack>
          </Group>
          
          {/* Botón que abre el modal */}
          <Button variant="light" color="blue" onClick={open}>Editaraaa</Button>
        </Group>
      </Card>

      {/* La ventana flotante (Modal) */}
      <Modal opened={opened} onClose={close} title="Mis Preferencias Alimentarias" centered>
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
            label=" 🥚 Alérgico al huevo" 
            checked={diet.eggAlergic}
            onChange={(e) => setDiet({ ...diet, eggAlergic: e.currentTarget.checked })}
          />

          <Button fullWidth mt="md" onClick={handleSave}>Guardar Cambios</Button>

    
        </Stack>
      </Modal>
    </>
  );
}