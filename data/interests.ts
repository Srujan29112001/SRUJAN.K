export interface Interest {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
}

export const interests: Interest[] = [
  {
    id: 'guitar',
    title: 'Guitar',
    subtitle: 'Pattern Recognition Under Uncertainty',
    description:
      'Improvisation teaches real-time pattern recognition and creative problem-solving within constraints.',
    icon: '🎸',
    color: '#F59E0B',
  },
  {
    id: 'football',
    title: 'Freestyle Football',
    subtitle: 'Real-time Sensorimotor Prediction',
    description:
      'Ball control demands instant feedback loops, predictive modeling, and dynamic system adaptation.',
    icon: '⚽',
    color: '#10B981',
  },
  {
    id: 'fpv',
    title: 'FPV Drone Racing',
    subtitle: 'Control Theory at 100 MPH',
    description:
      'Split-second decisions testing edge-case control systems and spatial awareness.',
    icon: '🚁',
    color: '#6D64A3',
  },
  {
    id: 'boxing',
    title: 'Boxing',
    subtitle: 'Decision-Making Under Pressure',
    description:
      'Strategic thinking, rapid threat assessment, and composure when stakes are high.',
    icon: '🥊',
    color: '#EF4444',
  },
  {
    id: 'skateboarding',
    title: 'Skateboarding',
    subtitle: 'Balance, Adaptation, Iteration',
    description:
      'Pushing limits through complex tricks, learning from failures, iterating toward mastery.',
    icon: '🛹',
    color: '#8B7EC8',
  },
];
