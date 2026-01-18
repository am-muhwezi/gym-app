/**
 * PDF Service
 * Professional invoice, receipt, and workout plan PDF generation
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Client, Payment } from '../types';
import type { WorkoutPlan } from './workoutService';

// Extend jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export const pdfService = {
  /**
   * Generate professional invoice PDF
   */
  generateInvoice(client: Client, payment: Payment): void {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width;

    // Company Header - TrainrUp Green
    doc.setFillColor(16, 185, 129); // emerald-500 green
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('TrainrUp', 20, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Training Management', 20, 26);

    // INVOICE title
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 20, 27, { align: 'right' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Invoice details box
    doc.setFillColor(240, 240, 240);
    doc.rect(pageWidth - 70, 45, 50, 30, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice #', pageWidth - 65, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.invoice_number || `INV-${payment.id.slice(0, 8).toUpperCase()}`, pageWidth - 65, 58);

    doc.setFont('helvetica', 'bold');
    doc.text('Date', pageWidth - 65, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(payment.created_at).toLocaleDateString(), pageWidth - 65, 71);

    // Bill To section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${client.first_name} ${client.last_name}`, 20, 62);
    doc.text(client.email, 20, 68);
    doc.text(client.phone, 20, 74);

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 85, pageWidth - 20, 85);

    // Invoice items table
    const tableData = [
      [
        payment.description || 'Training Services',
        '1',
        `KES ${payment.amount.toLocaleString()}`,
        `KES ${payment.amount.toLocaleString()}`
      ]
    ];

    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Qty', 'Rate', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [16, 185, 129], // emerald-500
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      }
    });

    // Total section
    const finalY = doc.lastAutoTable.finalY || 95;

    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth - 90, finalY + 10, 70, 25, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', pageWidth - 85, finalY + 20);
    doc.text(`KES ${payment.amount.toLocaleString()}`, pageWidth - 25, finalY + 20, { align: 'right' });

    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text('Total:', pageWidth - 85, finalY + 30);
    doc.text(`KES ${payment.amount.toLocaleString()}`, pageWidth - 25, finalY + 30, { align: 'right' });

    doc.setTextColor(0, 0, 0);

    // Payment details
    if (payment.due_date) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Due Date:', 20, finalY + 20);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(payment.due_date).toLocaleDateString(), 50, finalY + 20);
    }

    // Payment status badge
    const status = payment.payment_status || payment.status;
    if (status === 'pending') {
      doc.setFillColor(254, 215, 170);
      doc.setTextColor(234, 88, 12);
    } else if (status === 'completed') {
      doc.setFillColor(187, 247, 208);
      doc.setTextColor(22, 163, 74);
    } else {
      doc.setFillColor(254, 202, 202);
      doc.setTextColor(220, 38, 38);
    }

    doc.roundedRect(20, finalY + 28, 40, 8, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(status.toUpperCase(), 40, finalY + 33, { align: 'center' });

    // Footer
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', pageWidth / 2, 270, { align: 'center' });
    doc.text('For questions, contact: sales@trainrup.com | +254 700 000 000', pageWidth / 2, 276, { align: 'center' });

    // Border
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, 277);

    // Save PDF
    const filename = `Invoice_${payment.invoice_number || payment.id.slice(0, 8)}_${client.first_name}_${client.last_name}.pdf`;
    doc.save(filename);
  },

  /**
   * Generate payment receipt PDF
   */
  generateReceipt(client: Client, payment: Payment): void {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width;

    // Header with TrainrUp green theme
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('TrainrUp - Professional Training Management', pageWidth / 2, 30, { align: 'center' });

    // Checkmark icon (text-based)
    doc.setFontSize(40);
    doc.text('✓', pageWidth / 2, 65, { align: 'center' });

    doc.setTextColor(16, 185, 129); // emerald-500
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Successful', pageWidth / 2, 80, { align: 'center' });

    // Receipt details box
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(20, 95, pageWidth - 40, 80, 5, 5, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Receipt info
    const leftCol = 30;
    const rightCol = pageWidth / 2 + 10;
    let yPos = 108;

    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt Number:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.invoice_number || `RCP-${payment.id.slice(0, 8).toUpperCase()}`, leftCol, yPos + 6);

    yPos += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Date:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(payment.payment_date || payment.created_at).toLocaleDateString(), leftCol, yPos + 6);

    yPos += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.payment_method || payment.method || 'M-Pesa', leftCol, yPos + 6);

    // Right column
    yPos = 108;
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', rightCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${client.first_name} ${client.last_name}`, rightCol, yPos + 6);

    yPos += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', rightCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(client.email, rightCol, yPos + 6);

    if (payment.transaction_id || payment.mpesa_receipt_number) {
      yPos += 18;
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction ID:', rightCol, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.transaction_id || payment.mpesa_receipt_number || '', rightCol, yPos + 6);
    }

    // Amount paid - highlighted
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.roundedRect(20, 185, pageWidth - 40, 30, 5, 5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount Paid', pageWidth / 2, 197, { align: 'center' });

    doc.setFontSize(24);
    doc.text(`KES ${payment.amount.toLocaleString()}`, pageWidth / 2, 209, { align: 'center' });

    // Description
    if (payment.description) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Description:', 20, 230);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.description, 20, 237);
    }

    // Footer
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.text('This is a computer-generated receipt and does not require a signature.', pageWidth / 2, 265, { align: 'center' });
    doc.text('For inquiries, contact: sales@trainrup.com | +254 700 000 000', pageWidth / 2, 272, { align: 'center' });

    // Border
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, 277);

    // Save PDF
    const filename = `Receipt_${payment.invoice_number || payment.id.slice(0, 8)}_${client.first_name}_${client.last_name}.pdf`;
    doc.save(filename);
  },

  /**
   * Generate workout plan PDF
   */
  generateWorkoutPlan(client: Client, workoutPlans: WorkoutPlan[]): void {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width;

    // Header - TrainrUp Green
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('WORKOUT PROGRAM', 20, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('TrainrUp - Professional Training Management', 20, 28);

    // Client info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Client: ${client.first_name} ${client.last_name}`, 20, 50);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, 50, { align: 'right' });

    let yPos = 65;

    // Group by day
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedPlans = workoutPlans.sort((a, b) => {
      const aIndex = daysOrder.indexOf(a.day_of_week || '');
      const bIndex = daysOrder.indexOf(b.day_of_week || '');
      return aIndex - bIndex;
    });

    sortedPlans.forEach((plan, index) => {
      // Check if we need a new page
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      // Day header
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(20, yPos, pageWidth - 40, 12, 2, 2, 'F');

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(plan.day_of_week || `Day ${index + 1}`, 25, yPos + 8);

      if (plan.focus_area) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Focus: ${plan.focus_area}`, pageWidth - 25, yPos + 8, { align: 'right' });
      }

      yPos += 18;

      // Exercises table
      if (plan.exercises && plan.exercises.length > 0) {
        const exerciseData = plan.exercises.map((ex, idx) => [
          (idx + 1).toString(),
          ex.name,
          `${ex.sets || '-'}`,
          `${ex.reps || '-'}`,
          ex.rest_period_seconds ? `${ex.rest_period_seconds}s` : '-',
          ex.description || '-'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Exercise', 'Sets', 'Reps', 'Rest', 'Notes']],
          body: exerciseData,
          theme: 'grid',
          headStyles: {
            fillColor: [16, 185, 129], // emerald-500
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 8,
            cellPadding: 3
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 60 },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 45 }
          },
          margin: { left: 20, right: 20 }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('No exercises assigned', 25, yPos);
        yPos += 15;
      }
    });

    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Follow your program consistently and track your progress.', pageWidth / 2, 285, { align: 'center' });

    // Save PDF
    const filename = `Workout_Program_${client.first_name}_${client.last_name}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  },

  /**
   * Generate comprehensive client report (all data)
   */
  generateClientReport(
    client: Client,
    workoutPlans: WorkoutPlan[],
    payments: Payment[]
  ): void {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width;

    // Cover Page - TrainrUp Green
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, pageWidth, 297, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT REPORT', pageWidth / 2, 100, { align: 'center' });

    doc.setFontSize(20);
    doc.text(`${client.first_name} ${client.last_name}`, pageWidth / 2, 130, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 150, { align: 'center' });

    doc.setFontSize(10);
    doc.text('TrainrUp - Professional Training Management', pageWidth / 2, 270, { align: 'center' });

    // Page 2 - Client Profile
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Client Profile', 20, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let y = 35;

    doc.setFont('helvetica', 'bold');
    doc.text('Name:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${client.first_name} ${client.last_name}`, 60, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(client.email, 60, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(client.phone, 60, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Member Since:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(client.created_at).toLocaleDateString(), 60, y);

    // Workout Summary
    if (workoutPlans.length > 0) {
      y += 20;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Workout Program Summary', 20, y);

      y += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total workout days: ${workoutPlans.length}`, 20, y);
    }

    // Payment Summary
    if (payments.length > 0) {
      y += 20;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Summary', 20, y);

      const totalPaid = payments
        .filter(p => (p.payment_status || p.status) === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalPending = payments
        .filter(p => (p.payment_status || p.status) === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      y += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Paid: KES ${totalPaid.toLocaleString()}`, 20, y);
      y += 6;
      doc.text(`Pending: KES ${totalPending.toLocaleString()}`, 20, y);
    }

    // Save PDF
    const filename = `Client_Report_${client.first_name}_${client.last_name}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }
};
