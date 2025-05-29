export interface Recognition {
  title: string;
  description: string;
  issuer: string;
  issueDate: string;
  credentialId?: string | null;
  issuerUrl?: string | null;
  badgeImageUrl?: string | null;
}
