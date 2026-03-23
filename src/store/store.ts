
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  reminderTime: string;
  completedDates: string[];
  createdAt: string;
}

export interface DeletedHabit extends Habit {
  removedAt: string;
}

export interface HabitNotification {
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

interface HabitState {
  habits: Habit[];
  deletedHabits: DeletedHabit[];
  notification: HabitNotification | null;
  addHabit: (name: string, frequency: 'daily' | 'weekly' | 'monthly', reminderTime: string) => void;
  removeHabit: (id: string) => void;
  restoreDeletedHabit: (id: string, removedAt: string) => void;
  deleteFromHistory: (id: string, removedAt: string) => void;
  editHabit: (id: string, name: string, frequency: 'daily' | 'weekly' | 'monthly', reminderTime: string) => void;
  clearNotification: () => void;
  pushNotification: (message: string, severity?: HabitNotification['severity']) => void;
  toggleHabit: (id: string, date: string) => void;
  fetchHabits: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const useHabitStore = create<HabitState>()(
  devtools(
    persist(
      (set, get) => ({
        habits: [],
        deletedHabits: [],
        notification: null,
        isLoading: false,
        error: null,

        addHabit: (name, frequency, reminderTime) => 
          set((state) => ({
            habits: [
              ...state.habits,
              {
                id: Date.now().toString(),
                name,
                frequency,
                reminderTime,
                completedDates: [],
                createdAt: new Date().toISOString(),
              },
            ],
            notification: {
              message: `Habit "${name}" added successfully.`,
              severity: 'success',
            },
          })),
        
        removeHabit: (id) =>
          set((state) => {
            const habitToRemove = state.habits.find((habit) => habit.id === id);
            if (!habitToRemove) {
              return { habits: state.habits };
            }

            return {
              habits: state.habits.filter((habit) => habit.id !== id),
              deletedHabits: [
                {
                  ...habitToRemove,
                  removedAt: new Date().toISOString(),
                },
                ...state.deletedHabits,
              ].slice(0, 20),
              notification: {
                message: `Habit "${habitToRemove.name}" removed.`,
                severity: 'info',
              },
            };
          }),

        restoreDeletedHabit: (id, removedAt) =>
          set((state) => {
            const deletedHabit = state.deletedHabits.find(
              (habit) => habit.id === id && habit.removedAt === removedAt
            );

            if (!deletedHabit) {
              return {
                habits: state.habits,
                deletedHabits: state.deletedHabits,
              };
            }

            const { removedAt: _removedAt, ...restoredHabit } = deletedHabit;
            const idExists = state.habits.some((habit) => habit.id === restoredHabit.id);

            return {
              habits: [
                ...state.habits,
                {
                  ...restoredHabit,
                  id: idExists ? Date.now().toString() : restoredHabit.id,
                },
              ],
              deletedHabits: state.deletedHabits.filter(
                (habit) => !(habit.id === id && habit.removedAt === removedAt)
              ),
              notification: {
                message: `Habit "${restoredHabit.name}" restored.`,
                severity: 'success',
              },
            };
          }),

        deleteFromHistory: (id, removedAt) =>
          set((state) => {
            const deletedHabit = state.deletedHabits.find(
              (habit) => habit.id === id && habit.removedAt === removedAt
            );

            if (!deletedHabit) {
              return { deletedHabits: state.deletedHabits };
            }

            return {
              deletedHabits: state.deletedHabits.filter(
                (habit) => !(habit.id === id && habit.removedAt === removedAt)
              ),
              notification: {
                message: `"${deletedHabit.name}" permanently deleted from history.`,
                severity: 'info',
              },
            };
          }),

        editHabit: (id, name, frequency, reminderTime) =>
          set((state) => {
            const habitToEdit = state.habits.find((habit) => habit.id === id);
            if (!habitToEdit) {
              return { habits: state.habits };
            }

            return {
              habits: state.habits.map((habit) =>
                habit.id === id
                  ? {
                      ...habit,
                      name,
                      frequency,
                      reminderTime,
                    }
                  : habit
              ),
              notification: {
                message: `Habit "${name}" updated successfully.`,
                severity: 'success',
              },
            };
          }),

        clearNotification: () => set({ notification: null }),

        pushNotification: (message, severity = 'info') =>
          set({
            notification: {
              message,
              severity,
            },
          }),
        
        toggleHabit: (id, date) =>
          set((state) => {
            const targetHabit = state.habits.find((habit) => habit.id === id);
            if (!targetHabit) {
              return { habits: state.habits };
            }

            const isAlreadyCompleted = targetHabit.completedDates.includes(date);

            return {
              habits: state.habits.map((habit) =>
                habit.id === id
                  ? {
                      ...habit,
                      completedDates: isAlreadyCompleted
                        ? habit.completedDates.filter((d) => d !== date)
                        : [...habit.completedDates, date],
                    }
                  : habit
              ),
              notification: {
                message: isAlreadyCompleted
                  ? `Habit "${targetHabit.name}" marked as not completed.`
                  : `Habit "${targetHabit.name}" marked completed for today.`,
                severity: isAlreadyCompleted ? 'warning' : 'success',
              },
            };
          }),
        
        fetchHabits: async () => {
          set({ isLoading: true, error: null });
          try {
            const currentHabits = get().habits;
            if (currentHabits.length > 0) {
              set({ isLoading: false });
              return;
            }
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            // Mock data
            const mockedHabits: Habit[] = [
              {
                id: '1',
                name: 'Drink Water',
                frequency: 'daily',
                reminderTime: '09:00',
                completedDates: [],
                createdAt: new Date().toISOString(),
              },
              {
                id: '2',
                name: 'Exercise',
                frequency: 'daily',
                reminderTime: '18:00',
                completedDates: [],
                createdAt: new Date().toISOString(),
              },
            ];
            
            set({ habits: mockedHabits, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch habits', 
              isLoading: false 
            });
          }
        },
      }),
      {
        name: 'habit-storage', // unique name for storage key
        partialize: (state) => ({
          habits: state.habits,
          deletedHabits: state.deletedHabits,
        }),
      }
    )
  )
);

export default useHabitStore;