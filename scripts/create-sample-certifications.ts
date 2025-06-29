/**
 * ⚠️  DEVELOPMENT SCRIPT ONLY - DO NOT USE IN PRODUCTION ⚠️
 * 
 * This script creates sample certification data for development and testing purposes.
 * It should NEVER be executed in a production environment.
 * 
 * Usage: npm run tsx scripts/create-sample-certifications.ts
 * 
 * To prevent accidental execution:
 * - This script is not included in package.json scripts
 * - It requires manual execution
 * - It should be removed or disabled before production deployment
 */

// Uncomment the following line to prevent accidental execution
// throw new Error('This is a development script and should not be executed in production');

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import config from '../amplify_outputs.json';

// Configure Amplify
Amplify.configure(config);

const client = generateClient<Schema>();

const sampleCertifications = [
  {
    title: "AWS Solutions Architect Associate",
    slug: "aws-solutions-architect-associate",
    issuer: "Amazon Web Services",
    category: "Technology",
    issueDate: "2024-01-15",
    expirationDate: "2027-01-15",
    credentialId: "AWS-SAA-12345678",
    credentialUrl: "https://www.credly.com/badges/sample-aws-saa",
    skills: ["AWS", "Cloud Architecture", "EC2", "S3", "RDS", "Lambda", "VPC"],
    photoKey: null
  },
  {
    title: "Microsoft Azure Fundamentals",
    slug: "microsoft-azure-fundamentals",
    issuer: "Microsoft",
    category: "Technology",
    issueDate: "2023-11-20",
    expirationDate: null,
    credentialId: "AZ-900-98765432",
    credentialUrl: "https://www.credly.com/badges/sample-azure-fundamentals",
    skills: ["Azure", "Cloud Computing", "Microsoft Cloud", "DevOps"],
    photoKey: null
  },
  {
    title: "Google Cloud Professional Cloud Architect",
    slug: "google-cloud-professional-architect",
    issuer: "Google Cloud",
    category: "Technology",
    issueDate: "2024-03-10",
    expirationDate: "2026-03-10",
    credentialId: "GCP-PCA-11223344",
    credentialUrl: "https://www.credential.net/sample-gcp-pca",
    skills: ["Google Cloud Platform", "GCP", "Cloud Architecture", "Kubernetes", "BigQuery"],
    photoKey: null
  },
  {
    title: "PMP - Project Management Professional",
    slug: "pmp-project-management-professional",
    issuer: "Project Management Institute",
    category: "Business",
    issueDate: "2023-09-05",
    expirationDate: "2026-09-05",
    credentialId: "PMP-55667788",
    credentialUrl: "https://www.pmi.org/certifications/sample-pmp",
    skills: ["Project Management", "Agile", "Scrum", "Risk Management", "Leadership"],
    photoKey: null
  },
  {
    title: "Certified Ethical Hacker (CEH)",
    slug: "certified-ethical-hacker-ceh",
    issuer: "EC-Council",
    category: "Technology",
    issueDate: "2024-02-28",
    expirationDate: "2027-02-28",
    credentialId: "CEH-99887766",
    credentialUrl: "https://www.eccouncil.org/programs/sample-ceh",
    skills: ["Ethical Hacking", "Penetration Testing", "Cybersecurity", "Network Security"],
    photoKey: null
  },
  {
    title: "Japanese Language Proficiency Test N2",
    slug: "jlpt-n2-japanese-proficiency",
    issuer: "Japan Foundation",
    category: "Languages",
    issueDate: "2023-12-01",
    expirationDate: null,
    credentialId: "JLPT-N2-44556677",
    credentialUrl: null,
    skills: ["Japanese Language", "JLPT", "Business Japanese", "Translation"],
    photoKey: null
  }
];

async function createSampleCertifications() {
  console.log('Creating sample certifications...');
  
  try {
    for (const cert of sampleCertifications) {
      console.log(`Creating certification: ${cert.title}`);
      
      const response = await client.models.Certifications.create({
        title: cert.title,
        slug: cert.slug,
        issuer: cert.issuer,
        category: cert.category,
        issueDate: cert.issueDate,
        expirationDate: cert.expirationDate,
        credentialId: cert.credentialId,
        credentialUrl: cert.credentialUrl,
        skills: cert.skills,
        photoKey: cert.photoKey
      }, {
        authMode: 'identityPool'
      });
      
      console.log(`✅ Created: ${cert.title}`);
    }
    
    console.log('✅ All sample certifications created successfully!');
  } catch (error) {
    console.error('❌ Error creating certifications:', error);
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  createSampleCertifications();
}

export default createSampleCertifications;
