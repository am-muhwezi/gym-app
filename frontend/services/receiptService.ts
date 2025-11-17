import { Payment, Client } from '../types';

export const generatePaymentReceipt = (payment: Payment, client: Client): string => {
  const paymentDate = new Date(payment.payment_date || payment.created_at);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Payment Receipt - ${payment.invoice_number || payment.id}</title>
      <style>
        @media print {
          @page { margin: 0; }
          body { margin: 1cm; }
        }
        body {
          font-family: 'Arial', sans-serif;
          max-width: 700px;
          margin: 0 auto;
          padding: 30px;
          color: #333;
          background: white;
        }
        .receipt-number {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
        }
        .section {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 15px 20px;
          margin-bottom: 15px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 12px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
        }
        .info-label {
          color: #6b7280;
        }
        .info-value {
          color: #111827;
          font-weight: 500;
          text-align: right;
        }
        .admin-info {
          color: #1e40af;
          font-size: 13px;
        }
        .timestamp {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }
        .timestamp-item {
          font-size: 13px;
          color: #6b7280;
        }
        .amount-section {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          text-align: center;
          padding: 25px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .amount-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 8px;
        }
        .amount-value {
          font-size: 42px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .paid-badge {
          display: inline-block;
          background: white;
          color: #059669;
          padding: 6px 20px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e9ecef;
        }
        .thank-you {
          font-size: 16px;
          font-weight: 600;
          color: #10b981;
          margin-bottom: 8px;
        }
        .footer-text {
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="receipt-number">Receipt #: ${payment.invoice_number || String(payment.id).slice(0, 12).toUpperCase()}</div>

      <!-- Processed By Section -->
      <div class="section">
        <div class="section-title">Processed By</div>
        <div class="admin-info">Admin:</div>
        <div class="admin-info" style="margin-top: 4px;">Email: admin@trainrup.com</div>
        <div class="timestamp">
          <div class="timestamp-item">Date: ${paymentDate.toLocaleDateString('en-KE')}</div>
          <div class="timestamp-item">Time: ${paymentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
        </div>
      </div>

      <!-- Member Details Section -->
      <div class="section">
        <div class="section-title">Member Details</div>
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${client.first_name} ${client.last_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Member ID:</span>
          <span class="info-value">${String(client.id).slice(0, 8).toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">${client.phone}</span>
        </div>
      </div>

      <!-- Payment Details Section -->
      <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="info-row">
          <span class="info-label">Service:</span>
          <span class="info-value">Gym Membership</span>
        </div>
        <div class="info-row">
          <span class="info-label">Plan:</span>
          <span class="info-value">${payment.description || 'Membership Payment'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Type:</span>
          <span class="info-value">Outdoor</span>
        </div>
        <div class="info-row">
          <span class="info-label">Payment Method:</span>
          <span class="info-value">${(payment.payment_method || payment.method || '').replace('_', '-').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
        </div>
        ${payment.mpesa_receipt_number ? `
        <div class="info-row">
          <span class="info-label">M-Pesa Receipt:</span>
          <span class="info-value">${payment.mpesa_receipt_number}</span>
        </div>
        ` : ''}
        ${payment.transaction_id ? `
        <div class="info-row">
          <span class="info-label">Transaction ID:</span>
          <span class="info-value">${payment.transaction_id}</span>
        </div>
        ` : ''}
      </div>

      <!-- Amount Section -->
      <div class="amount-section">
        <div class="amount-label">Total Amount:</div>
        <div class="amount-value">Ksh ${Number(payment.amount || 0).toLocaleString('en-KE')}</div>
        <div class="paid-badge">PAID</div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="thank-you">Thank you for your payment!</div>
        <div class="footer-text">
          Keep this receipt for your records<br>
          Generated on ${new Date().toLocaleDateString('en-KE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </div>
      </div>
    </body>
    </html>
  `;
};

export const printReceipt = (receiptHTML: string) => {
  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
};
