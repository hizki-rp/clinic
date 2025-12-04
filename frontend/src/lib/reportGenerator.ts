// Report Generation Utilities
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Type declaration for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

export interface ReportData {
  title: string;
  subtitle?: string;
  date: string;
  data: any[];
  columns?: string[];
  summary?: Record<string, any>;
}

export class ReportGenerator {
  /**
   * Generate PDF report
   */
  static generatePDF(reportData: ReportData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(reportData.title, pageWidth / 2, 20, { align: 'center' });
    
    // Add subtitle if exists
    if (reportData.subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(reportData.subtitle, pageWidth / 2, 28, { align: 'center' });
    }
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${reportData.date}`, 14, 40);
    
    // Add summary if exists
    let yPosition = 50;
    if (reportData.summary) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 14, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      Object.entries(reportData.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 14, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }
    
    // Add table if data exists
    if (reportData.data && reportData.data.length > 0) {
      const columns = reportData.columns || Object.keys(reportData.data[0]);
      const rows = reportData.data.map(item => 
        columns.map(col => item[col] || '')
      );
      
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 },
      });
    }
    
    // Save the PDF
    doc.save(`${reportData.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
  }

  /**
   * Generate CSV report (as alternative to DOCX)
   */
  static generateCSV(reportData: ReportData): void {
    if (!reportData.data || reportData.data.length === 0) {
      return;
    }
    
    const columns = reportData.columns || Object.keys(reportData.data[0]);
    const csvContent = [
      // Header
      columns.join(','),
      // Data rows
      ...reportData.data.map(row => 
        columns.map(col => {
          const value = row[col] || '';
          // Escape commas and quotes
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportData.title.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generate Excel-compatible report
   */
  static generateExcel(reportData: ReportData): void {
    if (!reportData.data || reportData.data.length === 0) {
      return;
    }
    
    const columns = reportData.columns || Object.keys(reportData.data[0]);
    
    // Create HTML table
    let html = '<table>';
    html += '<thead><tr>';
    columns.forEach(col => {
      html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    reportData.data.forEach(row => {
      html += '<tr>';
      columns.forEach(col => {
        html += `<td>${row[col] || ''}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    // Create blob and download
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportData.title.replace(/\s+/g, '_')}_${new Date().getTime()}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
