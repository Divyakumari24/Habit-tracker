import { Box, Paper, Typography, Button, LinearProgress } from '@mui/material';
import { useState } from 'react';
import useHabitStore, { type Habit } from '../store/store';
import EditHabitDialog from './edit-habit-dialog.tsx';

const HabitList = () => {
  const { habits, removeHabit, toggleHabit, editHabit } = useHabitStore();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const getStreak = (habit: Habit) => {
    let streak = 0;
    const currentDate = new Date();

    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      if (habit.completedDates.includes(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  return (
    <Box
      sx={{
        marginTop: 4,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {habits.length === 0 ? (
        <Typography variant="body1" color="textSecondary" align="center">
          No habits added yet. Add your first habit above!
        </Typography>
      ) : (
        habits.map((habit) => {
          const streak = getStreak(habit);
          const progress = Math.min((streak / 30) * 100, 100);

          return (
            <Paper key={habit.id} elevation={3} sx={{ p: 1, marginBottom: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="h6">{habit.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {habit.frequency}
                  </Typography>
                  {habit.reminderTime ? (
                    <Typography variant="body2" color="textSecondary">
                      Reminder: {habit.reminderTime}
                    </Typography>
                  ) : null}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color={habit.completedDates.includes(today) ? 'success' : 'primary'}
                    size="small"
                    sx={{ minWidth: '40px', p: '8px' }}
                    onClick={() => toggleHabit(habit.id, today)}
                    title={habit.completedDates.includes(today) ? 'Completed Today' : 'Mark Completed'}
                  >
                    {habit.completedDates.includes(today) ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l5.59-5.59L18 10l-7 7z"
                        />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2a8 8 0 110 16 8 8 0 010-16z"
                        />
                      </svg>
                    )}
                  </Button>

                  <Button
                    variant="outlined"
                    color="info"
                    size="small"
                    sx={{ minWidth: '40px', p: '8px' }}
                    onClick={() => setEditingHabit(habit)}
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        fill="currentColor"
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                      <path fill="currentColor" d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ minWidth: '40px', p: '8px' }}
                    onClick={() => removeHabit(habit.id)}
                    title="Remove"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        fill="currentColor"
                        d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM6 9h2v9H6V9z"
                      />
                    </svg>
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mt: 0.5 }}>
                <Typography>Current Streak: {streak} day(s)</Typography>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            </Paper>
          );
        })
      )}
      
      <EditHabitDialog
        open={Boolean(editingHabit)}
        habit={editingHabit}
        onClose={() => setEditingHabit(null)}
        onSave={(name, frequency, reminderTime) => {
          if (editingHabit) {
            editHabit(editingHabit.id, name, frequency, reminderTime);
            setEditingHabit(null);
          }
        }}
      />
    </Box>
  );
};

export default HabitList;
