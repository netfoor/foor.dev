export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  location: string;
  type: 'education' | 'achievement' | 'leadership' | 'project' | 'recognition';
  icon: string;
  highlight?: boolean;
}

export const timelineEvents: TimelineEvent[] = [
  {
    year: "2020",
    title: "Started Software Engineering",
    description: "Began my journey in Software Engineering at Universidad Tecnológica de Puebla, with a clear vision to use technology for social transformation.",
    location: "Puebla, Mexico",
    type: "education",
    icon: "🎓"
  },
  {
    year: "2022",
    title: "Founded AWS User Group Puebla",
    description: "Established the first AWS User Group in Puebla, creating a community for cloud technology enthusiasts and professionals.",
    location: "Puebla, Mexico",
    type: "leadership",
    icon: "☁️",
    highlight: true
  },
  {
    year: "2023",
    title: "Winner - ANUIES4MX Challenge",
    description: "Selected to represent Mexico in Japan after winning the ANUIES4MX challenge, focusing on innovative technology solutions.",
    location: "Mexico → Japan",
    type: "achievement",
    icon: "🏆",
    highlight: true
  },
  {
    year: "2023",
    title: "Flood Monitoring System",
    description: "Developed an advanced flood monitoring system using cloud technologies during my time in Japan, addressing critical environmental challenges.",
    location: "Japan",
    type: "project",
    icon: "🌊"
  },
  {
    year: "2024",
    title: "SmartWaste Vision Project",
    description: "Led the development of an AI-powered waste separation solution, combining machine learning with environmental sustainability.",
    location: "Puebla, Mexico",
    type: "project",
    icon: "♻️",
    highlight: true
  },
  {
    year: "2024",
    title: "HackUTP Organizer",
    description: "Currently organizing HackUTP to inspire students to build innovative solutions for their communities and beyond.",
    location: "Puebla, Mexico",
    type: "leadership",
    icon: "💻"
  },
  {
    year: "2024",
    title: "AWS Solutions Architect",
    description: "Achieved AWS Solutions Architect certification, validating expertise in cloud architecture and best practices.",
    location: "Remote",
    type: "recognition",
    icon: "📜"
  }
];
