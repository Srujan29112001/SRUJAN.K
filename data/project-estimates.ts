// Project Estimation Data
// Pricing, timelines, and complexity calculations for the project calculator
// Aligned with portfolio skills and early-career professional rates

export interface ProjectType {
    id: string;
    name: string;
    icon: string;
    description: string;
    basePrice: { min: number; max: number };
    baseWeeks: { min: number; max: number };
}

export interface ComplexityLevel {
    id: string;
    name: string;
    multiplier: number;
    description: string;
}

export interface Feature {
    id: string;
    name: string;
    priceAdd: { min: number; max: number };
    weeksAdd: number;
    description: string;
    applicableProjectTypes: string[]; // Which project types can use this feature
    complexityMinimum?: string; // Minimum complexity level required
}

export interface ExampleProject {
    name: string;
    type: string;
    complexity: string;
    features: string[];
    timeline: string;
    priceRange: string;
    description: string;
}

// Project Types with Professional Pricing
export const projectTypes: ProjectType[] = [
    {
        id: 'ai-ml',
        name: 'AI/ML Solution',
        icon: '🧠',
        description: 'Machine learning models, LLM integration, data pipelines, and AI-powered features',
        basePrice: { min: 1000, max: 3200 },
        baseWeeks: { min: 2, max: 5 },
    },
    {
        id: 'chatbot-nlp',
        name: 'Chatbot & NLP',
        icon: '💬',
        description: 'Conversational AI, chatbots, text analysis, sentiment detection',
        basePrice: { min: 800, max: 2500 },
        baseWeeks: { min: 1, max: 4 },
    },
    {
        id: 'web-app',
        name: 'Web & Mobile Apps',
        icon: '📱',
        description: 'Full-stack web apps, React Native mobile apps, PWAs, and cross-platform solutions',
        basePrice: { min: 800, max: 2800 },
        baseWeeks: { min: 2, max: 6 },
    },
    {
        id: 'computer-vision',
        name: 'Computer Vision',
        icon: '👁️',
        description: 'Image/video analysis, object detection, OCR, visual AI systems',
        basePrice: { min: 1000, max: 3800 },
        baseWeeks: { min: 2, max: 6 },
    },
    {
        id: 'data-science',
        name: 'Data Science',
        icon: '📊',
        description: 'Data analysis, visualization, predictive modeling, business intelligence',
        basePrice: { min: 500, max: 1800 },
        baseWeeks: { min: 1, max: 4 },
    },
    {
        id: 'robotics',
        name: 'Robotics & IoT',
        icon: '🤖',
        description: 'Autonomous systems, ROS2 integration, embedded AI, drones',
        basePrice: { min: 1500, max: 5000 },
        baseWeeks: { min: 3, max: 8 },
    },
    {
        id: 'automation',
        name: 'Automation & Bots',
        icon: '⚡',
        description: 'Web scraping, workflow automation, data pipelines, task automation',
        basePrice: { min: 400, max: 1200 },
        baseWeeks: { min: 1, max: 3 },
    },
    {
        id: 'research',
        name: 'Research & Analysis',
        icon: '🔬',
        description: 'Technical research, prototyping, proof-of-concept, feasibility studies',
        basePrice: { min: 600, max: 1800 },
        baseWeeks: { min: 2, max: 5 },
    },
    {
        id: 'consulting',
        name: 'Consulting',
        icon: '💼',
        description: 'Technical consultation, architecture review, code audit, mentoring',
        basePrice: { min: 200, max: 600 },
        baseWeeks: { min: 0.5, max: 2 },
    },
];

// Complexity Levels
export const complexityLevels: ComplexityLevel[] = [
    {
        id: 'simple',
        name: 'Simple',
        multiplier: 1,
        description: 'Straightforward implementation, well-defined scope, standard features',
    },
    {
        id: 'moderate',
        name: 'Moderate',
        multiplier: 1.6,
        description: 'Custom features, moderate integrations, some specialized requirements',
    },
    {
        id: 'complex',
        name: 'Complex',
        multiplier: 2.5,
        description: 'Multiple integrations, custom algorithms, advanced features',
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        multiplier: 4.0,
        description: 'Large scale, high reliability, extensive customization',
    },
];

