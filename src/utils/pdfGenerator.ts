import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalesInvoice, DeliveryChallan, StoreProfile, Product, PurchaseTransaction } from '../types';
import { formatCurrency, formatDate, numberToWords } from './formatters';

// Clean numeric formatter for tables
const numStr = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Generate and download Sales Invoice PDF
 */
export function exportInvoicePDF(invoice: SalesInvoice, store: StoreProfile) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header - Brand Block
  doc.setFillColor(13, 148, 136); // Teal #0d9488
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Title & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(store.name.toUpperCase(), 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(store.tagline, 14, 25);
  doc.text(`${store.officeAddress}`, 14, 29);
  doc.text(`Phone: ${store.phone}  |  Email: ${store.email}`, 14, 33);
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN: ${store.gstin}   |   DL No: ${store.drugLicenseNo}`, 14, 38);

  // Invoice Title Box on Top Right
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(pageWidth - 75, 14, 61, 26, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(13, 148, 136);
  doc.text('TAX INVOICE', pageWidth - 44.5, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Inv No: `, pageWidth - 71, 26);
  doc.setFont('helvetica', 'bold');
  doc.text(`${invoice.invoiceNumber}`, pageWidth - 48, 26);

  doc.setFont('helvetica', 'normal');
  doc.text(`Date: `, pageWidth - 71, 31);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatDate(invoice.date)}`, pageWidth - 48, 31);

  doc.setFont('helvetica', 'normal');
  doc.text(`Due Date: `, pageWidth - 71, 36);
  doc.text(`${formatDate(invoice.dueDate)}`, pageWidth - 48, 36);

  // Line separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 44, pageWidth - 14, 44);

  // Customer / Hospital Details Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 48, pageWidth - 28, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 48, pageWidth - 28, 26, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED & DELIVERED TO (HOSPITAL / STORE):', 18, 54);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.hospitalName, 18, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Dept/Store: ${invoice.departmentStore}`, 18, 65);
  doc.text(`Address: ${invoice.hospitalAddress || 'Hospital Main Campus'}`, 18, 70);

  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN: ${invoice.hospitalGstin || 'URP / Not Provided'}`, pageWidth / 2 + 10, 60);
  doc.setFont('helvetica', 'normal');
  if (invoice.deliveryChallanRef) {
    doc.text(`Challan Ref: ${invoice.deliveryChallanRef}`, pageWidth / 2 + 10, 65);
  }
  doc.text(`Payment Terms: 30 Days Net (${invoice.paymentStatus})`, pageWidth / 2 + 10, 70);

  // Invoice Items Table
  const tableRows = invoice.items.map((item, idx) => [
    idx + 1,
    item.productName,
    item.hsnCode || '3006',
    item.batchNumber,
    item.expiryDate,
    `${item.quantity} ${item.unit}`,
    numStr(item.unitPrice),
    item.discountPercent > 0 ? `${item.discountPercent}%` : '-',
    numStr(item.taxableAmount),
    `${item.gstRate}%`,
    numStr(item.cgstAmount + item.sgstAmount),
    numStr(item.totalAmount)
  ]);

  autoTable(doc, {
    startY: 78,
    head: [[
      '#',
      'Description of Operation Material',
      'HSN',
      'Batch',
      'Exp',
      'Qty',
      'Rate',
      'Disc',
      'Taxable',
      'GST',
      'Tax',
      'Total'
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 48 },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 13, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 14, halign: 'right' },
      7: { cellWidth: 10, halign: 'center' },
      8: { cellWidth: 16, halign: 'right' },
      9: { cellWidth: 10, halign: 'center' },
      10: { cellWidth: 15, halign: 'right' },
      11: { cellWidth: 17, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // Get position after table
  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  // Bottom section: Amount in Words & Bank Details (Left), Summary Totals (Right)
  const leftX = 14;
  const rightX = pageWidth - 80;

  // Left - Words & Bank
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('AMOUNT IN WORDS:', leftX, finalY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const words = numberToWords(invoice.grandTotal);
  doc.text(words, leftX, finalY + 13, { maxWidth: 95 });

  // Bank Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(leftX, finalY + 20, 95, 25, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftX, finalY + 20, 95, 25, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(13, 148, 136);
  doc.text('BANK DETAILS FOR NEFT / RTGS PAYMENT', leftX + 4, finalY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Bank: ${store.bankName}  |  Branch: ${store.bankBranch}`, leftX + 4, finalY + 30);
  doc.text(`A/C No: ${store.bankAccountNo}  |  IFSC: ${store.bankIfsc}`, leftX + 4, finalY + 35);
  doc.text(`UPI ID: ${store.upiId}`, leftX + 4, finalY + 40);

  // Right - Tax & Total Calculations
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, finalY + 5, 66, 40, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightX, finalY + 5, 66, 40, 1.5, 1.5, 'S');

  const calcRow = (label: string, value: string, yPos: number, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(isBold ? 15 : 71, isBold ? 23 : 85, isBold ? 42 : 105);
    doc.text(label, rightX + 4, yPos);
    doc.text(value, rightX + 62, yPos, { align: 'right' });
  };

  calcRow('Taxable Subtotal:', formatCurrency(invoice.taxableTotal), finalY + 11);
  calcRow('CGST (Central Tax):', formatCurrency(invoice.cgstTotal), finalY + 16);
  calcRow('SGST (State Tax):', formatCurrency(invoice.sgstTotal), finalY + 21);
  if (invoice.roundOff !== 0) {
    calcRow('Round-off:', (invoice.roundOff > 0 ? '+' : '') + invoice.roundOff.toFixed(2), finalY + 26);
  } else {
    calcRow('Round-off:', '0.00', finalY + 26);
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(rightX + 4, finalY + 30, rightX + 62, finalY + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(13, 148, 136);
  doc.text('Grand Total:', rightX + 4, finalY + 37);
  doc.text(formatCurrency(invoice.grandTotal), rightX + 62, finalY + 37, { align: 'right' });

  // Signatures & Terms
  const signY = finalY + 52;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Terms: Certified that all surgical consumables supplied comply with medical sterilization norms.', leftX, signY);

  // Signature Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For, ${store.name.toUpperCase()}`, rightX + 2, signY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorised Signatory', rightX + 2, signY + 20);

  // Save the PDF
  const filename = `${invoice.invoiceNumber.replace(/\//g, '_')}_${invoice.hospitalName.substring(0, 15).replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}

/**
 * Generate and download Delivery Challan PDF
 */
export function exportChallanPDF(challan: DeliveryChallan, store: StoreProfile) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 118, 110); // Deep Teal #0f766e
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Title & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(store.name.toUpperCase(), 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(store.tagline, 14, 25);
  doc.text(`${store.officeAddress}`, 14, 29);
  doc.text(`Phone: ${store.phone}  |  Warehouse: ${store.warehouseAddress}`, 14, 33);
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN: ${store.gstin}   |   DL No: ${store.drugLicenseNo}`, 14, 38);

  // Challan Badge Top Right
  doc.setFillColor(240, 253, 250); // Teal-50
  doc.setDrawColor(204, 251, 241);
  doc.roundedRect(pageWidth - 75, 14, 61, 26, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 118, 110);
  doc.text('DELIVERY CHALLAN', pageWidth - 44.5, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`DC No: `, pageWidth - 71, 26);
  doc.setFont('helvetica', 'bold');
  doc.text(`${challan.challanNumber}`, pageWidth - 50, 26);

  doc.setFont('helvetica', 'normal');
  doc.text(`Date: `, pageWidth - 71, 31);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatDate(challan.date)}`, pageWidth - 50, 31);

  doc.setFont('helvetica', 'normal');
  doc.text(`Status: `, pageWidth - 71, 36);
  doc.setFont('helvetica', 'bold');
  doc.text(`${challan.status.toUpperCase()}`, pageWidth - 50, 36);

  // Line separator
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 44, pageWidth - 14, 44);

  // Consignee (Hospital OT) Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 48, (pageWidth - 32) / 2, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 48, (pageWidth - 32) / 2, 28, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DELIVERY DESTINATION / CONSIgNEE:', 18, 54);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(challan.hospitalName, 18, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Dept: ${challan.departmentStore}`, 18, 65);
  doc.text(`Address: ${challan.deliveryAddress}`, 18, 70, { maxWidth: 80 });

  // Dispatch Logistics Box
  const rightBoxX = 14 + (pageWidth - 32) / 2 + 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightBoxX, 48, (pageWidth - 32) / 2, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightBoxX, 48, (pageWidth - 32) / 2, 28, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DISPATCH & TRANSPORT DETAILS:', rightBoxX + 4, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Transporter / Carrier: ${challan.transporterOrPerson || 'Direct Store Dispatch'}`, rightBoxX + 4, 60);
  doc.text(`Vehicle No: ${challan.vehicleNumber || 'Hand Delivery / Courier'}`, rightBoxX + 4, 65);
  doc.text(`Dispatch Note: Material dispatched in sterile sealed containers`, rightBoxX + 4, 70);

  // Challan Table
  const tableRows = challan.items.map((item, idx) => [
    idx + 1,
    item.productName,
    item.batchNumber,
    item.expiryDate,
    `${item.quantity} ${item.unit}`,
    item.packagingDetails || 'Standard Sealed Pack'
  ]);

  autoTable(doc, {
    startY: 82,
    head: [[
      '#',
      'Operation / Medical Material Item',
      'Batch No',
      'Expiry',
      'Dispatched Qty',
      'Packaging / Inspection Notes'
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 118, 110], // Deep teal
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 34 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  // Important notes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Note: Material delivered for surgical & clinical operations. Please verify seal integrity and batch number upon receipt.', 14, finalY + 10);

  // Triple Signature Box for Hospital Deliveries: Dispatched By, Checked By, Received By OT In-charge
  const sigBoxW = (pageWidth - 36) / 3;
  const sigY = finalY + 18;

  const makeSigBlock = (title: string, subtitle: string, xPos: number) => {
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(xPos, sigY, sigBoxW, 30, 1.5, 1.5, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(title, xPos + sigBoxW / 2, sigY + 6, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(subtitle, xPos + sigBoxW / 2, sigY + 26, { align: 'center' });
  };

  makeSigBlock('DISPATCHED BY', 'Store Dispatcher Signature & Date', 14);
  makeSigBlock('CHECKED BY', 'Pharmacist / Quality Verifier', 14 + sigBoxW + 4);
  makeSigBlock('RECEIVED BY (HOSPITAL OT)', 'Sister In-charge Stamp & Signature', 14 + (sigBoxW + 4) * 2);

  // Save Challan PDF
  const filename = `${challan.challanNumber}_${challan.hospitalName.substring(0, 15).replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}

/**
 * Generate and download Sales Summary Report PDF
 */
export function exportSalesReportPDF(
  invoices: SalesInvoice[],
  products: Product[],
  store: StoreProfile,
  dateRangeLabel = 'All Time'
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(store.name.toUpperCase(), 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Official Sales Performance & Tax Ledger Report (${dateRangeLabel})`, 14, 25);
  doc.text(`Generated on: ${formatDate(new Date().toISOString())} | GSTIN: ${store.gstin}`, 14, 29);

  // Summary Metrics Cards
  const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalTax = invoices.reduce((sum, inv) => sum + inv.cgstTotal + inv.sgstTotal + (inv.igstTotal || 0), 0);
  const paidSales = invoices.filter(i => i.paymentStatus === 'Paid').reduce((s, i) => s + i.grandTotal, 0);
  const unpaidSales = invoices.filter(i => i.paymentStatus !== 'Paid').reduce((s, i) => s + (i.grandTotal - i.amountPaid), 0);

  const cardW = (pageWidth - 40) / 4;
  const cardY = 36;

  const renderCard = (title: string, val: string, xPos: number, accentColor: number[]) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, cardY, cardW, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(title, xPos + 4, cardY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(val, xPos + 4, cardY + 14);
  };

  renderCard('TOTAL REVENUE', formatCurrency(totalSales), 14, [13, 148, 136]);
  renderCard('GST TAX COLLECTED', formatCurrency(totalTax), 14 + cardW + 4, [2, 132, 199]);
  renderCard('COLLECTED (PAID)', formatCurrency(paidSales), 14 + (cardW + 4) * 2, [22, 163, 74]);
  renderCard('OUTSTANDING', formatCurrency(unpaidSales), 14 + (cardW + 4) * 3, [225, 29, 72]);

  // Invoice Breakdown Table
  const tableRows = invoices.map((inv, idx) => [
    idx + 1,
    inv.invoiceNumber,
    formatDate(inv.date),
    inv.hospitalName + (inv.departmentStore ? ` (${inv.departmentStore})` : ''),
    inv.items.length + ' items',
    numStr(inv.taxableTotal),
    numStr(inv.cgstTotal + inv.sgstTotal),
    numStr(inv.grandTotal),
    inv.paymentStatus
  ]);

  autoTable(doc, {
    startY: 62,
    head: [[
      '#',
      'Invoice No',
      'Date',
      'Hospital / OT Customer',
      'Lines',
      'Taxable (Rs)',
      'GST (Rs)',
      'Total (Rs)',
      'Status'
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 50 },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 16, halign: 'right' },
      7: { cellWidth: 18, halign: 'right' },
      8: { cellWidth: 14, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  // Footer notes & signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Report generated by Vardhman Opsup System. Verified ledger balances.`, 14, finalY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`For, ${store.name.toUpperCase()}`, pageWidth - 60, finalY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text('Accountant / Authorized Signature', pageWidth - 60, finalY + 22);

  // Save the report PDF
  doc.save(`Vardhman_Opsup_Sales_Report_${dateRangeLabel.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generate and download Purchase Invoice Voucher PDF with Wholesaler/Manufacturer profile
 */
export function exportPurchaseVoucherPDF(purchase: PurchaseTransaction, store: StoreProfile) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(store.name.toUpperCase(), 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(store.tagline, 14, 25);
  doc.text(`Warehouse: ${store.warehouseAddress}`, 14, 29);
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN: ${store.gstin}   |   DL No: ${store.drugLicenseNo}`, 14, 34);

  // Voucher Box on Top Right
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth - 75, 14, 61, 26, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(13, 148, 136);
  doc.text('PURCHASE VOUCHER', pageWidth - 44.5, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Voucher: `, pageWidth - 71, 26);
  doc.setFont('helvetica', 'bold');
  doc.text(`${purchase.purchaseNumber}`, pageWidth - 48, 26);

  doc.setFont('helvetica', 'normal');
  doc.text(`Date: `, pageWidth - 71, 31);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatDate(purchase.date)}`, pageWidth - 48, 31);

  doc.setFont('helvetica', 'normal');
  doc.text(`Status: `, pageWidth - 71, 36);
  doc.text(`${purchase.paymentStatus}`, pageWidth - 48, 36);

  // Line separator
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 40, pageWidth - 14, 40);

  // Wholesaler / Manufacturer Details Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 44, pageWidth - 28, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 44, pageWidth - 28, 26, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 148, 136);
  doc.text(`PURCHASED FROM (${(purchase.vendorType || 'WHOLESALER').toUpperCase()} / SUPPLIER):`, 18, 50);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(purchase.vendorName, 18, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Contact: ${purchase.vendorContactPerson || 'Sales Desk'} | Phone: ${purchase.vendorPhone || 'N/A'}`, 18, 61);
  doc.text(`Address: ${purchase.vendorAddress || 'Store Depot'}`, 18, 66);

  doc.setFont('helvetica', 'bold');
  doc.text(`Supplier Bill No: ${purchase.vendorBillNumber}`, pageWidth / 2 + 10, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(`Supplier GSTIN: ${purchase.vendorGstin || 'URP / Unregistered'}`, pageWidth / 2 + 10, 61);
  doc.text(`Transport / LR: ${purchase.transportLRNumber || 'Direct Depot Delivery'}`, pageWidth / 2 + 10, 66);

  // Table
  const tableRows = purchase.items.map((item, idx) => [
    idx + 1,
    item.productName,
    item.batchNumber,
    item.expiryDate,
    `${item.quantity} ${item.unit}` + (item.freeQuantity ? ` (+${item.freeQuantity} free)` : ''),
    numStr(item.unitPrice),
    item.discountPercent ? `${item.discountPercent}%` : '-',
    numStr(item.taxableAmount ?? (item.quantity * item.unitPrice)),
    `${item.gstRate}%`,
    numStr(item.totalAmount)
  ]);

  autoTable(doc, {
    startY: 74,
    head: [[
      '#',
      'Material / Product Description',
      'Batch',
      'Exp',
      'Stocked Qty',
      'Cost Rate',
      'Disc',
      'Taxable',
      'GST',
      'Total (Rs)'
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 60 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 16, halign: 'right' },
      6: { cellWidth: 10, halign: 'center' },
      7: { cellWidth: 16, halign: 'right' },
      8: { cellWidth: 10, halign: 'center' },
      9: { cellWidth: 20, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  // Bottom Summary Box
  const rightX = pageWidth - 74;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, finalY + 6, 60, 32, 1.5, 1.5, 'FD');
  doc.setDrawColor(226, 232, 240);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Taxable Subtotal:', rightX + 4, finalY + 13);
  doc.text(formatCurrency(purchase.subtotal), rightX + 56, finalY + 13, { align: 'right' });

  doc.text('Input GST Tax:', rightX + 4, finalY + 19);
  doc.text(formatCurrency(purchase.totalTax), rightX + 56, finalY + 19, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(rightX + 4, finalY + 23, rightX + 56, finalY + 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(13, 148, 136);
  doc.text('Grand Total:', rightX + 4, finalY + 31);
  doc.text(formatCurrency(purchase.grandTotal), rightX + 56, finalY + 31, { align: 'right' });

  // Verification note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Inventory Entry Note: Materials verified, sterility checked, and entered into active warehouse inventory.', 14, finalY + 12);
  doc.text(`Received By: Warehouse Logistics Dept (${store.name})`, 14, finalY + 24);

  // Save the PDF
  doc.save(`${purchase.purchaseNumber}_${purchase.vendorName.substring(0, 12).replace(/\s+/g, '_')}.pdf`);
}
