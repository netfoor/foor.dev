import { SkillsData, SkillCategory } from './types';

export const loadSkillsData = async (): Promise<SkillsData> => {
  try {
    const stackData = await import('@/utils/data-loader/stack.json');
    return stackData.default as SkillsData;
  } catch (error) {
    console.error('Error loading skills data:', error);
    return {
      Skills: {
        awsCoreServices: [],
        containersOrchestration: [],
        infrastructureAsCode: [],
        ciCdDevOps: [],
        programmingLanguages: [],
        monitoringObservability: [],
        databases: [],
        networkingSecurity: [],
        managementGovernance: [],
        architecturalConcepts: [],
        systemsHardware: [],
        coreTechnologies: []
      },
      SoftSkills: []
    };
  }
};

export const getSkillCategories = (skillsData: SkillsData): SkillCategory[] => {
  return [
    {
      name: 'AWS Core Services',
      skills: skillsData.Skills.awsCoreServices,
      icon: '☁️'
    },
    {
      name: 'Containers & Orchestration',
      skills: skillsData.Skills.containersOrchestration,
      icon: '🐳'
    },
    {
      name: 'Infrastructure as Code',
      skills: skillsData.Skills.infrastructureAsCode,
      icon: '🏗️'
    },
    {
      name: 'CI/CD & DevOps',
      skills: skillsData.Skills.ciCdDevOps,
      icon: '🔄'
    },
    {
      name: 'Programming Languages',
      skills: skillsData.Skills.programmingLanguages,
      icon: '💻'
    },
    {
      name: 'Monitoring & Observability',
      skills: skillsData.Skills.monitoringObservability,
      icon: '📊'
    },
    {
      name: 'Databases',
      skills: skillsData.Skills.databases,
      icon: '🗄️'
    },
    {
      name: 'Networking & Security',
      skills: skillsData.Skills.networkingSecurity,
      icon: '🔒'
    },
    {
      name: 'Management & Governance',
      skills: skillsData.Skills.managementGovernance,
      icon: '⚙️'
    },
    {
      name: 'Architectural Concepts',
      skills: skillsData.Skills.architecturalConcepts,
      icon: '🏛️'
    },
    {
      name: 'Systems & Hardware',
      skills: skillsData.Skills.systemsHardware,
      icon: '🖥️'
    }
  ];
};