// Project Type-Specific Features
export const features: Feature[] = [
    // ============================================
    // AI/ML Solution Features
    // ============================================
    {
        id: 'custom-model-training',
        name: 'Custom Model Training',
        priceAdd: { min: 500, max: 1500 },
        weeksAdd: 1.5,
        description: 'Train custom ML models on your dataset with hyperparameter tuning',
        applicableProjectTypes: ['ai-ml', 'computer-vision'],
    },
    {
        id: 'rag-integration',
        name: 'RAG System',
        priceAdd: { min: 450, max: 1000 },
        weeksAdd: 1,
        description: 'Retrieval-Augmented Generation with vector database (Pinecone, ChromaDB)',
        applicableProjectTypes: ['ai-ml', 'chatbot-nlp'],
    },
    {
        id: 'llm-finetuning',
        name: 'LLM Fine-tuning (LoRA)',
        priceAdd: { min: 500, max: 1200 },
        weeksAdd: 1.5,
        description: 'Fine-tune open-source LLMs (Llama, Mistral) on your domain data',
        applicableProjectTypes: ['ai-ml', 'chatbot-nlp'],
        complexityMinimum: 'moderate',
    },
    {
        id: 'gpu-optimization',
        name: 'GPU Optimization',
        priceAdd: { min: 400, max: 900 },
        weeksAdd: 1,
        description: 'CUDA acceleration, TensorRT optimization for faster inference',
        applicableProjectTypes: ['ai-ml', 'computer-vision'],
        complexityMinimum: 'moderate',
    },
    {
        id: 'model-deployment',
        name: 'Model Deployment API',
        priceAdd: { min: 250, max: 600 },
        weeksAdd: 0.5,
        description: 'Deploy model as REST API with FastAPI/Flask, Docker containerization',
        applicableProjectTypes: ['ai-ml', 'computer-vision', 'chatbot-nlp'],
    },

    // ============================================
    // Chatbot & NLP Features
    // ============================================
    {
        id: 'multi-turn-memory',
        name: 'Conversation Memory',
        priceAdd: { min: 250, max: 600 },
        weeksAdd: 0.5,
        description: 'Multi-turn conversation with context retention and session management',
        applicableProjectTypes: ['chatbot-nlp'],
    },
    {
        id: 'voice-integration',
        name: 'Voice Integration',
        priceAdd: { min: 400, max: 900 },
        weeksAdd: 1,
        description: 'Speech-to-text and text-to-speech capabilities',
        applicableProjectTypes: ['chatbot-nlp'],
    },
    {
        id: 'sentiment-analysis',
        name: 'Sentiment Analysis',
        priceAdd: { min: 250, max: 550 },
        weeksAdd: 0.5,
        description: 'Real-time emotion and sentiment detection from text',
        applicableProjectTypes: ['chatbot-nlp', 'data-science'],
    },
    {
        id: 'multi-language',
        name: 'Multi-Language Support',
        priceAdd: { min: 300, max: 750 },
        weeksAdd: 1,
        description: 'Support for multiple languages with translation capabilities',
        applicableProjectTypes: ['chatbot-nlp'],
    },
    {
        id: 'platform-integration',
        name: 'Platform Integration',
        priceAdd: { min: 200, max: 500 },
        weeksAdd: 0.5,
        description: 'Integrate with WhatsApp, Telegram, Slack, Discord, or website widget',
        applicableProjectTypes: ['chatbot-nlp', 'automation'],
    },

    // ============================================
    // Web & Mobile App Features
    // ============================================
    {
        id: 'custom-design',
        name: 'Custom UI/UX Design',
        priceAdd: { min: 400, max: 1000 },
        weeksAdd: 1,
        description: 'Premium custom interface design with modern aesthetics',
        applicableProjectTypes: ['web-app'],
    },
    {
        id: 'auth-system',
        name: 'Authentication System',
        priceAdd: { min: 250, max: 600 },
        weeksAdd: 0.5,
        description: 'User authentication with OAuth, social login, role-based access',
        applicableProjectTypes: ['web-app'],
    },
    {
        id: 'payment-integration',
        name: 'Payment Integration',
        priceAdd: { min: 300, max: 750 },
        weeksAdd: 1,
        description: 'Stripe, PayPal, or other payment gateway integration',
        applicableProjectTypes: ['web-app'],
    },
    {
        id: 'realtime-features',
        name: 'Real-time Features',
        priceAdd: { min: 400, max: 900 },
        weeksAdd: 1,
        description: 'WebSocket, live updates, notifications, collaborative features',
        applicableProjectTypes: ['web-app'],
        complexityMinimum: 'moderate',
    },
    {
        id: 'dashboard-analytics',
        name: 'Dashboard & Analytics',
        priceAdd: { min: 450, max: 1100 },
        weeksAdd: 1.5,
        description: 'Interactive charts, data visualization, admin dashboard',
        applicableProjectTypes: ['web-app', 'data-science'],
    },
    {
        id: 'react-native-app',
        name: 'React Native Mobile App',
        priceAdd: { min: 400, max: 900 },
        weeksAdd: 1.5,
        description: 'Cross-platform iOS & Android app with React Native',
        applicableProjectTypes: ['web-app'],
    },
    {
        id: 'pwa',
        name: 'Progressive Web App (PWA)',
        priceAdd: { min: 200, max: 500 },
        weeksAdd: 0.5,
        description: 'Installable web app with offline support',
        applicableProjectTypes: ['web-app'],
    },
    {
        id: 'push-notifications',
        name: 'Push Notifications',
        priceAdd: { min: 150, max: 400 },
        weeksAdd: 0.5,
        description: 'Web and mobile push notifications with Firebase/OneSignal',
        applicableProjectTypes: ['web-app'],
    },
    {
        id: 'responsive-design',
        name: 'Responsive Design',
        priceAdd: { min: 150, max: 350 },
        weeksAdd: 0.5,
        description: 'Fully responsive design for all screen sizes',
        applicableProjectTypes: ['web-app'],
    },
    {
        id: 'cms-integration',
        name: 'CMS Integration',
        priceAdd: { min: 200, max: 500 },
        weeksAdd: 1,
        description: 'Headless CMS (Strapi, Sanity) for content management',
        applicableProjectTypes: ['web-app'],
    },

    // ============================================
    // Computer Vision Features
    // ============================================
    {
        id: 'object-detection',
        name: 'Object Detection (YOLO)',
        priceAdd: { min: 350, max: 900 },
        weeksAdd: 1,
        description: 'Real-time object detection using YOLOv8/v9 with custom training',
        applicableProjectTypes: ['computer-vision'],
    },
    {
        id: 'image-segmentation',
        name: 'Image Segmentation',
        priceAdd: { min: 400, max: 1000 },
        weeksAdd: 1.5,
        description: 'Semantic/instance segmentation using SAM, Mask R-CNN',
        applicableProjectTypes: ['computer-vision'],
        complexityMinimum: 'moderate',
    },
    {
        id: 'ocr-processing',
        name: 'OCR & Document AI',
        priceAdd: { min: 300, max: 700 },
        weeksAdd: 1,
        description: 'Text extraction, document parsing, form processing',
        applicableProjectTypes: ['computer-vision', 'automation'],
    },
    {
        id: 'face-recognition',
        name: 'Face Recognition',
        priceAdd: { min: 350, max: 800 },
        weeksAdd: 1,
        description: 'Face detection, recognition, and verification system',
        applicableProjectTypes: ['computer-vision'],
    },
    {
        id: 'video-analytics',
        name: 'Video Analytics',
        priceAdd: { min: 400, max: 900 },
        weeksAdd: 1.5,
        description: 'Real-time video processing, tracking, activity recognition',
        applicableProjectTypes: ['computer-vision'],
        complexityMinimum: 'moderate',
    },
    {
        id: 'edge-deployment',
        name: 'Edge Deployment',
        priceAdd: { min: 300, max: 750 },
        weeksAdd: 1,
        description: 'Deploy on Jetson, Raspberry Pi, or mobile devices',
        applicableProjectTypes: ['computer-vision', 'ai-ml', 'robotics'],
        complexityMinimum: 'moderate',
    },

    // ============================================
    // Data Science Features
    // ============================================
    {
        id: 'data-cleaning',
        name: 'Data Cleaning & Prep',
        priceAdd: { min: 150, max: 400 },
        weeksAdd: 0.5,
        description: 'Data preprocessing, cleaning, feature engineering pipeline',
        applicableProjectTypes: ['data-science', 'ai-ml'],
    },
    {
        id: 'predictive-modeling',
        name: 'Predictive Modeling',
        priceAdd: { min: 300, max: 700 },
        weeksAdd: 1,
        description: 'ML models for forecasting, classification, regression',
        applicableProjectTypes: ['data-science', 'ai-ml'],
    },
    {
        id: 'time-series',
        name: 'Time Series Analysis',
        priceAdd: { min: 250, max: 600 },
        weeksAdd: 1,
        description: 'ARIMA, Prophet, LSTM for forecasting trends',
        applicableProjectTypes: ['data-science'],
    },
    {
        id: 'visualization-dashboard',
        name: 'Interactive Visualization',
        priceAdd: { min: 200, max: 500 },
        weeksAdd: 0.5,
        description: 'Plotly, Streamlit, or web-based interactive dashboards',
        applicableProjectTypes: ['data-science'],
    },
    {
        id: 'report-generation',
        name: 'Automated Reports',
        priceAdd: { min: 150, max: 350 },
        weeksAdd: 0.5,
        description: 'Auto-generated PDF/Excel reports with insights',
        applicableProjectTypes: ['data-science', 'automation'],
    },

    // ============================================
    // Robotics & IoT Features
    // ============================================
    {
        id: 'ros2-integration',
        name: 'ROS2 Integration',
        priceAdd: { min: 400, max: 900 },
        weeksAdd: 1.5,
        description: 'ROS2 setup with custom nodes, topics, and services',
        applicableProjectTypes: ['robotics'],
    },
    {
        id: 'slam-navigation',
        name: 'SLAM & Navigation',
        priceAdd: { min: 500, max: 1100 },
        weeksAdd: 2,
        description: 'Nav2 stack, path planning, obstacle avoidance',
        applicableProjectTypes: ['robotics'],
        complexityMinimum: 'moderate',
    },
    {
        id: 'sensor-fusion',
        name: 'Sensor Fusion',
        priceAdd: { min: 400, max: 1000 },
        weeksAdd: 1.5,
        description: 'Multi-sensor integration (LiDAR, camera, IMU) with filtering',
        applicableProjectTypes: ['robotics'],
        complexityMinimum: 'moderate',
    },
    {
        id: 'drone-control',
        name: 'Drone/UAV Control',
        priceAdd: { min: 400, max: 900 },
        weeksAdd: 1.5,
        description: 'Flight control, mission planning, autonomous navigation',
        applicableProjectTypes: ['robotics'],
    },
    {
        id: 'simulation-env',
        name: 'Simulation Environment',
        priceAdd: { min: 300, max: 700 },
        weeksAdd: 1,
        description: 'Gazebo/Isaac Sim setup for testing and development',
        applicableProjectTypes: ['robotics'],
    },
    {
        id: 'embedded-ai',
        name: 'Embedded AI',
        priceAdd: { min: 350, max: 850 },
        weeksAdd: 1.5,
        description: 'Deploy AI models on Jetson, Arduino, ESP32, STM32',
        applicableProjectTypes: ['robotics'],
    },

    // ============================================
    // Automation & Bots Features
    // ============================================
    {
        id: 'web-scraping',
        name: 'Web Scraping',
        priceAdd: { min: 150, max: 400 },
        weeksAdd: 0.5,
        description: 'Automated data extraction from websites (Selenium, Scrapy)',
        applicableProjectTypes: ['automation'],
    },
    {
        id: 'api-integration',
        name: 'API Integration',
        priceAdd: { min: 100, max: 300 },
        weeksAdd: 0.5,
        description: 'Connect and sync data between multiple APIs/services',
        applicableProjectTypes: ['automation', 'web-app'],
    },
    {
        id: 'scheduled-tasks',
        name: 'Scheduled Tasks',
        priceAdd: { min: 100, max: 250 },
        weeksAdd: 0.5,
        description: 'Cron jobs, scheduled runs, automated workflows',
        applicableProjectTypes: ['automation'],
    },
    {
        id: 'email-automation',
        name: 'Email Automation',
        priceAdd: { min: 150, max: 350 },
        weeksAdd: 0.5,
        description: 'Automated email sending, parsing, and responses',
        applicableProjectTypes: ['automation'],
    },
    {
        id: 'data-pipeline',
        name: 'Data Pipeline',
        priceAdd: { min: 250, max: 600 },
        weeksAdd: 1,
        description: 'ETL pipelines, data transformation, batch processing',
        applicableProjectTypes: ['automation', 'data-science'],
    },

    // ============================================
    // Research & Analysis Features
    // ============================================
    {
        id: 'literature-review',
        name: 'Literature Review',
        priceAdd: { min: 150, max: 400 },
        weeksAdd: 1,
        description: 'Comprehensive review of papers and industry solutions',
        applicableProjectTypes: ['research'],
    },
    {
        id: 'poc-development',
        name: 'Proof of Concept',
        priceAdd: { min: 300, max: 700 },
        weeksAdd: 1.5,
        description: 'Working prototype demonstrating core functionality',
        applicableProjectTypes: ['research'],
    },
    {
        id: 'feasibility-report',
        name: 'Feasibility Report',
        priceAdd: { min: 200, max: 500 },
        weeksAdd: 1,
        description: 'Technical feasibility analysis with recommendations',
        applicableProjectTypes: ['research', 'consulting'],
    },
    {
        id: 'benchmark-study',
        name: 'Benchmark Study',
        priceAdd: { min: 200, max: 500 },
        weeksAdd: 1,
        description: 'Comparative analysis and performance benchmarks',
        applicableProjectTypes: ['research'],
    },
    {
        id: 'eeg-analysis',
        name: 'EEG/BCI Analysis',
        priceAdd: { min: 400, max: 1000 },
        weeksAdd: 2,
        description: 'Neural signal processing, brainwave analysis, BCI development',
        applicableProjectTypes: ['research', 'ai-ml'],
        complexityMinimum: 'moderate',
    },

    // ============================================
    // Consulting Features
    // ============================================
    {
        id: 'architecture-review',
        name: 'Architecture Review',
        priceAdd: { min: 100, max: 300 },
        weeksAdd: 0.25,
        description: 'System architecture assessment with improvement recommendations',
        applicableProjectTypes: ['consulting'],
    },
    {
        id: 'code-audit',
        name: 'Code Audit',
        priceAdd: { min: 150, max: 400 },
        weeksAdd: 0.5,
        description: 'Code review with quality, performance, and security analysis',
        applicableProjectTypes: ['consulting'],
    },
    {
        id: 'strategy-session',
        name: 'Strategy Session',
        priceAdd: { min: 75, max: 200 },
        weeksAdd: 0.1,
        description: '1-2 hour intensive technical planning session',
        applicableProjectTypes: ['consulting'],
    },
    {
        id: 'mentoring',
        name: 'Technical Mentoring',
        priceAdd: { min: 200, max: 500 },
        weeksAdd: 1,
        description: 'Hands-on guidance and mentoring for your team',
        applicableProjectTypes: ['consulting'],
    },
    {
        id: 'tech-stack-selection',
        name: 'Tech Stack Selection',
        priceAdd: { min: 100, max: 250 },
        weeksAdd: 0.25,
        description: 'Help choosing the right technologies for your project',
        applicableProjectTypes: ['consulting'],
    },

    // ============================================
    // Universal Features (All Project Types)
    // ============================================
    {
        id: 'cloud-deploy',
        name: 'Cloud Deployment',
        priceAdd: { min: 150, max: 400 },
        weeksAdd: 0.5,
        description: 'Deploy on AWS, GCP, or Azure with basic setup',
        applicableProjectTypes: ['ai-ml', 'web-app', 'computer-vision', 'chatbot-nlp', 'data-science', 'automation'],
    },
    {
        id: 'docker-container',
        name: 'Docker Container',
        priceAdd: { min: 100, max: 250 },
        weeksAdd: 0.25,
        description: 'Containerize application with Docker for easy deployment',
        applicableProjectTypes: ['ai-ml', 'web-app', 'computer-vision', 'chatbot-nlp', 'automation'],
    },
    {
        id: 'documentation',
        name: 'Documentation',
        priceAdd: { min: 100, max: 300 },
        weeksAdd: 0.5,
        description: 'Technical docs, API references, setup guides',
        applicableProjectTypes: ['ai-ml', 'web-app', 'computer-vision', 'robotics', 'chatbot-nlp', 'data-science', 'automation', 'research', 'consulting'],
    },
    {
        id: 'testing',
        name: 'Test Suite',
        priceAdd: { min: 150, max: 400 },
        weeksAdd: 0.5,
        description: 'Unit tests, integration tests for code reliability',
        applicableProjectTypes: ['ai-ml', 'web-app', 'computer-vision', 'chatbot-nlp', 'automation'],
    },
    {
        id: 'maintenance-1month',
        name: '1 Month Support',
        priceAdd: { min: 100, max: 250 },
        weeksAdd: 0,
        description: 'Bug fixes and minor updates for 1 month after delivery',
        applicableProjectTypes: ['ai-ml', 'web-app', 'computer-vision', 'robotics', 'chatbot-nlp', 'data-science', 'automation'],
    },
    {
        id: 'priority-delivery',
        name: 'Priority Delivery',
        priceAdd: { min: 200, max: 500 },
        weeksAdd: -0.5,
        description: 'Expedited timeline with faster turnaround',
        applicableProjectTypes: ['ai-ml', 'web-app', 'computer-vision', 'chatbot-nlp', 'data-science', 'automation'],
    },
    {
        id: 'source-code',
        name: 'Full Source Code',
        priceAdd: { min: 0, max: 0 },
        weeksAdd: 0,
        description: 'Complete source code with comments (included by default)',
        applicableProjectTypes: ['ai-ml', 'web-app', 'computer-vision', 'robotics', 'chatbot-nlp', 'data-science', 'automation', 'research'],
    },
];

