import { Cpu, Brain, Microscope, Terminal, Globe, Layers, Code, Database } from 'lucide-react';

export interface SkillCategory {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  proficiency: number; // 0-100
  details?: string; // Extra context for the tooltip
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'ai-core',
    title: 'Artificial Intelligence',
    icon: Brain,
    color: '#3B82F6', // Blue
    description: 'Architecting intelligent systems from neural foundations to agentic workflows.',
    skills: [
      { name: 'Deep Learning (CNNs, ViTs)', proficiency: 98, details: 'ResNet, EfficientNet, Transformers' },
      { name: 'LLMs & RAG Systems', proficiency: 95, details: 'Llama-2/3, LangChain, Vector DBs' },
      { name: 'Generative AI (GANs, Diffusers)', proficiency: 92, details: 'Stable Diffusion, ESRGAN, LoRA' },
      { name: 'Reinforcement Learning', proficiency: 90, details: 'Q-Learning, PPO, Multi-Agent Systems' },
      { name: 'Computer Vision', proficiency: 96, details: 'YOLOv8, Segmentation, 3D Reconstruction' },
      { name: 'NLP & Semantic Search', proficiency: 94, details: 'BERT, Embeddings, Sentiment Analysis' },
      { name: 'Time Series Forecasting', proficiency: 88, details: 'ARIMA, NeuralProphet, LSTM' },
      { name: 'Neuromorphic Computing', proficiency: 85, details: 'Spiking Neural Networks, BCI' },
    ],
  },
  {
    id: 'robotics',
    title: 'Robotics & Control',
    icon: Cpu,
    color: '#F59E0B', // Amber
    description: 'Bridging the gap between digital intelligence and physical action.',
    skills: [
      { name: 'ROS 2 & Navigation', proficiency: 92, details: 'Nav2, Gazebo, MoveIt' },
      { name: 'Control Systems', proficiency: 90, details: 'PID, MPC, LQR, Kalman Filters' },
      { name: 'SLAM & Path Planning', proficiency: 88, details: 'GMapping, A*, RRT*' },
      { name: 'Embedded AI (Edge)', proficiency: 95, details: 'Jetson AGX, TensorRT, DeepStream' },
      { name: 'Sensor Fusion', proficiency: 89, details: 'LiDAR, Camera, IMU, GNSS' },
      { name: 'Drone Flight Control', proficiency: 87, details: 'Pixhawk, ArduPilot, PX4' },
      { name: 'Simulation', proficiency: 94, details: 'Isaac Sim, MATLAB/Simulink, PyBullet' },
      { name: 'Microcontrollers', proficiency: 92, details: 'Arduino, ESP32, STM32' },
    ],
  },
  {
    id: 'research',
    title: 'Scientific Research',
    icon: Microscope,
    color: '#8B7EC8', // Purple
    description: 'Exploring the theoretical frontiers of complexity, chaos, and consciousness.',
    skills: [
      { name: 'Computational Neuroscience', proficiency: 88, details: 'EEG Analysis, BCI, Neural Decoding' },
      { name: 'Chaos & Nonlinear Dynamics', proficiency: 85, details: 'Lorenz Attractors, Lyapunov Exponents' },
      { name: 'Quantum Physics Sims', proficiency: 82, details: 'Schrödinger Eq, Wavepacket Dynamics' },
      { name: 'Computational Biology', proficiency: 86, details: 'AlphaFold, Protein Structure, MSA' },
      { name: 'Space Science', proficiency: 84, details: 'Exoplanet Detection, Orbital Mechanics' },
      { name: 'Signal Processing', proficiency: 90, details: 'FFT, Wavelets, Spectral Analysis' },
      { name: 'Game Theory', proficiency: 80, details: 'Nash Equilibrium, Multi-Agent Strategy' },
      { name: 'Technical Writing', proficiency: 98, details: 'Research Papers, Documentation' },
    ],
  },
  {
    id: 'tools',
    title: 'Engineering Arsenal',
    icon: Terminal,
    color: '#10B981', // Emerald
    description: 'The full-stack toolkit for building scalable, production-grade solutions.',
    skills: [
      { name: 'Python & C++', proficiency: 99, details: 'Primary Languages' },
      { name: 'CUDA Programming', proficiency: 85, details: 'Parallel Computing, Kernel Optimization' },
      { name: 'Docker & Kubernetes', proficiency: 88, details: 'Containerization, Orchestration' },
      { name: 'Cloud (AWS/GCP)', proficiency: 84, details: 'SageMaker, EC2, Cloud Functions' },
      { name: 'Linux / Bash', proficiency: 92, details: 'System Admin, Shell Scripting' },
      { name: 'Git & CI/CD', proficiency: 94, details: 'GitHub Actions, Workflow Automation' },
      { name: 'Web Development', proficiency: 86, details: 'React, Next.js, Three.js, Tailwind' },
      { name: 'Data Visualization', proficiency: 90, details: 'Plotly, Seaborn, Matplotlib' },
    ],
  },
];
