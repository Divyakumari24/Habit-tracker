import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Button, InputAdornment } from '@mui/material';
import React, { useState, useEffect } from 'react';
import type { Habit } from '../store/store';

interface EditHabitDialogProps {
  open: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSave: (name: string, frequency: 'daily' | 'weekly' | 'monthly', reminderTime: string) => void;
}

const EditHabitDialog: React.FC<EditHabitDialogProps> = ({ open, habit, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderPeriod, setReminderPeriod] = useState<'AM' | 'PM'>('AM');
  const [error, setError] = useState('');

  useEffect(() => {
    if (habit && open) {
      setName(habit.name);
      setFrequency(habit.frequency);
      
      const [hours, minutes] = habit.reminderTime.split(':').map(Number);
      const isPm = hours >= 12;
      const displayHours = hours % 12 || 12;
      setReminderTime(`${displayHours}:${String(minutes).padStart(2, '0')}`);
      setReminderPeriod(isPm ? 'PM' : 'AM');
      setError('');
    } else if (!open) {
      // Reset state when dialog closes
      setName('');
      setFrequency('daily');
      setReminderTime('');
      setReminderPeriod('AM');
      setError('');
    }
  }, [habit, open]);

  const formatReminderInput = (value: string) => {
    const rawDigits = value.replace(/\D/g, '').slice(0, 4);
    if (!rawDigits) {
      return '';
    }

    let formatted = rawDigits;
    if (rawDigits.length >= 3) {
      const hoursPart = rawDigits.slice(0, rawDigits.length - 2);
      const minutesPart = rawDigits.slice(-2);
      formatted = `${hoursPart}:${minutesPart}`;
    }

    return formatted;
  };

  const normalizeReminderTime = (value: string, period: 'AM' | 'PM') => {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 3 || digits.length > 4) {
      return undefined;
    }

    const hoursRaw = Number(digits.length === 3 ? digits.slice(0, 1) : digits.slice(0, 2));
    const minutes = Number(digits.slice(-2));

    if (minutes < 0 || minutes > 59) {
      return undefined;
    }

    if (hoursRaw < 1 || hoursRaw > 12) {
      return undefined;
    }

    const hours = period === 'PM' ? (hoursRaw % 12) + 12 : hoursRaw % 12;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Habit name is required');
      return;
    }

    const normalizedReminder = normalizeReminderTime(reminderTime, reminderPeriod);
    if (!normalizedReminder) {
      setError('Enter valid time like 930 or 1230');
      return;
    }

    onSave(name, frequency, normalizedReminder);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Habit</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 2 }}>
        <TextField
          label="Habit Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          fullWidth
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#000',
              backgroundColor: '#fff',
              '& fieldset': {
                borderColor: '#ccc',
              },
              '&:hover fieldset': {
                borderColor: '#999',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              },
            },
            '& .MuiInputBase-input': {
              color: '#000 !important',
            },
          }}
          error={Boolean(error) && !name.trim()}
        />
        <FormControl fullWidth>
          <InputLabel>Frequency</InputLabel>
          <Select
            value={frequency}
            label="Frequency"
            onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Reminder Time"
          type="text"
          value={reminderTime}
          onChange={(e) => {
            setReminderTime(formatReminderInput(e.target.value));
            if (error) setError('');
          }}
          placeholder="e.g. 930"
          helperText={error || 'Type time and tap AM/PM'}
          fullWidth
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#000',
              backgroundColor: '#fff',
              '& fieldset': {
                borderColor: '#ccc',
              },
              '&:hover fieldset': {
                borderColor: '#999',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              },
            },
            '& .MuiInputBase-input': {
              color: '#000 !important',
            },
          }}
          error={Boolean(error)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setReminderPeriod((prev) => (prev === 'AM' ? 'PM' : 'AM'))}
                  >
                    {reminderPeriod}
                  </Button>
                </InputAdornment>
              ),
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditHabitDialog;