// Example Projects with Realistic Pricing
export const exampleProjects: ExampleProject[] = [
    {
        name: 'Customer Support Chatbot',
        type: 'chatbot-nlp',
        complexity: 'moderate',
        features: ['rag-integration', 'multi-turn-memory', 'platform-integration'],
        timeline: '2-4 weeks',
        priceRange: '$1,500 - $3,500',
        description: 'RAG-powered chatbot trained on your knowledge base with Telegram integration.',
    },
    {
        name: 'Food Delivery App',
        type: 'web-app',
        complexity: 'moderate',
        features: ['custom-design', 'auth-system', 'react-native-app', 'push-notifications'],
        timeline: '5-8 weeks',
        priceRange: '$2,000 - $5,200',
        description: 'Cross-platform mobile app with web admin dashboard, real-time tracking, and push notifications.',
    },
    {
        name: 'Product Detection System',
        type: 'computer-vision',
        complexity: 'simple',
        features: ['object-detection', 'model-deployment'],
        timeline: '2-4 weeks',
        priceRange: '$1,400 - $3,400',
        description: 'YOLOv8-based product detection with REST API deployment.',
    },
    {
        name: 'Sales Forecasting Model',
        type: 'data-science',
        complexity: 'moderate',
        features: ['data-cleaning', 'predictive-modeling', 'visualization-dashboard'],
        timeline: '2-4 weeks',
        priceRange: '$1,050 - $2,600',
        description: 'ML model for sales prediction with interactive Streamlit dashboard.',
    },
    {
        name: 'Web Scraping Bot',
        type: 'automation',
        complexity: 'simple',
        features: ['web-scraping', 'scheduled-tasks', 'data-pipeline'],
        timeline: '1-2 weeks',
        priceRange: '$500 - $1,250',
        description: 'Automated data extraction from multiple sites with daily scheduling.',
    },
    {
        name: 'Architecture Consultation',
        type: 'consulting',
        complexity: 'simple',
        features: ['architecture-review', 'tech-stack-selection'],
        timeline: '3-5 days',
        priceRange: '$350 - $1,000',
        description: 'System architecture review and technology recommendations.',
    },
];

