// Script para crear datos de prueba de proyectos
// Este archivo puede ejecutarse una vez para llenar la base de datos con proyectos de ejemplo

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

const sampleProjects = [
  {
    title: "Sistema de Gestión de Portafolio",
    description: "Aplicación web full-stack desarrollada con Next.js, AWS Amplify y TypeScript para gestionar proyectos profesionales. Incluye autenticación, almacenamiento S3, base de datos DynamoDB e internacionalización completa.",
    place: "Proyecto Personal",
    projectUrl: "https://foor.dev",
    githubUrl: "https://github.com/usuario/portfolio",
    demoUrl: "https://demo.foor.dev",
    skills: ["Next.js", "TypeScript", "AWS Amplify", "DynamoDB", "S3", "Cognito", "i18n", "Responsive Design"],
    categories: "Professional" as const,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "Published" as const,
    featured: true,
    slug: "sistema-gestion-portafolio",
    metaDescription: "Sistema profesional de gestión de portafolio desarrollado con tecnologías AWS y Next.js",
    tags: ["web", "aws", "portfolio", "professional", "fullstack"]
  },
  {
    title: "API de Microservicios Cloud",
    description: "Arquitectura de microservicios serverless usando AWS Lambda, API Gateway y DynamoDB. Implementa patrones de Event Sourcing y CQRS para alta escalabilidad.",
    place: "Empresa XYZ",
    githubUrl: "https://github.com/usuario/microservices-api",
    skills: ["AWS Lambda", "API Gateway", "DynamoDB", "EventBridge", "CloudWatch", "Node.js", "TypeScript"],
    categories: "Professional" as const,
    startDate: "2023-06-01",
    endDate: "2023-11-30",
    status: "Published" as const,
    featured: true,
    slug: "api-microservicios-cloud",
    metaDescription: "Arquitectura serverless de microservicios con AWS Lambda y patrones avanzados",
    tags: ["serverless", "microservices", "aws", "lambda", "api"]
  },
  {
    title: "Aplicación de Machine Learning",
    description: "Sistema de análisis predictivo usando Python, TensorFlow y AWS SageMaker. Procesa datos en tiempo real y genera insights automáticos para optimización de procesos.",
    place: "Universidad ABC",
    projectUrl: "https://ml-project.example.com",
    githubUrl: "https://github.com/usuario/ml-analytics",
    skills: ["Python", "TensorFlow", "AWS SageMaker", "Pandas", "NumPy", "React", "FastAPI"],
    categories: "Academic" as const,
    startDate: "2023-02-01",
    endDate: "2023-07-15",
    status: "Published" as const,
    featured: false,
    slug: "aplicacion-machine-learning",
    metaDescription: "Sistema de análisis predictivo con ML y AWS SageMaker para optimización de procesos",
    tags: ["machine-learning", "python", "aws", "analytics", "tensorflow"]
  },
  {
    title: "Hackathon: Smart City IoT",
    description: "Prototipo de ciudad inteligente desarrollado en 48 horas. Usa sensores IoT, Arduino, AWS IoT Core y visualización en tiempo real con dashboards interactivos.",
    place: "TechHack 2023",
    demoUrl: "https://smart-city-demo.example.com",
    githubUrl: "https://github.com/usuario/smart-city-iot",
    skills: ["IoT", "Arduino", "AWS IoT Core", "React", "D3.js", "Node.js", "MQTT"],
    categories: "Hackathon" as const,
    startDate: "2023-10-14",
    endDate: "2023-10-16",
    status: "Published" as const,
    featured: true,
    slug: "hackathon-smart-city-iot",
    metaDescription: "Prototipo de ciudad inteligente con IoT desarrollado en hackathon de 48 horas",
    tags: ["hackathon", "iot", "smart-city", "arduino", "aws-iot"]
  },
  {
    title: "Investigación: Blockchain Sustainability",
    description: "Investigación sobre optimización energética en redes blockchain. Propone nuevos algoritmos de consenso que reducen el consumo energético en un 40%.",
    place: "Instituto de Investigación DEF",
    skills: ["Blockchain", "Solidity", "Python", "Research", "Sustainability", "Algorithms"],
    categories: "Research" as const,
    startDate: "2022-09-01",
    endDate: "2023-03-30",
    status: "Published" as const,
    featured: false,
    slug: "investigacion-blockchain-sustainability",
    metaDescription: "Investigación sobre optimización energética en blockchain y algoritmos de consenso sostenibles",
    tags: ["research", "blockchain", "sustainability", "algorithms", "energy"]
  }
];

export async function createSampleProjects() {
  console.log('Creating sample projects...');
  
  try {
    for (const project of sampleProjects) {
      const result = await client.models.Projects.create(project);
      
      if (result.errors) {
        console.error('Error creating project:', project.title, result.errors);
      } else {
        console.log('Created project:', project.title);
      }
    }
    
    console.log('Sample projects created successfully!');
  } catch (error) {
    console.error('Error creating sample projects:', error);
  }
}

// Uncomment the following line to run this script
// createSampleProjects();
