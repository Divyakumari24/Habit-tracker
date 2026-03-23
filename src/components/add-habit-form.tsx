import { TextField, Box, FormControl, InputLabel, Select, MenuItem, Button, InputAdornment } from '@mui/material';
import React, { useState } from 'react'
import useHabitStore from '../store/store';

const AddHabitForm = () => {
    const [name, setname] = useState('');
    const [frequency, setfrequency] = useState<'daily'|'weekly'|'monthly'>('daily');
    const [reminderTime, setReminderTime] = useState('');
    const [reminderPeriod, setReminderPeriod] = useState<'AM' | 'PM'>('AM');
    const [reminderError, setReminderError] = useState('');

   const{habits,addHabit} = useHabitStore();
   console.log(habits);

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
   
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim()){
            const normalizedReminder = normalizeReminderTime(reminderTime, reminderPeriod);
            if (!normalizedReminder) {
                setReminderError('Enter valid time like 930 or 1230');
                return;
            }

            addHabit(name, frequency, normalizedReminder);
            setname('');
            setReminderTime('');
            setReminderPeriod('AM');
            setReminderError('');
        }
    }

  return (
    <form onSubmit={handleSubmit}>
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
        }}>
            <TextField 
            label='Habit Name' 
            value={name}
            onChange={(e) =>
             setname(e.target.value)}
             placeholder='Enter Habit Name'
                fullWidth
            />
            <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select 
                    value={frequency}       
                    label="Frequency"
                    onChange={(e) => 
                    setfrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
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
                    if (reminderError) {
                        setReminderError('');
                    }
                }}
                placeholder="e.g. 930"
                helperText={reminderError || 'Type time and tap AM/PM'}
                error={Boolean(reminderError)}
                fullWidth
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
            <Button type='submit' variant='contained' color='primary'>
                    Add Habit
            </Button>
        </Box>
    </form>
  )
}

export default AddHabitForm;