// Get features applicable to a project type and complexity
export function getApplicableFeatures(projectTypeId: string, complexityId: string): Feature[] {
    const complexityOrder = ['simple', 'moderate', 'complex', 'enterprise'];
    const currentComplexityIndex = complexityOrder.indexOf(complexityId);

    return features.filter(feature => {
        // Check if feature applies to this project type
        if (!feature.applicableProjectTypes.includes(projectTypeId)) {
            return false;
        }

        // Check complexity minimum requirement
        if (feature.complexityMinimum) {
            const minComplexityIndex = complexityOrder.indexOf(feature.complexityMinimum);
            if (currentComplexityIndex < minComplexityIndex) {
                return false;
            }
        }

        return true;
    });
}

// Calculate estimate function
export function calculateEstimate(
    projectTypeId: string,
    complexityId: string,
    selectedFeatureIds: string[]
): {
    priceMin: number;
    priceMax: number;
    weeksMin: number;
    weeksMax: number;
    complexityScore: number;
} {
    const projectType = projectTypes.find(p => p.id === projectTypeId);
    const complexity = complexityLevels.find(c => c.id === complexityId);

    if (!projectType || !complexity) {
        return { priceMin: 0, priceMax: 0, weeksMin: 0, weeksMax: 0, complexityScore: 0 };
    }

    // Complexity scaling factors
    // Price scales with full multiplier, timeline scales at reduced rate
    const priceMultiplier = complexity.multiplier;
    const timeMultiplier = 1 + (complexity.multiplier - 1) * 0.4; // 40% of price scaling for time

    // Base calculations with complexity multiplier
    let priceMin = projectType.basePrice.min * priceMultiplier;
    let priceMax = projectType.basePrice.max * priceMultiplier;
    let weeksMin = projectType.baseWeeks.min * timeMultiplier;
    let weeksMax = projectType.baseWeeks.max * timeMultiplier;

    // Add feature costs WITH complexity scaling
    selectedFeatureIds.forEach(featureId => {
        const feature = features.find(f => f.id === featureId);
        if (feature) {
            // Feature prices scale with complexity (but at reduced rate: 60% of multiplier)
            const featurePriceScale = 1 + (priceMultiplier - 1) * 0.6;
            priceMin += feature.priceAdd.min * featurePriceScale;
            priceMax += feature.priceAdd.max * featurePriceScale;

            // Feature timelines also scale with complexity
            weeksMin += feature.weeksAdd * timeMultiplier * 0.8;
            weeksMax += feature.weeksAdd * timeMultiplier * 1.1;
        }
    });

    // Ensure minimum values
    weeksMin = Math.max(0.5, weeksMin);
    weeksMax = Math.max(1, weeksMax);

    // Calculate complexity score (1-10)
    const complexityBaseScore = complexityLevels.findIndex(c => c.id === complexityId) * 2 + 2;
    const featureComplexity = Math.min(selectedFeatureIds.length * 0.4, 2);
    const complexityScore = Math.min(complexityBaseScore + featureComplexity, 10);

    return {
        priceMin: Math.round(priceMin),
        priceMax: Math.round(priceMax),
        weeksMin: Math.round(weeksMin * 10) / 10,
        weeksMax: Math.round(weeksMax * 10) / 10,
        complexityScore: Math.round(complexityScore * 10) / 10,
    };
}

// Format price for display
export function formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
