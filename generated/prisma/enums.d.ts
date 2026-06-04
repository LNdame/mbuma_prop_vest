export declare const UserRole: {
    readonly investor: "investor";
    readonly admin: "admin";
    readonly super_admin: "super_admin";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const KycStatus: {
    readonly pending: "pending";
    readonly approved: "approved";
    readonly rejected: "rejected";
};
export type KycStatus = (typeof KycStatus)[keyof typeof KycStatus];
export declare const IdType: {
    readonly id_book: "id_book";
    readonly passport: "passport";
    readonly drivers_license: "drivers_license";
};
export type IdType = (typeof IdType)[keyof typeof IdType];
export declare const PropertyType: {
    readonly residential: "residential";
    readonly commercial: "commercial";
    readonly mixed_use: "mixed_use";
};
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];
export declare const PropertyStatus: {
    readonly draft: "draft";
    readonly open: "open";
    readonly funded: "funded";
    readonly closed: "closed";
};
export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus];
export declare const PledgeStatus: {
    readonly pending: "pending";
    readonly confirmed: "confirmed";
    readonly cancelled: "cancelled";
};
export type PledgeStatus = (typeof PledgeStatus)[keyof typeof PledgeStatus];
export declare const PaymentType: {
    readonly pledge_payment: "pledge_payment";
    readonly distribution: "distribution";
    readonly refund: "refund";
};
export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];
export declare const PaymentStatus: {
    readonly pending: "pending";
    readonly succeeded: "succeeded";
    readonly failed: "failed";
};
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export declare const DocType: {
    readonly id_document: "id_document";
    readonly proof_of_address: "proof_of_address";
    readonly investment_agreement: "investment_agreement";
    readonly title_deed: "title_deed";
    readonly other: "other";
};
export type DocType = (typeof DocType)[keyof typeof DocType];
export declare const SigningStatus: {
    readonly pending: "pending";
    readonly sent: "sent";
    readonly signed: "signed";
    readonly declined: "declined";
};
export type SigningStatus = (typeof SigningStatus)[keyof typeof SigningStatus];
export declare const DistributionStatus: {
    readonly draft: "draft";
    readonly processing: "processing";
    readonly completed: "completed";
};
export type DistributionStatus = (typeof DistributionStatus)[keyof typeof DistributionStatus];
export declare const DistributionPaymentStatus: {
    readonly pending: "pending";
    readonly paid: "paid";
    readonly failed: "failed";
};
export type DistributionPaymentStatus = (typeof DistributionPaymentStatus)[keyof typeof DistributionPaymentStatus];
export declare const InvitationStatus: {
    readonly pending: "pending";
    readonly accepted: "accepted";
    readonly expired: "expired";
};
export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus];
export declare const NotificationChannel: {
    readonly email: "email";
    readonly sms: "sms";
    readonly in_app: "in_app";
};
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];
export declare const NotificationStatus: {
    readonly queued: "queued";
    readonly sent: "sent";
    readonly failed: "failed";
};
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];
export declare const AuditAction: {
    readonly create: "create";
    readonly update: "update";
    readonly delete: "delete";
    readonly login: "login";
    readonly logout: "logout";
};
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
