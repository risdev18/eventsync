export type UserRole = 'student' | 'organizer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId?: string;
  usn?: string;
  phone?: string;
  college?: string;
  year?: string;
  interests?: string[];
  avatarUrl?: string;
  securityPassword?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string; // e.g. "IT", "CS", "AML", "DS", "MECH"
  description: string;
  iconName: string;
  accentColor: string;
  coordinatorName: string;
  coordinatorEmail: string;
  active: boolean;
  eventCount?: number;
}

export type EventFontFamily = 'sans' | 'serif' | 'mono' | 'cinzel' | 'orbitron' | 'rustic';
export type CertificateStyle = 'magical' | 'fresh' | 'cyberpunk' | 'cinematic' | 'classic';

export interface EventTheme {
  id: string;
  eventId?: string;
  themeName: string; // e.g. "Harry Potter", "Subway Suppers", "Tech Innovation", "Pushpa Wildfire"
  primaryColor: string; // Hex e.g. #D4AF37
  secondaryColor: string; // Hex
  backgroundColor: string; // Hex e.g. #0A0B14
  surfaceColor: string; // Hex e.g. #161829
  textColor: string; // Hex e.g. #F8FAFC
  accentColor: string; // Hex e.g. #F59E0B
  fontFamily: EventFontFamily;
  bannerUrl: string;
  posterUrl: string;
  badgeText?: string;
  certificateStyle: CertificateStyle;
  certificateBorderColor: string;
  certificateBgColor?: string;
}

export interface EventRegistrationSettings {
  minTeamSize: number;
  maxTeamSize: number;
  allowIndividual: boolean;
  requireTeam: boolean;
  requireAllMemberAccounts: boolean;
  requireUniqueTeamName: boolean;
}

export interface EventPaymentSettings {
  isPaid: boolean;
  feeType: 'per_person' | 'per_team';
  feeAmount: number;
  upiId: string;
  payeeName: string;
  qrImageUrl: string;
  paymentInstructions?: string;
}

export interface CertificateSignatory {
  name: string;
  title: string;
  signatureImage?: string;
}

export interface PhotoCertificateSettings {
  textColor?: string;
  accentColor?: string;
  fontFamily?: 'serif' | 'sans' | 'orbitron' | 'rustic' | 'mono';
  namePositionY?: number; // 20 to 80 (default: 48)
  nameFontSize?: number; // 18 to 48 (default: 32)
  showQrCode?: boolean; // default: true
  qrPosition?: 'bottom_center' | 'bottom_right' | 'bottom_left';
  showSignatures?: boolean; // default: true
  showEventTitle?: boolean; // default: true
  showPlacement?: boolean; // default: true
}

export interface EventCertificateSettings {
  enableParticipation: boolean;
  attendanceRequirementPct: number;
  collegeName: string;
  signatories: CertificateSignatory[];
  templateMode?: 'automatic' | 'photo_template' | 'chatgpt_custom';
  photoTemplateUrl?: string; // Uploaded certificate background image/photo template
  photoSettings?: PhotoCertificateSettings;
  customChatGPTTemplate?: string;
}

export type EventStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'published'
  | 'registration_closed'
  | 'completed'
  | 'cancelled';

export type EventCategory = 'hackathon' | 'workshop' | 'competition' | 'cultural' | 'technical';

export interface EventScheduleItem {
  time: string;
  activity: string;
}

export interface CollegeEvent {
  id: string;
  title: string;
  slug: string;
  branchId: string;
  category: EventCategory;
  tagline: string;
  description: string;
  rules: string[];
  schedule: EventScheduleItem[];
  prizes?: {
    first: string;
    second: string;
    third: string;
  };
  startDate: string;
  endDate: string;
  venue: string;
  mode: 'offline' | 'online' | 'hybrid';
  status: EventStatus;
  capacity: number;
  registeredCount: number;
  registrationDeadline: string;
  organizerId: string;
  organizerName: string;
  organizerContact: string;
  createdAt: string;
  featured?: boolean;
  theme: EventTheme;
  registrationSettings: EventRegistrationSettings;
  paymentSettings: EventPaymentSettings;
  certificateSettings: EventCertificateSettings;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  usn: string;
  branch: string;
  year: string;
  phone?: string;
  isLeader: boolean;
}

export type RegistrationStatus = 'pending_payment' | 'submitted' | 'confirmed' | 'rejected' | 'cancelled';
export type PaymentStatus =
  | 'not_required'
  | 'awaiting_submission'
  | 'submitted'
  | 'verified'
  | 'rejected'
  | 'refund_pending';

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  isTeam: boolean;
  teamName?: string;
  teamSize: number;
  members: TeamMember[];
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
  verifiedAt?: string;
  paymentSubmissionId?: string;
}

export interface PaymentSubmission {
  id: string;
  registrationId: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  transactionRef: string; // UTR number
  proofImageUrl: string;
  status: 'submitted' | 'verified' | 'rejected';
  rejectionReason?: string;
  reviewerId?: string;
  reviewerName?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface Ticket {
  id: string;
  ticketCode: string;
  registrationId: string;
  eventId: string;
  userId: string;
  participantName: string;
  participantEmail: string;
  teamName?: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  ticketId: string;
  registrationId: string;
  participantName: string;
  participantEmail: string;
  teamName?: string;
  timestamp: string;
  verifiedBy: string;
}

export interface EventResult {
  id: string;
  eventId: string;
  registrationId: string;
  teamName: string;
  placement: 1 | 2 | 3;
  members: Array<{ name: string; email: string }>;
  score?: number;
  notes?: string;
  confirmedBy: string;
  publishedAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  eventId: string;
  eventTitle: string;
  branchName: string;
  recipientName: string;
  recipientEmail: string;
  recipientId?: string;
  teamName?: string;
  type: 'participation' | 'winner';
  awardCategory: string; // "Certificate of Participation" | "1st Place Winner" | "2nd Place Winner" | "3rd Place Winner"
  placement?: 1 | 2 | 3;
  eventDate: string;
  issueDate: string;
  qrVerificationCode: string;
  signatories: CertificateSignatory[];
  isRevoked: boolean;
  revocationReason?: string;
  theme: EventTheme;
  photoTemplateUrl?: string;
  photoSettings?: PhotoCertificateSettings;
  customTemplateHtml?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  link?: string;
  eventId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}
