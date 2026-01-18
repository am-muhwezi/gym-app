import { Client } from './types';

const today = new Date();
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const INITIAL_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '555-0101',
    joinDate: '2023-01-15',
    goals: [
      { id: 'g1', description: 'Lose 10kg', targetDate: '2023-04-15', achieved: true },
      { id: 'g2', description: 'Run a 5k', targetDate: '2023-06-30', achieved: false }
    ],
    workouts: [
      { id: 'w1', name: 'Full Body Strength', description: '3x per week focusing on compound lifts.' },
    ],
    logs: [
      { id: 'l1', date: addDays(today, -7).toISOString().split('T')[0], notes: 'Great energy today. Increased squat weight.', performanceRating: 5 },
      { id: 'l2', date: addDays(today, -4).toISOString().split('T')[0], notes: 'Felt a bit tired, focused on form.', performanceRating: 3 },
    ],
    nextReviewDate: addDays(today, 14).toISOString().split('T')[0],
    payment: { status: 'Paid', amount: 150, nextDueDate: addDays(today, 30).toISOString().split('T')[0] },
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '555-0102',
    joinDate: '2023-03-01',
    goals: [
      { id: 'g3', description: 'Build muscle mass', targetDate: '2023-09-01', achieved: false },
    ],
    workouts: [
        { id: 'w2', name: 'Hypertrophy Program', description: '4-day split: Push, Pull, Legs, Upper.' },
    ],
    logs: [
        { id: 'l3', date: addDays(today, -5).toISOString().split('T')[0], notes: 'Excellent pull day. Nailed the pull-ups.', performanceRating: 5 },
    ],
    nextReviewDate: addDays(today, 21).toISOString().split('T')[0],
    payment: { status: 'Due', amount: 200, nextDueDate: addDays(today, 5).toISOString().split('T')[0] },
  },
  {
    id: '3',
    name: 'Mike Johnson',
    phone: '555-0103',
    joinDate: '2023-05-20',
    goals: [
        { id: 'g4', description: 'Improve cardiovascular health', targetDate: '2023-08-20', achieved: false },
    ],
    workouts: [
        { id: 'w3', name: 'Cardio & Core', description: 'HIIT sessions twice a week, with core exercises.' },
    ],
    logs: [],
    nextReviewDate: addDays(today, 5).toISOString().split('T')[0],
    payment: { status: 'Overdue', amount: 150, nextDueDate: addDays(today, -5).toISOString().split('T')[0] },
  },
];