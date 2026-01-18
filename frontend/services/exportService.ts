/**
 * Export Service
 * Handles exporting client data to various formats (CSV, JSON)
 */

import { Client, Goal, Payment, ClientProgress, Log } from '../types';
import type { WorkoutPlan } from './workoutService';

export const exportService = {
  /**
   * Export data to CSV format
   */
  exportToCSV(data: any[], filename: string) {
    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const cell = row[header];
          // Handle cells with commas, quotes, or newlines
          if (cell === null || cell === undefined) return '';
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  },

  /**
   * Export data to JSON format
   */
  exportToJSON(data: any, filename: string) {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  },

  /**
   * Download file helper
   */
  downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export client profile
   */
  exportProfile(client: Client, format: 'csv' | 'json' = 'json') {
    const profileData = {
      full_name: `${client.first_name} ${client.last_name}`,
      email: client.email,
      phone: client.phone,
      date_of_birth: client.dob || '',
      gender: client.gender || '',
      status: client.status,
      member_since: client.created_at,
      membership_start: client.membership_start_date || '',
      membership_end: client.membership_end_date || '',
      notes: client.notes || '',
    };

    const filename = `${client.first_name}_${client.last_name}_profile_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      this.exportToCSV([profileData], filename);
    } else {
      this.exportToJSON(profileData, filename);
    }
  },

  /**
   * Export client goals
   */
  exportGoals(client: Client, goals: Goal[], format: 'csv' | 'json' = 'json') {
    const goalsData = goals.map(goal => ({
      client_name: `${client.first_name} ${client.last_name}`,
      goal_type: goal.goal_type,
      title: goal.title || '',
      description: goal.description,
      current_value: goal.current_value || '',
      target_value: goal.target_value || '',
      target_date: goal.target_date || '',
      status: goal.status,
      created_at: goal.created_at,
      completed_at: goal.completed_at || '',
    }));

    const filename = `${client.first_name}_${client.last_name}_goals_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      this.exportToCSV(goalsData, filename);
    } else {
      this.exportToJSON(goalsData, filename);
    }
  },

  /**
   * Export client payments
   */
  exportPayments(client: Client, payments: Payment[], format: 'csv' | 'json' = 'json') {
    const paymentsData = payments.map(payment => ({
      client_name: `${client.first_name} ${client.last_name}`,
      invoice_number: payment.invoice_number || `#${payment.id.slice(0, 8)}`,
      amount: payment.amount,
      payment_method: payment.payment_method || payment.method,
      payment_status: payment.payment_status || payment.status,
      description: payment.description || '',
      due_date: payment.due_date || '',
      payment_date: payment.payment_date || '',
      transaction_id: payment.transaction_id || '',
      mpesa_receipt: payment.mpesa_receipt_number || '',
      created_at: payment.created_at,
    }));

    const filename = `${client.first_name}_${client.last_name}_payments_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      this.exportToCSV(paymentsData, filename);
    } else {
      this.exportToJSON(paymentsData, filename);
    }
  },

  /**
   * Export client progress/measurements
   */
  exportProgress(client: Client, progress: ClientProgress[], format: 'csv' | 'json' = 'json') {
    const progressData = progress.map(record => ({
      client_name: `${client.first_name} ${client.last_name}`,
      recorded_date: record.recorded_date,
      weight_kg: record.weight || '',
      body_fat_percentage: record.body_fat_percentage || '',
      muscle_mass_kg: record.muscle_mass || '',
      chest_cm: record.chest || '',
      waist_cm: record.waist || '',
      hips_cm: record.hips || '',
      arms_cm: record.arms || '',
      thighs_cm: record.thighs || '',
      notes: record.notes || '',
    }));

    const filename = `${client.first_name}_${client.last_name}_progress_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      this.exportToCSV(progressData, filename);
    } else {
      this.exportToJSON(progressData, filename);
    }
  },

  /**
   * Export workout plans
   */
  exportWorkouts(client: Client, workouts: WorkoutPlan[], format: 'csv' | 'json' = 'json') {
    if (format === 'json') {
      const filename = `${client.first_name}_${client.last_name}_workouts_${new Date().toISOString().split('T')[0]}`;
      this.exportToJSON(workouts, filename);
      return;
    }

    // For CSV, flatten the exercises
    const workoutsData: any[] = [];
    workouts.forEach(plan => {
      if (plan.exercises.length === 0) {
        workoutsData.push({
          client_name: `${client.first_name} ${client.last_name}`,
          plan_name: plan.name,
          plan_description: plan.description || '',
          exercise_name: '',
          sets: '',
          reps: '',
          rest_seconds: '',
          exercise_description: '',
        });
      } else {
        plan.exercises.forEach(exercise => {
          workoutsData.push({
            client_name: `${client.first_name} ${client.last_name}`,
            plan_name: plan.name,
            plan_description: plan.description || '',
            exercise_name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_seconds: exercise.rest_period_seconds,
            exercise_description: exercise.description || '',
          });
        });
      }
    });

    const filename = `${client.first_name}_${client.last_name}_workouts_${new Date().toISOString().split('T')[0]}`;
    this.exportToCSV(workoutsData, filename);
  },

  /**
   * Export daily logs
   */
  exportLogs(client: Client, logs: Log[], format: 'csv' | 'json' = 'json') {
    const logsData = logs.map(log => ({
      client_name: `${client.first_name} ${client.last_name}`,
      date: log.date,
      notes: log.notes,
      performance_rating: log.performance_rating || '',
      created_at: log.created_at,
    }));

    const filename = `${client.first_name}_${client.last_name}_logs_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      this.exportToCSV(logsData, filename);
    } else {
      this.exportToJSON(logsData, filename);
    }
  },

  /**
   * Export complete client data (all categories)
   */
  exportAll(
    client: Client,
    goals: Goal[],
    payments: Payment[],
    progress: ClientProgress[],
    workouts: WorkoutPlan[],
    logs: Log[]
  ) {
    const completeData = {
      profile: {
        full_name: `${client.first_name} ${client.last_name}`,
        email: client.email,
        phone: client.phone,
        date_of_birth: client.dob || '',
        gender: client.gender || '',
        status: client.status,
        member_since: client.created_at,
        membership_start: client.membership_start_date || '',
        membership_end: client.membership_end_date || '',
        notes: client.notes || '',
      },
      goals: goals,
      payments: payments,
      progress: progress,
      workouts: workouts,
      logs: logs,
      exported_at: new Date().toISOString(),
    };

    const filename = `${client.first_name}_${client.last_name}_complete_data_${new Date().toISOString().split('T')[0]}`;
    this.exportToJSON(completeData, filename);
  },
};
