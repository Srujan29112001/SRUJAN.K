// Gallery data with placeholder images
// Replace these URLs with your actual project images

export interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  category?: string;
}

// Project screenshots and demos
export const projectGallery: GalleryImage[] = [
  {
    src: '/images/projects/neural-network-viz.jpg',
    alt: 'Neural Network Visualization',
    title: 'Neural Network Architecture',
    description: 'Interactive 3D visualization of deep learning model layers',
    category: 'AI/ML',
  },
  {
    src: '/images/projects/robot-arm.jpg',
    alt: 'Robotic Arm Control System',
    title: 'Precision Robotics',
    description: 'Real-time control system for industrial automation',
    category: 'ROBOTICS',
  },
  {
    src: '/images/projects/drone-swarm.jpg',
    alt: 'Drone Swarm Intelligence',
    title: 'Swarm Coordination',
    description: 'Multi-agent pathfinding and collision avoidance',
    category: 'AUTONOMOUS',
  },
  {
    src: '/images/projects/cv-detection.jpg',
    alt: 'Computer Vision Detection',
    title: 'Object Detection',
    description: 'Real-time detection with 95%+ accuracy',
    category: 'CV',
  },
  {
    src: '/images/projects/nlp-dashboard.jpg',
    alt: 'NLP Analysis Dashboard',
    title: 'Language Processing',
    description: 'Sentiment analysis and entity extraction platform',
    category: 'NLP',
  },
  {
    src: '/images/projects/reinforcement-learning.jpg',
    alt: 'Reinforcement Learning Environment',
    title: 'RL Training',
    description: 'Custom gym environment for robot training',
    category: 'AI/ML',
  },
];

// About section gallery
export const aboutGallery: GalleryImage[] = [
  {
    src: '/images/about/workspace.jpg',
    alt: 'Development Workspace',
    title: 'Where Ideas Come to Life',
    description: 'My setup for building the future',
    category: 'WORKSPACE',
  },
  {
    src: '/images/about/lab.jpg',
    alt: 'Research Lab',
    title: 'DRDO Research Lab',
    description: 'Advanced defense research facility',
    category: 'RESEARCH',
  },
  {
    src: '/images/about/presentation.jpg',
    alt: 'Conference Presentation',
    title: 'Sharing Knowledge',
    description: 'Speaking at AI/ML conferences',
    category: 'SPEAKING',
  },
  {
    src: '/images/about/team.jpg',
    alt: 'Team Collaboration',
    title: 'Building Together',
    description: 'Working with brilliant minds',
    category: 'TEAM',
  },
];

// Technology/skills gallery
export const techGallery: GalleryImage[] = [
  {
    src: '/images/tech/tensorflow.jpg',
    alt: 'TensorFlow Projects',
    title: 'Deep Learning',
    category: 'FRAMEWORK',
  },
  {
    src: '/images/tech/pytorch.jpg',
    alt: 'PyTorch Research',
    title: 'Neural Networks',
    category: 'FRAMEWORK',
  },
  {
    src: '/images/tech/ros.jpg',
    alt: 'ROS Development',
    title: 'Robot Operating System',
    category: 'ROBOTICS',
  },
  {
    src: '/images/tech/computer-vision.jpg',
    alt: 'Computer Vision',
    title: 'Vision Systems',
    category: 'CV',
  },
];

// Video showcase data
export interface VideoItem {
  src?: string;
  youtubeId?: string;
  poster?: string;
  title: string;
  description?: string;
}

export const projectVideos: VideoItem[] = [
  {
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual video ID
    title: 'AI-Powered Robot Navigation',
    description: 'Demonstration of autonomous navigation using deep reinforcement learning',
  },
  {
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual video ID
    title: 'Real-time Object Detection',
    description: 'YOLO-based detection system running at 60 FPS',
  },
  {
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual video ID
    title: 'Drone Swarm Simulation',
    description: 'Multi-agent coordination with obstacle avoidance',
  },
  {
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual video ID
    title: 'NLP Pipeline Demo',
    description: 'End-to-end natural language processing system',
  },
];

// Placeholder image generator URLs (for development)
// These use placeholder services - replace with actual images in production
export const placeholderImages = {
  // Using picsum.photos for random images
  hero: 'https://picsum.photos/1920/1080',
  project: (id: number) => `https://picsum.photos/seed/${id}/800/600`,
  about: (id: number) => `https://picsum.photos/seed/about${id}/600/400`,
  profile: 'https://picsum.photos/seed/profile/400/400',

  // Gradient placeholder (fallback)
  gradient: (color1 = '6D64A3', color2 = '06B6D4') =>
    `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23${color1}'/%3E%3Cstop offset='100%25' stop-color='%23${color2}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='800' height='600'/%3E%3C/svg%3E`,
};

// Gallery with development placeholders
export const devProjectGallery: GalleryImage[] = projectGallery.map((img, i) => ({
  ...img,
  src: placeholderImages.project(i + 1),
}));

export const devAboutGallery: GalleryImage[] = aboutGallery.map((img, i) => ({
  ...img,
  src: placeholderImages.about(i + 1),
}));
