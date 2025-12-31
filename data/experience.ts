export interface Experience {
  id: string;
  title: string;
  organization: string;
  period: string;
  type: 'work' | 'education' | 'research';
  description: string;
  highlights: string[];
  color: string;
  image?: string;
}

export const experiences: Experience[] = [
  {
    id: 'drdo',
    title: 'Research Intern',
    organization: 'DRDO - DRDL',
    period: '2022 - 2023',
    type: 'work',
    description:
      'Worked on AI-based aerial object detection systems for defense applications.',
    highlights: [
      'Developed "AI-Band Vision" for aerial object detection',
      'Implemented YOLOv7 on Jetson AGX Xavier with TensorRT',
      'Achieved 95% field accuracy in real-time inference',
      'Mentored by Dr. Akula Naresh (Scientist-F)',
    ],
    color: '#F59E0B',
    image: '/images/experience/drdo.png',
  },
  {
    id: 'thapar',
    title: 'B.E. Electronics & Communication',
    organization: 'Thapar Institute of Engineering & Technology',
    period: '2019 - 2023',
    type: 'education',
    description:
      'Specialized in Robotics, Control Systems, and Signal Processing.',
    highlights: [
      'Focus on Embedded Systems and AI/ML',
      'Multiple research projects in Robotics and BCI',
      'Graduated with First Class with Distinction',
    ],
    color: '#06B6D4',
    image: '/images/experience/thapar.png',
  },
  {
    id: 'sabbatical',
    title: 'Independent Researcher',
    organization: 'Self-Directed Sabbatical',
    period: '2023 - Present',
    type: 'research',
    description:
      'Deep dive into Consciousness Studies, Neuromorphic Computing, and AGI.',
    highlights: [
      'Researching foundations of intelligence and consciousness',
      'Developing neuromorphic architectures for AI',
      'Exploring intersections of Game Theory and Decision Making',
    ],
    color: '#8B7EC8',
    image: '/images/experience/sabbatical.png',
  },
];

export const workExperiences = experiences.filter((e) => e.type === 'work');
export const educationExperiences = experiences.filter((e) => e.type === 'education');
export const researchExperiences = experiences.filter((e) => e.type === 'research');
