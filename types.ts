
export enum UserRole {
  MASTER = 'MASTER',
  MEDIUM = 'MÉDIUM',
}

export enum MembershipStatus {
  PENDING = 'PENDENTE',
  ACTIVE = 'ATIVO',
  INACTIVE = 'INATIVO',
}

export enum SubscriptionStatus {
  ACTIVE = 'ATIVO',
  EXPIRING = 'VENCENDO',
  OVERDUE = 'ATRASADO',
  BLOCKED = 'BLOQUEADO',
}

export interface SubscriptionData {
  terreiroId: string;
  status: SubscriptionStatus;
  expiresAt: string;
  plan: 'FREE' | 'CASA_DIGITAL' | 'ENTERPRISE';
  price: number;
  lastPaymentDate?: string;
  releaseCode?: string;
}

export interface SubscriptionPayment {
  id: string;
  terreiroId: string;
  competence: string;
  amount: number;
  method: 'PIX' | 'DINHEIRO' | 'OUTRO';
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  receiptUrl?: string;
}

export interface VendorCode {
  code: string;
  days: number;
  createdAt: string;
  usedAt?: string;
  usedBy?: string; // terreiroId
}

export interface VendorAudit {
  id: string;
  action: string;
  at: string;
  userId: string;
  details: string;
}

export enum EventStatus {
  ACTIVE = 'ATIVO',
  FINISHED = 'ENCERRADO',
}

export enum AgendaEventStatus {
  SCHEDULED = 'AGENDADO',
  COMPLETED = 'CONCLUÍDO',
  CANCELLED = 'CANCELADO',
}

export enum AgendaEventType {
  GIRA = 'GIRA',
  REUNION = 'REUNIÃO',
  OBLIGATION = 'OBRIGAÇÃO',
  COURSE = 'CURSO',
}

export enum TransactionType {
  INCOME = 'ENTRADA',
  EXPENSE = 'SAÍDA',
}

export interface BankConnection {
  status: 'connected' | 'disconnected';
  provider: string;
  connectedAt: string;
}

export interface BankStatementRow {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  status: 'PENDING' | 'RECONCILED' | 'IGNORED';
  matchScore?: number;
  matchedTxId?: string;
  raw?: string;
}

export interface AgendaEvent {
  id: string;
  terreiroId: string;
  type: AgendaEventType;
  title: string;
  workLine?: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  status: AgendaEventStatus;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  confirmedAt: string;
}

export interface RegistroPresenca {
  id: string;
  terreiroId: string;
  eventoId: string;
  mediumId: string;
  mediumName: string;
  dataHoraRegistro: string;
  origem: 'QR' | 'MANUAL';
  valido: boolean;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: TransactionType;
  subcategories: string[];
}

export interface CostCenter {
  id: string;
  name: string;
  description?: string;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  costCenterId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDueDate: string;
  lastGeneratedDate?: string;
  isActive: boolean;
}

export interface FinanceAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface Terreiro {
  id: string;
  name: string;
  foundationDate: string;
  masterPhone: string;
  plan: 'FREE' | 'CASA_DIGITAL' | 'ENTERPRISE';
  address?: string;
  responsible?: string;
  notes?: string;
}

export interface TerreiroConfig {
  name: string;
  address: string;
  whatsapp: string;
  email: string;
  cityUF: string;
  logoBase64?: string;
  primaryColor?: string;
  shortName: string;
  responsibleName: string;
  responsibleTitle: string;
  defaultReceiptText: string;
  allowMediumDonation: boolean;
  masters: string[]; // IDs dos médiuns masters
}

export interface MonthlyFeeSettings {
  defaultAmount: number;
  dueDay: number;
  autoGenerate: boolean;
}

export interface MonthlyFee {
  id: string;
  mediumId: string;
  terreiroId: string;
  month: number;
  year: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'EXEMPT' | 'PARTIAL';
  amount: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: 'PIX' | 'DINHEIRO' | 'CARTÃO' | 'OUTRO';
  notes?: string;
  receiptUrl?: string;
  paidAmount?: number;
}

export interface MediumProfile {
  id: string; 
  terreiroId: string;
  role: UserRole;
  status: MembershipStatus;
  fullName: string;
  email: string;
  phone: string;
  entryDate: string;
  paiOrixa: string;
  balance: number;
  photo?: string;
  
  monthlyFeeValue?: number;
  feeDueDay?: number;
  feeChargeStart?: string;
  feeIsExempt?: boolean;
  feeNotes?: string;

  fatherName: string; motherName: string; address: string; nationality: string; profession: string;
  birthDate: string; bloodType: string; emergencyContactName: string; emergencyContactPhone: string;
  emergencyContactRelation: string; hasDisease: boolean; continuousMedicine: boolean;
  chefeDeCabeca: string; spiritualHistory: string; anjoGuarda: string; exu: string; trancaRua: string;
  maeOrixa: string; gerente: string; segundoOrixa: string; terceiroOrixa: string;
}

export interface Transaction {
  id: string;
  terreiroId: string;
  type: TransactionType;
  category: string;
  subcategory?: string;
  costCenterId?: string;
  amount: number;
  date: string;
  description: string;
  mediumId?: string;
  isReconciled?: boolean;
  recurringId?: string;
}

export interface PixConfig {
  key: string;
  receiverName: string;
  city: string;
  bank?: string;
  defaultDescription: string;
}

export interface DonationCampaign {
  id: string;
  terreiroId: string;
  title: string;
  date: string;
  goal?: number;
  notes?: string;
  status: 'ATIVA' | 'ENCERRADA';
  linkedEventId?: string;
}

export interface DonationRecord {
  id: string;
  terreiroId: string;
  campaignId: string;
  mediumId?: string;
  date: string;
  amount: number;
  method: 'PIX' | 'DINHEIRO' | 'TRANSFERÊNCIA' | 'OUTRO';
  donorName?: string;
  isAnonymous: boolean;
  notes?: string;
  receiptBase64?: string;
}
