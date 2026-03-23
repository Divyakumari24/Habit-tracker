
import { Typography, Container, Box, Snackbar, Alert } from '@mui/material';
import './App.css'
import AddHabitForm from './components/add-habit-form';
import HabitList from './components/habit-list';
import HabitStats from './components/habit-stats.tsx';
import useHabitStore from './store/store'
import { useEffect } from 'react';

function App() {
  const { fetchHabits, habits, pushNotification, notification, clearNotification } = useHabitStore();

   useEffect(() => {
    fetchHabits();
   }, [fetchHabits]);

   useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      habits.forEach((habit) => {
        if (!habit.reminderTime || habit.reminderTime !== currentTime) {
          return;
        }

        const reminderKey = `reminder-${today}-${habit.id}-${currentTime}`;
        if (sessionStorage.getItem(reminderKey)) {
          return;
        }

        if (habit.completedDates.includes(today)) {
          pushNotification(`Great job! ${habit.name} is already completed for today.`, 'success');
          sessionStorage.setItem(reminderKey, 'completed');
          return;
        }

        pushNotification(`Reminder: Please complete ${habit.name}.`, 'warning');
        sessionStorage.setItem(reminderKey, 'shown');
      });
    };

    checkReminders();
    const intervalId = window.setInterval(checkReminders, 30000);

    return () => window.clearInterval(intervalId);
   }, [habits, pushNotification]);

  return (
    <Container>
      <Box>
        <Typography variant="h3" component="h6" gutterBottom align='center'>
          TO DO LIST
        </Typography>
        {/* form */}
        <AddHabitForm />
        {/* list */}
        <HabitList />
        {/* stats */}
        <HabitStats />
      </Box>

      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={2500}
        onClose={clearNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={clearNotification} severity={notification?.severity ?? 'success'} variant="filled">
          {notification?.message ?? ''}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App
