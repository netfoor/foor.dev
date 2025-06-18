'use client';

import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../../../../amplify/data/resource';

const client = generateClient<Schema>();

const sampleProjectsData = [
  {
    title: "Serverless E-Commerce Platform",
    description: "Full-stack serverless e-commerce solution using AWS Lambda, DynamoDB, and API Gateway",
    place: "AWS Cloud",
    projectUrl: "https://demo-ecommerce.example.com",
    githubUrl: "https://github.com/yourname/serverless-ecommerce",
    demoUrl: "https://demo-ecommerce.example.com",
    skills: ["AWS Lambda", "DynamoDB", "API Gateway", "CloudFormation", "React", "Node.js"],
    categories: "Professional" as const,
    startDate: "2024-01-15",
    endDate: "2024-04-30",
    status: "Published" as const,
    featured: true,
    slug: "serverless-ecommerce-platform",
    metaDescription: "Serverless e-commerce platform built with AWS services",
    tags: ["serverless", "aws", "ecommerce", "lambda", "dynamodb"]
  },
  {
    title: "Multi-Region Disaster Recovery System",
    description: "Automated disaster recovery solution with cross-region replication and failover",
    place: "AWS Multi-Region",
    projectUrl: "https://dr-system.example.com",
    githubUrl: "https://github.com/yourname/disaster-recovery",
    skills: ["AWS RDS", "S3 Cross-Region Replication", "Route 53", "CloudWatch", "Lambda", "SNS"],
    categories: "Professional" as const,
    startDate: "2023-08-01",
    endDate: "2023-12-15",
    status: "Published" as const,
    featured: true,
    slug: "multi-region-disaster-recovery",
    metaDescription: "Automated disaster recovery system with AWS multi-region architecture",
    tags: ["disaster-recovery", "aws", "multi-region", "automation", "rds"]
  },
  {
    title: "CI/CD Pipeline with AWS CodePipeline",
    description: "Complete DevOps pipeline with automated testing, building, and deployment",
    place: "AWS DevOps",
    projectUrl: "https://pipeline.example.com",
    githubUrl: "https://github.com/yourname/aws-cicd-pipeline",
    skills: ["AWS CodePipeline", "CodeBuild", "CodeDeploy", "CloudFormation", "Docker", "Jenkins"],
    categories: "Professional" as const,
    startDate: "2023-10-01",
    endDate: "2024-01-30",
    status: "Published" as const,
    featured: false,
    slug: "aws-cicd-pipeline",
    metaDescription: "Complete CI/CD pipeline using AWS DevOps services",
    tags: ["cicd", "devops", "aws", "codepipeline", "automation"]
  },
  {
    title: "Microservices on EKS with Istio",
    description: "Containerized microservices architecture using Amazon EKS and Istio service mesh",
    place: "AWS EKS",
    projectUrl: "https://microservices.example.com",
    githubUrl: "https://github.com/yourname/eks-microservices",
    skills: ["Amazon EKS", "Kubernetes", "Istio", "Docker", "Helm", "Prometheus", "Grafana"],
    categories: "Professional" as const,
    startDate: "2024-02-01",
    endDate: "2024-06-15",
    status: "Published" as const,
    featured: true,
    slug: "microservices-eks-istio",
    metaDescription: "Microservices architecture on Amazon EKS with Istio service mesh",
    tags: ["microservices", "eks", "kubernetes", "istio", "containers"]
  },
  {
    title: "Real-time Analytics with Kinesis",
    description: "Real-time data processing and analytics pipeline using AWS Kinesis and ElasticSearch",
    place: "AWS Analytics",
    projectUrl: "https://analytics.example.com",
    githubUrl: "https://github.com/yourname/kinesis-analytics",
    skills: ["AWS Kinesis", "ElasticSearch", "Lambda", "S3", "QuickSight", "Python"],
    categories: "Research" as const,
    startDate: "2023-06-01",
    endDate: "2023-09-30",
    status: "Published" as const,
    featured: false,
    slug: "real-time-analytics-kinesis",
    metaDescription: "Real-time analytics pipeline using AWS Kinesis and ElasticSearch",
    tags: ["analytics", "kinesis", "real-time", "elasticsearch", "aws"]
  }
];

interface CreateSampleDataProps {
  onSuccess?: () => void;
}

export default function CreateSampleData({ onSuccess }: CreateSampleDataProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const createSampleData = async () => {
    setIsCreating(true);
    setMessage('');

    try {
      // Debug: Check current user and groups
      const currentUser = await getCurrentUser();
      console.log('Current user:', currentUser);
      console.log('User groups:', currentUser.signInDetails?.loginId);

      console.log('Starting to create sample projects...');
      
      for (const projectData of sampleProjectsData) {
        console.log(`Creating project: ${projectData.title}`);
        
        const result = await client.models.Projects.create({
          title: projectData.title,
          description: projectData.description,
          place: projectData.place,
          projectUrl: projectData.projectUrl,
          githubUrl: projectData.githubUrl,
          demoUrl: projectData.demoUrl,
          skills: projectData.skills,
          categories: projectData.categories,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          status: projectData.status,
          featured: projectData.featured,
          slug: projectData.slug,
          metaDescription: projectData.metaDescription,
          tags: projectData.tags
        });

        console.log(`Created project:`, result);
      }

      setMessage(`✅ Successfully created ${sampleProjectsData.length} sample projects!`);
      
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
        Create Sample Projects Data
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        This will create {sampleProjectsData.length} sample AWS Cloud Engineering projects to populate your portfolio.
      </p>
      
      <button
        onClick={createSampleData}
        disabled={isCreating}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isCreating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isCreating ? 'Creating...' : 'Create Sample Data'}
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
