import { CertificationItem } from './types';
import certificationsData from '@/utils/data-loader/Certifications.json';

export function getCertifications(): CertificationItem[] {
  return certificationsData.items;
}

export function getFeaturedCertifications(limit: number = 3): CertificationItem[] {
  // Sort by issue date (most recent first) and take the specified limit
  return certificationsData.items
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, limit);
}
