export type ProductUnit = 'Box' | 'Pcs' | 'Pack' | 'Kit' | 'Set' | 'Roll' | 'Bottle' | 'Vial';

export type ProductCategory = 
  | 'Surgical Consumables'
  | 'Laparoscopy & Trocars'
  | 'Sutures & Ligatures'
  | 'Orthopedic & Implants'
  | 'Anesthesia & Airway'
  | 'Wound Care & Dressings'
  | 'Disinfectants & Sterile'
  | 'General Medical';

export interface Product {
  id: string;
  code: string; // e.g. "VO-SUT-01"
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  hsnCode: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM
  purchasePrice: number; // Cost from vendor
  sellingPrice: number; // Price to Hospital
  currentStock: number;
  lowStockThreshold: number;
  gstRate: number; // 0, 5, 12, 18
  preferredVendorId?: string;
  description?: string;
  locationRack?: string;
  createdAt: string;
  updatedAt: string;
}

export type VendorType = 'Wholesaler' | 'Manufacturer' | 'Distributor / Stockist' | 'C&F Agent';

export interface Vendor {
  id: string;
  name: string; // Store / Manufacturer name
  vendorType: VendorType;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
  drugLicenseNo?: string;
  panNo?: string;
  balancePayable: number;
  paymentTermsDays?: number;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  notes?: string;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string; // Hospital Name (e.g., "Apollo Hospital", "Sterling Multispeciality")
  departmentStore: string; // e.g. "Central OT Store", "Trauma Operation Theatre Store", "Cath Lab OT"
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
  hospitalRegNo?: string;
  outstandingBalance: number;
  creditLimit?: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  productCode?: string;
  category?: ProductCategory;
  hsnCode?: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  freeQuantity?: number;
  unit: ProductUnit;
  unitPrice: number; // Purchase Cost
  sellingPrice?: number; // Intended MRP / Hospital Sale Price
  discountPercent?: number;
  taxableAmount?: number;
  gstRate: number;
  cgstAmount?: number;
  sgstAmount?: number;
  taxAmount?: number;
  totalAmount: number;
}

export interface PurchaseTransaction {
  id: string;
  purchaseNumber: string; // e.g. "PUR-2026-0045"
  vendorId: string;
  vendorName: string;
  vendorType?: VendorType;
  vendorContactPerson?: string;
  vendorPhone?: string;
  vendorEmail?: string;
  vendorGstin?: string;
  vendorDrugLicenseNo?: string;
  vendorAddress?: string;
  vendorBillNumber: string; // Vendor's actual invoice number
  date: string;
  dueDate?: string;
  transportLRNumber?: string;
  transporterName?: string;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  paymentMode: 'Bank Transfer' | 'Cheque' | 'Cash' | 'UPI';
  items: PurchaseItem[];
  subtotal: number;
  totalDiscount?: number;
  taxableTotal?: number;
  cgstTotal?: number;
  sgstTotal?: number;
  totalTax: number;
  roundOff?: number;
  grandTotal: number;
  amountPaid?: number;
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  code: string;
  hsnCode: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unit: ProductUnit;
  unitPrice: number;
  discountPercent: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string; // e.g. "VO/2026-27/0104"
  hospitalId: string;
  hospitalName: string;
  departmentStore: string;
  hospitalGstin: string;
  hospitalAddress: string;
  date: string;
  dueDate: string;
  deliveryChallanRef?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  taxableTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal?: number;
  roundOff: number;
  grandTotal: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  amountPaid: number;
  paymentMode?: 'Bank Transfer' | 'Cheque' | 'Cash' | 'UPI';
  notes?: string;
  createdAt: string;
}

export interface DeliveryChallanItem {
  productId: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unit: ProductUnit;
  packagingDetails?: string; // e.g., "1 Sterile Polybox"
}

export interface DeliveryChallan {
  id: string;
  challanNumber: string; // e.g. "DC-VO-2026-0034"
  date: string;
  hospitalId: string;
  hospitalName: string;
  departmentStore: string;
  deliveryAddress: string;
  transporterOrPerson: string; // e.g., "In-house Delivery Rider (Ramesh)"
  vehicleNumber?: string;
  items: DeliveryChallanItem[];
  status: 'Dispatched' | 'Delivered' | 'Invoiced' | 'Cancelled';
  linkedInvoiceId?: string;
  remarks?: string;
  createdAt: string;
}

export interface StoreProfile {
  name: string;
  tagline: string;
  ownerName: string;
  phone: string;
  email: string;
  officeAddress: string;
  warehouseAddress: string;
  gstin: string;
  drugLicenseNo: string;
  state: string;
  stateCode: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankBranch: string;
  upiId: string;
  terms: string[];
}
