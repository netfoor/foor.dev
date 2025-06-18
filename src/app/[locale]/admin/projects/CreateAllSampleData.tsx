'use client';

import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../../amplify/data/resource';

const client = generateClient<Schema>();

const sampleCertificationsData = [
  {
    title: "AWS Certified Solutions Architect - Professional",
    issuer: "Amazon Web Services",
    credentialId: "SAP-2024-001",
    issueDate: "2024-03-15",
    expirationDate: "2027-03-15",
    badgeImageUrl: "https://images.credly.com/size/340x340/images/2d84e428-9078-49b6-a804-13c15383d0de/image.png",
    content: "Advanced AWS architectural design and implementation skills",
    skills: ["AWS Architecture", "Cloud Design Patterns", "Cost Optimization", "Security", "High Availability"],
    categoty: "Cloud Architecture"
  },
  {
    title: "AWS Certified DevOps Engineer - Professional",
    issuer: "Amazon Web Services", 
    credentialId: "DOP-2023-002",
    issueDate: "2023-11-20",
    expirationDate: "2026-11-20",
    badgeImageUrl: "https://images.credly.com/size/340x340/images/bd31ef42-d460-493e-8503-39592aaf0458/image.png",
    content: "Advanced DevOps practices and AWS automation tools",
    skills: ["CI/CD", "Infrastructure as Code", "Monitoring", "Automation", "Security"],
    categoty: "DevOps"
  },
  {
    title: "HashiCorp Certified: Terraform Associate",
    issuer: "HashiCorp",
    credentialId: "TF-2024-003",
    issueDate: "2024-01-10",
    expirationDate: "2026-01-10", 
    badgeImageUrl: "https://images.credly.com/size/340x340/images/85b9cfc4-257a-4742-878c-4f7ab4a2631b/image.png",
    content: "Infrastructure as Code with Terraform",
    skills: ["Terraform", "Infrastructure as Code", "Cloud Provisioning", "State Management"],
    categoty: "Infrastructure"
  }
];

const sampleEducationData = [
  {
    institution: "Universidad de Ejemplo",
    degree: "Ingeniero en Sistemas Computacionales",
    fieldOfStudy: "Computer Science",
    startDate: "2018-08-01",
    endDate: "2022-12-15",
    description: "Focus on software engineering, cloud computing, and distributed systems",
    location: "Ciudad, País",
    recognition: ["Magna Cum Laude", "Dean's List"],
    CertificateURL: "https://example.edu/certificates/12345",
    Photos: []
  }
];

const sampleExperiencesData = [
  {
    company: "Tech Solutions Inc.",
    position: "Senior Cloud Engineer",
    startDate: "2023-01-15",
    endDate: null,
    description: "Lead cloud infrastructure design and implementation for enterprise clients",
    location: "Remote",
    skills: ["AWS", "Kubernetes", "Terraform", "Python", "Docker"],
    activities: [
      "Design and implement scalable cloud architectures",
      "Mentor junior engineers on cloud best practices", 
      "Lead migration projects from on-premise to cloud"
    ]
  },
  {
    company: "StartupCorp",
    position: "DevOps Engineer",
    startDate: "2021-06-01", 
    endDate: "2022-12-31",
    description: "Built and maintained CI/CD pipelines and cloud infrastructure",
    location: "San Francisco, CA",
    skills: ["Jenkins", "AWS", "Docker", "Kubernetes", "MongoDB"],
    activities: [
      "Implemented automated deployment pipelines",
      "Reduced deployment time by 80% through automation",
      "Managed AWS infrastructure for high-traffic applications"
    ]
  }
];

const sampleLanguagesData = [
  {
    language: "English",
    proficiency: "Fluent" as const
  },
  {
    language: "Spanish", 
    proficiency: "Native" as const
  },
  {
    language: "Japanese",
    proficiency: "Conversational" as const
  }
];

interface CreateAllSampleDataProps {
  onSuccess?: () => void;
}

export default function CreateAllSampleData({ onSuccess }: CreateAllSampleDataProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');

  const createAllSampleData = async () => {
    setIsCreating(true);
    setMessage('');

    try {
      console.log('Starting to create all sample data...');
      
      // Create Certifications
      for (const certData of sampleCertificationsData) {
        console.log(`Creating certification: ${certData.title}`);
        await client.models.Certifications.create(certData);
      }

      // Create Education
      for (const eduData of sampleEducationData) {
        console.log(`Creating education: ${eduData.degree}`);
        await client.models.Education.create(eduData);
      }

      // Create Experiences  
      for (const expData of sampleExperiencesData) {
        console.log(`Creating experience: ${expData.position} at ${expData.company}`);
        await client.models.Experiences.create(expData);
      }

      // Create Languages
      for (const langData of sampleLanguagesData) {
        console.log(`Creating language: ${langData.language}`);
        await client.models.Languages.create(langData);
      }

      const totalItems = sampleCertificationsData.length + sampleEducationData.length + 
                        sampleExperiencesData.length + sampleLanguagesData.length;

      setMessage(`✅ Successfully created all sample data! (${totalItems} total items: ${sampleCertificationsData.length} certifications, ${sampleEducationData.length} education, ${sampleExperiencesData.length} experiences, ${sampleLanguagesData.length} languages)`);
      
      // Call the onSuccess callback to refresh the parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      setMessage(`❌ Error creating sample data: ${error}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Create Complete Portfolio Sample Data
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        This will create sample data for your entire portfolio including certifications, education, work experience, and languages.
      </p>
      
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>Will create:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>{sampleCertificationsData.length} AWS & Cloud certifications</li>
          <li>{sampleEducationData.length} education record</li>
          <li>{sampleExperiencesData.length} work experiences</li>
          <li>{sampleLanguagesData.length} languages</li>
        </ul>
      </div>
      
      <button
        onClick={createAllSampleData}
        disabled={isCreating}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isCreating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {isCreating ? 'Creating All Data...' : 'Create Complete Portfolio Data'}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
