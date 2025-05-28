export interface CertificationItem {
  title: string;
  issuer: string;
  issueDate: string;
  badgeImageUrl?: string;
  skills: string[];
  credentialUrl: string;
  category?: string;
  tags?: string[];
  credentialId?: string;
}

export interface CertificationCardProps extends CertificationItem {
  // Any additional props specific to the card's presentation, if needed
}

export interface CertificationsSectionProps {
  certifications: CertificationItem[];
  showAll?: boolean;
  maxDisplay?: number;
}
