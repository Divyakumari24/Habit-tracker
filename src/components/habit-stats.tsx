import { Box, Paper, Typography, Button } from '@mui/material';
import useHabitStore, { type Habit } from '../store/store';

const getCurrentStreak = (habit: Habit) => {
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

const HabitStats = () => {
  const { habits, deletedHabits, restoreDeletedHabit, deleteFromHistory } = useHabitStore();
  const today = new Date().toISOString().split('T')[0];

  const totalHabits = habits.length;
  const completedToday = habits.filter((habit) => habit.completedDates.includes(today)).length;
  const completionRate = totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);
  const bestStreak = habits.reduce((max, habit) => Math.max(max, getCurrentStreak(habit)), 0);
  const totalCompletions = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Stats
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Total Habits
          </Typography>
          <Typography variant="h6">{totalHabits}</Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Completed Today
          </Typography>
          <Typography variant="h6">
            {completedToday}/{totalHabits}
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Today Completion Rate
          </Typography>
          <Typography variant="h6">{completionRate}%</Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Best Current Streak
          </Typography>
          <Typography variant="h6">{bestStreak} day(s)</Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Total Check-ins
          </Typography>
          <Typography variant="h5">{totalCompletions}</Typography>
        </Paper>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Removed History
        </Typography>

        {deletedHabits.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No removed habits yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {deletedHabits.map((habit) => (
              <Paper key={`${habit.id}-${habit.removedAt}`} elevation={1} sx={{ p: 1.5 }}>
                <Typography variant="subtitle2">{habit.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {habit.frequency} habit - removed {new Date(habit.removedAt).toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    sx={{ minWidth: '32px', p: '4px' }}
                    onClick={() => restoreDeletedHabit(habit.id, habit.removedAt)}
                    title="Restore"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        fill="currentColor"
                        d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    sx={{ minWidth: '32px', p: '4px' }}
                    onClick={() => deleteFromHistory(habit.id, habit.removedAt)}
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        fill="currentColor"
                        d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM6 9h2v9H6V9z"
                      />
                    </svg>
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HabitStats;
