import { Platform } from 'react-native';

export interface ReportData {
  patientName: string;
  patientAge: number;
  patientRole: string;
  statusBadgeText: string;
  overallAdherence: number;
  ratingText: string;
  weeklyData: { day: string; percent: number }[];
  medications: { name: string; percent: number; color?: string }[];
  generatedDate?: string;
}

export function generateReportHtml(data: ReportData): string {
  const dateStr = data.generatedDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const weeklyRows = data.weeklyData
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB; font-weight: 600; color: #374151;">${item.day}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB; text-align: right; font-weight: 700; color: #154D38;">${item.percent}%</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB; width: 50%;">
        <div style="background-color: #E8F2EC; border-radius: 6px; height: 10px; overflow: hidden;">
          <div style="background-color: #10B981; width: ${item.percent}%; height: 100%; border-radius: 6px;"></div>
        </div>
      </td>
    </tr>
  `
    )
    .join('');

  const medRows = data.medications
    .map(
      (med) => `
    <tr>
      <td style="padding: 12px 14px; border-bottom: 1px solid #E5E7EB; font-weight: 600; color: #111827;">${med.name}</td>
      <td style="padding: 12px 14px; border-bottom: 1px solid #E5E7EB; text-align: right; font-weight: 700; color: ${med.percent >= 80 ? '#10B981' : '#F59E0B'};">${med.percent}%</td>
      <td style="padding: 12px 14px; border-bottom: 1px solid #E5E7EB; width: 45%;">
        <div style="background-color: #F3F4F6; border-radius: 6px; height: 10px; overflow: hidden;">
          <div style="background-color: ${med.percent >= 80 ? '#10B981' : '#F59E0B'}; width: ${med.percent}%; height: 100%; border-radius: 6px;"></div>
        </div>
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>MediCare Adherence Report - ${data.patientName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1F2937;
          background-color: #F9FAFB;
          margin: 0;
          padding: 24px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          padding: 36px;
          border: 1px solid #E5E7EB;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #154D38;
          padding-bottom: 20px;
          margin-bottom: 28px;
        }
        .brand-title {
          font-size: 28px;
          font-weight: 800;
          color: #154D38;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .brand-sub {
          font-size: 13px;
          color: #6B7280;
          margin-top: 4px;
        }
        .report-badge {
          background-color: #E8F2EC;
          color: #154D38;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .patient-box {
          background: #F3FAF7;
          border: 1px solid #C2E2D3;
          border-radius: 12px;
          padding: 18px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }
        .patient-name {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .patient-meta {
          font-size: 13px;
          color: #4B5563;
          margin-top: 4px;
        }
        .status-badge {
          background-color: #10B981;
          color: #FFFFFF;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #154D38;
          margin-top: 28px;
          margin-bottom: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: #FAFAFA;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 18px;
          text-align: center;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #154D38;
          margin: 0;
        }
        .stat-label {
          font-size: 13px;
          color: #6B7280;
          margin-top: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          overflow: hidden;
        }
        th {
          background-color: #F9FAFB;
          color: #4B5563;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 12px 14px;
          text-align: left;
          border-bottom: 1px solid #E5E7EB;
        }
        .footer {
          margin-top: 36px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #9CA3AF;
        }
        .print-btn {
          background-color: #154D38;
          color: #FFFFFF;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 20px;
          display: inline-block;
        }
        @media print {
          body { background: #FFF; padding: 0; }
          .container { border: none; box-shadow: none; padding: 0; }
          .print-btn { display: none; }
        }
      </style>
    </head>
    <body>
      <div style="text-align: right; max-width: 800px; margin: 0 auto 12px;">
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
      </div>

      <div class="container">
        <!-- Header -->
        <div class="header">
          <div>
            <h1 class="brand-title">MediCare</h1>
            <div class="brand-sub">Medication Adherence & Clinical Progress Report</div>
          </div>
          <div class="report-badge">CONFIDENTIAL MEDICAL REPORT</div>
        </div>

        <!-- Patient Header Card -->
        <div class="patient-box">
          <div>
            <h2 class="patient-name">${data.patientName}</h2>
            <div class="patient-meta">Age: ${data.patientAge} | Role: ${data.patientRole} | Generated: ${dateStr}</div>
          </div>
          <span class="status-badge">${data.statusBadgeText}</span>
        </div>

        <!-- Key Metrics -->
        <div class="section-title">Overview & Rating</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.overallAdherence}%</div>
            <div class="stat-label">30-Day Overall Adherence Rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: #10B981;">${data.ratingText}</div>
            <div class="stat-label">Adherence Performance Rating</div>
          </div>
        </div>

        <!-- Weekly Activity Table -->
        <div class="section-title">Weekly Adherence Activity</div>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th style="text-align: right;">Adherence Rate</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            ${weeklyRows}
          </tbody>
        </table>

        <!-- Medication Breakdown -->
        <div class="section-title">Adherence Breakdown by Medication</div>
        <table>
          <thead>
            <tr>
              <th>Medication Name & Dose</th>
              <th style="text-align: right;">Adherence Rate</th>
              <th>Status Track</th>
            </tr>
          </thead>
          <tbody>
            ${medRows}
          </tbody>
        </table>

        <!-- Footer -->
        <div class="footer">
          <div>MediCare Elderly Healthcare Platform</div>
          <div>Report ID: REP-${Math.floor(100000 + Math.random() * 900000)}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function downloadReport(data: ReportData): Promise<void> {
  const htmlContent = generateReportHtml(data);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      // 1. Trigger automatic file download (.html report)
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MediCare_Report_${data.patientName.replace(/\s+/g, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 2. Open print window so user can print or "Save as PDF" directly
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 350);
      }
    } catch (err) {
      console.error('Web report download error:', err);
    }
  } else {
    // Native Mobile Fallback Alert
    alert(`Report for ${data.patientName} generated successfully!\nOverall Adherence: ${data.overallAdherence}%\nStatus: ${data.ratingText}`);
  }
}
