
export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface Project {
  id: string;
  title: string;
  category: 'AI' | 'Robotics' | 'Research';
  metric?: string;
  description: string;
  longDescription?: string;
  tech: string[];
  image: string;
  gallery?: ProjectImage[];
  color: string;
  featured: boolean;
  ongoing?: boolean;
  link?: string;
  /** true → `link` is a real, usable deployed app (shows a red "Try it"
   *  button) rather than a demo video/recording ("View Live Demo"). */
  liveApp?: boolean;
  github?: string;
  documentation?: string;
  year?: string;
  role?: string;
  architectureImage?: string;
}

export const projects: Project[] = [
  {
    "id": "helix-data-agent",
    "title": "Helix — Autonomous Data Science Agent",
    "category": "AI",
    "metric": "Multi-Agent AutoML",
    "description": "Capstone (IIIT-H GenAI). Upload a CSV and ask in plain English — seven AI agents plan, write code, self-correct on errors, build the model, and explain the result, end to end.",
    "longDescription": "Helix turns \"a CSV + a plain-English question\" into a business-ready answer automatically — the capstone project from my IIIT Hyderabad × TalentSprint Advanced GenAI & Prompt Engineering certification. It attacks the organizational \"data bottleneck\": scarce data scientists, the 60–70% of analyst time lost to cleaning, and brittle code that breaks on iteration.\n\nARCHITECTURE — two parts. The frontend is a Next.js 16 / React 19 \"Studio\" (Tailwind v4, Framer Motion, canvas visualizations) where users upload a dataset, state a goal, and watch the agents work in real time over Server-Sent Events. The backend is a FastAPI + LangGraph multi-agent orchestration layer modeled as a directed state graph: agents run sequentially with conditional looping for self-correction.\n\nTHE SEVEN AGENTS — (1) Planner decomposes the goal into ordered steps via LLM chain-of-thought; (2) Coder generates Python per step, grounded by RAG so it does not hallucinate APIs; (3) Executor runs code in a sandbox; (4) Critic reads tracebacks, patches the code, and retries (up to 5 attempts) — the self-healing loop; (5) AutoML searches models and hyperparameters with FLAML; (6) Explainer quantifies feature importance with SHAP; (7) Reporter writes the business narrative.\n\nWORKFLOW — auto-detects the task type (classification / regression / clustering / NLP), cleans messy data, builds and tunes a model, surfaces the key drivers, and produces a report — without human intervention. Code generation is RAG-grounded via ChromaDB + sentence-transformers; execution is sandboxed with RestrictedPython (no file/network access); code uses DeepSeek-Coder and narratives use Mistral-7B.\n\nIt is domain-agnostic (finance, retail, healthcare, marketing) and built for business teams and analysts who need fast insight from tabular data without writing code. Live app: helix-henna.vercel.app.",
    "tech": [
      "LangGraph",
      "FastAPI",
      "Next.js",
      "LangChain",
      "DeepSeek-Coder",
      "Mistral-7B",
      "FLAML",
      "SHAP",
      "ChromaDB",
      "RAG",
      "RestrictedPython",
      "Python",
      "TypeScript"
    ],
    "image": "/images/projects/helix.png",
    "color": "#10B981",
    "featured": true,
    "ongoing": true,
    "year": "2026",
    "role": "Multi-Agent Systems Lead",
    "link": "https://helix-henna.vercel.app/",
    "liveApp": true,
    "github": "https://github.com/Srujan29112001/helix"
  },
  {
    "id": "news-researcher",
    "title": "News Researcher AI Agents",
    "category": "AI",
    "metric": "Multi-Agent System",
    "description": "Autonomous multi-agent system where a Manager agent delegates to Researcher and Writer agents to aggregate, fact-check and synthesize current news into reports.",
    "longDescription": "An autonomous multi-agent research system that aggregates, verifies and synthesizes current events into structured news reports, removing the manual effort of tracking and summarizing fast-moving topics.\n\nThe workflow follows a delegated pipeline: a Manager agent decomposes a topic into research tasks and routes them to specialized agents. A Researcher agent queries live web results through the Serper search API, scrapes and gathers source content, and performs fact verification across sources; a Writer agent then composes the synthesized findings into a coherent, comprehensive report surfaced through a Streamlit interface.\n\nArchitecturally, the agents are orchestrated with LangChain, each given a defined role, toolset and prompt so the Manager can plan and hand off subtasks while specialist agents reason over retrieved context. GPT-4 powers the language understanding, summarization and report generation, with the search API acting as the grounding tool that keeps outputs tied to real, up-to-date sources rather than model memory.\n\nTech stack: LangChain for agent orchestration, OpenAI GPT-4 for reasoning and writing, the Serper API for live web search, Python, and Streamlit for the front-end interface.",
    "tech": [
      "LangChain",
      "OpenAI GPT-4",
      "Python",
      "Streamlit",
      "Serper API"
    ],
    "image": "/images/projects/arch_news_1.png",
    "architectureImage": "/images/projects/arch_news_researcher.png",
    "gallery": [
      {
        "src": "/images/projects/arch_news_researcher.png",
        "alt": "System Architecture",
        "caption": "Full system design"
      }
    ],
    "color": "#3B82F6",
    "featured": true,
    "year": "2024",
    "role": "AI Engineer",
    "github": "https://github.com/srujan29112001",
    "link": "https://drive.google.com/file/d/1LoNq_7YDIDbSJ2BDyVCWGmynYpG1KhDB/view?usp=drive_link"
  },
  {
    "id": "neuropsych-trading",
    "title": "NeuroPsych Trading Assistant",
    "category": "AI",
    "metric": "Neuromorphic BCI",
    "description": "Neuromorphic multi-agent system pairing an EEG brain-computer interface with computational psychiatry to detect emotional states and intervene in high-stress trading.",
    "longDescription": "A neuromorphic, multi-agent system that fuses a brain-computer interface with computational psychiatry to monitor a trader's mental and emotional state and intervene before emotion-driven decisions cause losses. It targets the mental-health strain of high-stress financial decision-making by closing the loop between brain signals and real-time support.\n\nThe workflow streams live EEG from a wearable BCI, processes the raw neural signals to extract emotional and cognitive-load markers, and feeds them into computational-psychiatry models that estimate stress and impulsivity. When risk thresholds are crossed, coordinated AI agents trigger real-time interventions, supported by computer vision and a robotic companion for feedback and de-escalation.\n\nArchitecturally, EEG processing handles filtering, artifact removal and band-power feature extraction; neuromorphic computing provides event-driven, low-power inference suited to continuous on-edge monitoring; and a multi-agent layer coordinates monitoring, prediction and intervention roles. Together these form a continuous detect-predict-intervene pipeline rather than a single classifier.\n\nTech stack: EEG signal processing, brain-computer interface hardware, neuromorphic computing, multi-agent AI coordination, and Python.",
    "tech": [
      "BCI",
      "EEG Processing",
      "Multi-Agent Systems",
      "Python",
      "Neuromorphic Computing"
    ],
    "image": "/images/projects/neuropsych-trading.png",
    "architectureImage": "/images/projects/arch_neuropsych_trading.png",
    "gallery": [
      {
        "src": "/images/projects/arch_neuropsych_trading.png",
        "alt": "System Architecture",
        "caption": "Neuromorphic design"
      }
    ],
    "color": "#10B981",
    "featured": true,
    "ongoing": true,
    "year": "2024",
    "role": "Lead Researcher",
    "link": "https://srujan29112001.github.io/AI-SRUJAN/"
  },
  {
    "id": "wellness-ai",
    "title": "Personalized Wellness AI for Holistic Health",
    "category": "AI",
    "metric": "MCP & A2A Agents",
    "description": "Holistic mind-body-spirit wellness platform where collaborative AI agents coordinate via MCP and A2A protocols to deliver personalized nutrition, mental-health and spiritual guidance.",
    "longDescription": "A holistic wellness platform that treats mind, body and spirit as interconnected, blending traditional Ayurvedic guidance with modern nutritional science to generate personalized health recommendations through a team of collaborating AI agents.\n\nThe workflow starts with a multi-step onboarding form that captures the user's health profile; a Coordinator agent then receives this context and delegates to specialist agents. A Nutrition agent plans meals against the USDA FoodData database, a Mental Health agent handles mood tracking and emotional guidance, and a Spiritual agent produces Ayurvedic and astrologically aligned recommendations. Each agent invokes external tools, their findings are synthesized into a unified plan, and an optimization pass produces meal and schedule plans before results are stored and tracked.\n\nArchitecturally, the Coordinator-plus-specialists design communicates over the Model Context Protocol (MCP) for standardized agent-to-tool calls and Agent-to-Agent (A2A) messaging for discovery and task delegation. Claude models drive reasoning across the agents, multi-modal health data (brainwave, voice-emotion and food signals) feeds the analysis, and Google OR-Tools solves the meal-planning and scheduling constraints as a constraint-satisfaction problem.\n\nTech stack: Claude-based multi-agent reasoning over MCP and A2A, EEG and voice-emotion analysis, GraphRAG-style knowledge retrieval, OR-Tools optimization, USDA/VedicAstro integrations, with a Next.js/Supabase application layer.",
    "tech": [
      "Wellness AI",
      "Ayurveda",
      "EEG Analysis",
      "GraphRAG",
      "Voice Emotion Detection"
    ],
    "image": "/images/projects/arch_wellness_1.png",
    "gallery": [],
    "color": "#06B6D4",
    "featured": true,
    "ongoing": true,
    "year": "2024",
    "role": "Full Stack AI Developer",
    "github": "https://github.com/Srujan29112001/Holistic-Wellness-app",
    "link": "https://srujan29112001.github.io/AI-SRUJAN/"
  },
  {
    "id": "clinical-ai-copilot",
    "title": "Clinical AI Copilot — Multimodal EEG + Clinical RAG",
    "category": "AI",
    "metric": "11-Agent EEG Copilot",
    "description": "Deployable clinical decision-support web app: upload an EEG and eleven specialized agents triage, analyze the signal, retrieve evidence, diagnose, check drug safety, and write a report — in real time.",
    "longDescription": "\"From raw EEG to a clinical decision — in seconds.\" A full-stack, multi-agent clinical decision-support product (v3 — a complete rebuild of the original Python research stack into a deployed web app) that turns an uploaded EEG into an explainable neurological assessment.\n\nWORKFLOW — the user uploads an EEG (EDF / CSV / TSV / NPY / JSON; samples×channels auto-detected at 256 Hz) and an 11-stage agent pipeline runs, streaming live progress over Server-Sent Events: Signal Analyst → Neuromorphic Detector → Multi-Detector → Temporal Modeler → Triage → Knowledge Retriever → Multimodal Fusion → Diagnostician → Pharmacologist → Safety Critic → Reporter. The output is a clinical report with diagnosis, confidence/uncertainty, waveform + power-spectral-density + spike-raster visualizations, and drug-safety recommendations.\n\nSIGNAL ENGINE — extracts 50+ quantitative EEG (qEEG) features: band powers/ratios, spectral edge frequency, four entropies (Shannon, sample, permutation, approximate), Hjorth parameters, connectivity (Pearson, coherence, PLV, PLI), inter-hemispheric asymmetry, spike rate and burst-suppression ratio — driving seizure (generalized/focal/lateralized), sleep-stage (W/N1/N2/N3/REM), encephalopathy and recording-quality detection.\n\nARCHITECTURE — Next.js 15 / React 19 / TypeScript / Tailwind v4 frontend; FastAPI backend with async multi-agent orchestration over SSE. Research models (PyTorch) include a CNN-LSTM EEG encoder, a Transformer sleep stager, a Mamba2 selective state-space model for long-context trends, a Llama-3.1-8B (QLoRA) reasoner and a spiking neural network (LIF neurons emitting live spike rasters). A hybrid inference layer runs models locally (Ollama / vLLM / LM Studio) or via cloud APIs (Anthropic, OpenAI, Groq, DeepSeek, Mistral, Gemini, OpenRouter). Clinical grounding is an in-memory GraphRAG over ICD-10 / SNOMED-CT / RxNorm with a drug-interaction engine; a zero-key offline demo runs the whole pipeline in-browser. Shipped with Docker, Kubernetes/Helm, Terraform (AWS) and Hugging Face Spaces deploy configs. Research & educational use only — not FDA-approved.",
    "tech": [
      "EEG Signal Processing",
      "Multi-Agent Systems",
      "GraphRAG",
      "FastAPI",
      "Next.js",
      "Mamba2 SSM",
      "CNN-LSTM",
      "Spiking Neural Networks",
      "Llama 3.1 (QLoRA)",
      "PyTorch",
      "SSE"
    ],
    "image": "/images/projects/clinical-ai.png",
    "gallery": [],
    "color": "#EC4899",
    "featured": true,
    "year": "2025",
    "role": "Lead AI Engineer",
    "github": "https://github.com/Srujan29112001/Clinical-AI-copilot",
    "link": "https://clinical-ai-copilot.vercel.app/",
    "liveApp": true
  },
  {
    "id": "advisory-platform",
    "title": "Entrepreneurship Intelligence Platform (EIP)",
    "category": "AI",
    "metric": "Enterprise GraphRAG",
    "description": "Enterprise multi-agent advisory platform where specialized finance, tax, market, legal and wealth agents collaborate over a GraphRAG knowledge layer to deliver entrepreneur business intelligence.",
    "longDescription": "An enterprise-grade advisory platform that gives entrepreneurs expert, integrated guidance across finance, tax, market strategy, legal compliance and personal wealth by coordinating a roster of specialized AI agents over a GraphRAG knowledge layer.\n\nThe workflow routes an entrepreneur's query from a Next.js front end through an API gateway into a FastAPI backend, where a LangGraph orchestrator dispatches the request to the relevant specialist agents. Agents invoke calculators, document parsers and API integrations as tools; a RAG step retrieves relevant context via pgvector similarity search over embedded tax codes, templates and policies; and Claude synthesizes the combined agent outputs into responses rendered as interactive dashboards and charts.\n\nArchitecturally, the system uses a layered orchestration model: a UI layer, an API gateway, a LangGraph/LangChain multi-agent orchestrator, and a shared tools-and-RAG layer backed by Supabase Postgres with pgvector. Specialist agents (Finance, Tax, Market, Legal, Wealth) share state through the central orchestrator's state machine, while LangChain document loaders handle PDF extraction and OCR for legal and financial documents.\n\nTech stack: FastAPI with LangGraph/LangChain orchestration, Claude 3.5 Sonnet / GPT-4 reasoning, Supabase PostgreSQL + pgvector vector database and knowledge graph retrieval, OpenAI/Hugging Face embeddings, and a Next.js/React front end.",
    "tech": [
      "GraphRAG",
      "Multi-Agent System",
      "Vector Database",
      "Knowledge Graph",
      "FastAPI"
    ],
    "image": "/images/projects/arch_advisory_1.png",
    "gallery": [],
    "color": "#6D64A3",
    "featured": true,
    "ongoing": true,
    "year": "2024",
    "role": "AI Architect",
    "github": "https://github.com/Srujan29112001/Entra",
    "link": "https://srujan29112001.github.io/AI-SRUJAN/"
  },
  {
    "id": "finance-copilot",
    "title": "Finance Analytics & Trading Co-Pilot",
    "category": "AI",
    "metric": "Real-Time Streaming",
    "description": "Real-time finance analytics platform fusing Kafka/Spark streaming with DQN reinforcement-learning trading agents and a LangChain RAG copilot for interactive insights.",
    "longDescription": "A scalable, real-time finance analytics and trading platform that fuses multi-modal market data to drive reinforcement-learning trading agents while exposing an interactive AI copilot for on-demand financial insight.\n\nThe workflow ingests streaming inputs (market prices, news sentiment and social signals) through Apache Kafka, processes and aggregates them with Spark, and feeds the engineered state into Deep Q-Network (DQN) trading agents. The DQN agents learn a trading policy by estimating action-value functions and improving through reward feedback, while a LangChain RAG copilot lets users query the system in natural language and receive grounded, context-aware financial answers.\n\nArchitecturally, the platform is built as decoupled microservices so streaming, model serving and the copilot scale independently, with Kafka providing the event backbone and Spark handling distributed stream processing. The reinforcement-learning layer maps market state to trading decisions, and a real-time observability stack tracks pipeline and model health.\n\nTech stack: Apache Kafka and Spark for real-time streaming, Deep Q-Network reinforcement learning for trading policy, LangChain for the RAG copilot, a microservices architecture, and Prometheus/Grafana for observability.",
    "tech": [
      "Apache Kafka",
      "Spark",
      "Reinforcement Learning",
      "LangChain",
      "DQN",
      "Microservices"
    ],
    "image": "/images/projects/arch_finance_copilot.png",
    "gallery": [],
    "color": "#22C55E",
    "featured": true,
    "ongoing": true,
    "year": "2024",
    "role": "Lead Architect",
    "link": "#"
  },
  {
    "id": "vehicle-tracking",
    "title": "Speed Estimation and Vehicle Tracking System",
    "category": "AI",
    "metric": "YOLOv8",
    "description": "Automated vehicle detection, multi-object tracking, and per-vehicle speed estimation from video using YOLOv8 and a line-crossing computer-vision pipeline.",
    "longDescription": "A traffic-monitoring system that detects vehicles in video, tracks each one across frames, and estimates its speed as it moves through the scene, addressing the limited real-time accuracy of conventional monitoring setups.\n\nThe pipeline ingests a video stream frame by frame and runs YOLOv8 to detect and classify vehicles, producing bounding boxes per frame. A custom tracking algorithm associates detections across consecutive frames to maintain stable per-vehicle identities. Two predefined reference lines are placed in the frame; the system timestamps when a tracked vehicle crosses each line and computes speed from the elapsed time and the known real-world distance between the lines, then annotates the output video with IDs and speeds.\n\nArchitecturally it pairs a single-stage YOLOv8 detector (anchor-free convolutional backbone with a detection head) with a frame-to-frame data-association tracker and a line-crossing timing module for speed calculation, keeping the design lightweight enough for streaming inference.\n\nTech stack: YOLOv8, Python, and OpenCV-style computer-vision tooling for deep-learning-based detection and tracking.",
    "tech": [
      "YOLOv8",
      "Computer Vision",
      "Deep Learning",
      "Python"
    ],
    "image": "/images/projects/vehicle-tracking.png",
    "color": "#EF4444",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1UqPIOl2oD8quSNWniIEDeH8kXOGdK_BF/view?usp=sharing",
    "link": "https://drive.google.com/file/d/17JO_k02YTMQoumhm95J3EA6V3N7fUMIE/view?usp=drive_link"
  },
  {
    "id": "alphafold",
    "title": "3D Protein Structure Prediction Using AlphaFold",
    "category": "AI",
    "metric": "AlphaFold",
    "description": "End-to-end pipeline that predicts 3D protein structures from amino-acid sequences using AlphaFold, with MSA generation and interactive 3D visualization.",
    "longDescription": "A bioinformatics pipeline that uses AlphaFold's deep-learning framework to predict 3D protein structures directly from amino-acid sequences, bridging raw sequence data and structural biology workflows such as drug discovery and functional analysis.\n\nThe workflow runs in a Google Colab environment: it installs dependencies (JAX for the neural network, OpenMM for relaxation), searches genetic databases such as UniRef90 and smallBFD with Jackhmmer to build a multiple sequence alignment (MSA), and feeds the MSA and any template features into AlphaFold's monomer or multimer models for structure prediction. Predicted coordinates are written to PDB files and rendered as interactive 3D structures with py3Dmol.\n\nArchitecturally, AlphaFold combines an Evoformer that jointly reasons over the MSA and pairwise residue representations with a structure module that produces 3D atom coordinates, and reports per-residue pLDDT confidence to flag well- versus poorly-predicted regions; an OpenMM relaxation step then resolves steric clashes.\n\nTech stack: AlphaFold, Python, JAX, OpenMM, Jackhmmer/genetic databases, and py3Dmol, run in Google Colab.",
    "tech": [
      "AlphaFold",
      "Deep Learning",
      "Bioinformatics",
      "Python"
    ],
    "image": "/images/projects/alphafold.png",
    "color": "#8B5CF6",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1-tHGikDQ0KsKPzh1gkqWQimGbgzbCwzo/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1UXka9_8ueddFWr2_LIjX3dsi6l4Sc0aJ/view?usp=drive_link"
  },
  {
    "id": "simulation-evolution",
    "title": "Simulation Of Evolution",
    "category": "AI",
    "metric": "Genetic Algorithm",
    "description": "A genetic-algorithm simulation that evolves a population of random images toward a target color through selection, crossover, and mutation.",
    "longDescription": "A simulation of evolutionary principles that uses a genetic algorithm to optimize a population of randomly generated images so they converge toward a target color, illustrating how selection pressure shapes a population over generations.\n\nThe workflow starts from a population of random images and scores each one with a fitness function defined as the mean absolute RGB difference from the target color. Each generation retains the top-performing \"elite\" individuals, blends their RGB values through crossover to produce offspring, and applies controlled random mutations to maintain diversity. Iterating this select-recombine-mutate loop steadily drives the population's fitness score down toward the target. The approach was also extended from single-color optimization to evolving 16x16 pixel grids, demonstrating that the same operators scale to higher-dimensional targets.\n\nArchitecturally it is a standard genetic-algorithm loop: fitness evaluation, elitist selection, crossover, and mutation, with tunable parameters for mutation rate and elite-retention fraction governing the convergence behavior.\n\nTech stack: Python with custom genetic-algorithm, simulation, and optimization logic.",
    "tech": [
      "Genetic Algorithms",
      "Python",
      "Simulation",
      "Optimization"
    ],
    "image": "/images/projects/evolutionary-sim.png",
    "color": "#10B981",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1yle4uFPpablrbNbh2vu_CeEELpXErxdH/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1vqF9JT7hqPYHwKPKEGwvOQF9Nl8c42nI/view?usp=drive_link"
  },
  {
    "id": "word-similarity",
    "title": "Word Similarity Predictor",
    "category": "AI",
    "metric": "Word2Vec",
    "description": "Trains a Word2Vec model on cell-phone product reviews to learn word embeddings and surface semantic relationships between terms.",
    "longDescription": "An NLP project that applies Word2Vec to a corpus of product reviews for cell phones and accessories, learning vector representations of words so that semantically related terms can be compared and explored.\n\nThe workflow loads the review texts, preprocesses and tokenizes them into sentences of words, and trains a Word2Vec model on the resulting corpus. Once trained, the model maps each word to a dense embedding vector, which is used to query nearest neighbors and measure semantic similarity between words via cosine similarity in the embedding space.\n\nArchitecturally, Word2Vec is a shallow neural model (skip-gram or CBOW) that learns embeddings by predicting a word from its surrounding context (or vice versa); words that share contexts in the reviews end up close together in vector space, which is what makes similarity and analogy queries meaningful. The Gensim implementation handles vocabulary building, negative sampling, and training over multiple epochs.\n\nTech stack: Python, Gensim, and the Word2Vec algorithm for NLP-based word-embedding and semantic-similarity analysis.",
    "tech": [
      "NLP",
      "Word2Vec",
      "Gensim",
      "Python"
    ],
    "image": "/images/projects/arch_word_1.png",
    "color": "#6366F1",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1fnfMxCc-lXLICGKQ2ogI6jxUqxcocs4R/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1g2h1Doo8riJtBG4uEnmw9sHlN7gMsN5s/view?usp=drive_link"
  },
  {
    "id": "stock-rl",
    "title": "Stock Trading Reinforcement Learning",
    "category": "AI",
    "metric": "Reinforcement Learning",
    "description": "Reinforcement-learning agents that learn trading strategies directly from historical market data, optimizing for risk-adjusted returns under shifting market regimes.",
    "longDescription": "A finance-AI project that builds reinforcement-learning models which autonomously learn and adapt trading strategies from historical data, targeting the weakness of static algorithmic strategies that fail to adjust to changing market regimes.\n\nThe workflow frames trading as a sequential decision problem: historical market data is turned into a state representation (price history and derived features), the agent chooses actions such as buy, sell, or hold, and a reward signal tied to portfolio performance and risk-adjusted return guides learning. Through repeated interaction with this simulated market environment, the agent updates its policy to favor actions that improve long-run reward rather than single-step profit.\n\nArchitecturally it follows the standard RL loop of state, action, reward, and policy update, where the agent learns a value or policy function that maps observed market states to trading decisions and improves it over many episodes of historical playback, optimizing for risk-adjusted returns rather than raw return alone.\n\nTech stack: Python with reinforcement-learning methods applied to financial / time-series market data.",
    "tech": [
      "Reinforcement Learning",
      "Finance AI",
      "Python"
    ],
    "image": "/images/projects/arch_stock_1.png",
    "color": "#22C55E",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1j_j4wVkOCFekHzcBHUX7szmujDygMjxs/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1WYAxpO8CgN8S7f8tXoYzijDIbpI1ai9A/view?usp=drive_link"
  },
  {
    "id": "ludo-q-learning",
    "title": "Optimized Ludo with Q-Learning",
    "category": "AI",
    "metric": "Q-Learning",
    "description": "Reinforcement-learning Ludo agent that learns optimal token moves through self-play, using Q-learning to weigh immediate captures against long-term winning strategy.",
    "longDescription": "Rule-based Ludo bots follow fixed heuristics and never adapt to the flow of a game. This project builds an autonomous agent that instead learns to play through trial and error, discovering move policies that balance short-term rewards against long-term odds of winning.\n\nWorkflow: the Ludo board is modeled as a Markov decision process where each state captures token positions and the current dice roll, and the action space is the set of legal moves for that roll. The agent plays repeated games (self-play), and after each move it receives a reward signal tied to events like advancing tokens, capturing opponents, reaching home, or being sent back to start. Over many episodes these rewards propagate backward to shape the learned strategy.\n\nArchitecture: a Q-learning loop maintains Q-values for state-action pairs and updates them using the temporal-difference rule, blending the observed reward with the discounted best future value of the next state. A discount factor controls how far ahead the agent plans, while an epsilon-greedy policy trades off exploration of new moves against exploitation of the moves currently believed best, gradually converging toward an optimal policy.\n\nTech: Python, Q-learning, and reinforcement-learning techniques applied to game AI.",
    "tech": [
      "Q-Learning",
      "Reinforcement Learning",
      "Game AI",
      "Python"
    ],
    "image": "/images/projects/arch_ludo_1.png",
    "color": "#F43F5E",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1jW5VVQMPeUcjiy11K6qEXb1s6uAtoN0p/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1pWOdf7ibGoySDqv3t-BuRXMVapnhgDbf/view?usp=sharing"
  },
  {
    "id": "llama-lora",
    "title": "Fine-Tuning Llama-2-7b With LORA And QLoRA",
    "category": "AI",
    "metric": "LLM Fine-tuning",
    "description": "Resource-efficient fine-tuning of Llama-2-7b using LoRA and 4-bit QLoRA, adapting the model on commodity GPU memory while preserving base performance.",
    "longDescription": "Full fine-tuning of a 7B-parameter model updates every weight and demands prohibitive GPU memory. This project adapts Llama-2-7b cost-effectively using LoRA and QLoRA, which tune only a tiny fraction of parameters so customization fits on far more modest hardware.\n\nWorkflow: the base Llama-2-7b checkpoint is loaded from Hugging Face, a task dataset is tokenized and formatted into prompt/response pairs, and training runs as a parameter-efficient fine-tune. The frozen base weights stay fixed while small adapter matrices learn the task, after which the adapters can be saved and merged or served alongside the base model.\n\nArchitecture: LoRA injects pairs of low-rank matrices into the model's linear layers and trains only those, drastically cutting the number of trainable parameters and optimizer state. QLoRA goes further by quantizing the frozen base weights to 4-bit (NF4) representation, slashing memory footprint, then back-propagating through the quantized model into the LoRA adapters in higher precision so accuracy is largely preserved despite the compression.\n\nTech: Python, Hugging Face, LoRA, and QLoRA for memory-efficient LLM fine-tuning.",
    "tech": [
      "LLM",
      "QLoRA",
      "LoRA",
      "Hugging Face",
      "Python"
    ],
    "image": "/images/projects/arch_lora_1.png",
    "color": "#A855F7",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1ESxkUXoOtJHz7hCWsQNtHl7CCX6dP4p6/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1Q-SIlNpqD-UqUPjqSZOEr-mR3TSVJutm/view?usp=drive_link"
  },
  {
    "id": "rag-llama3",
    "title": "RAG-Powered QA System with LLAMA3",
    "category": "AI",
    "metric": "LLAMA3 RAG",
    "description": "Context-aware QA system pairing LLAMA3-70B with NVIDIA embeddings and LangChain to answer questions grounded in custom documents via real-time retrieval.",
    "longDescription": "Large language models answer from frozen training data and can hallucinate on private or up-to-date content. This Retrieval-Augmented Generation system grounds LLAMA3-70B in custom documents, so answers stay context-aware and tied to source material rather than the model's memory alone.\n\nWorkflow: source documents are loaded, split into chunks, and converted into vector embeddings using NVIDIA embeddings, then stored in a vector index. At query time the user's question is embedded and used to retrieve the most semantically similar chunks; those passages are injected into the prompt as context, and LLAMA3-70B reasons over them to produce a grounded answer.\n\nArchitecture: LangChain orchestrates the pipeline, chaining the retriever to the LLAMA3-70B generator so retrieval and generation operate as one flow. Semantic similarity search over the embedding store handles dynamic information retrieval, while the 70B model supplies the reasoning and synthesis over the retrieved context.\n\nTech: LLAMA3-70B, NVIDIA embeddings, and LangChain for retrieval-augmented question answering over custom documents.",
    "tech": [
      "RAG",
      "LLAMA3",
      "NVIDIA Embeddings",
      "LangChain"
    ],
    "image": "/images/projects/arch_rag3_1.png",
    "color": "#3B82F6",
    "featured": false,
    "year": "2024",
    "documentation": "https://drive.google.com/file/d/1SbpRzNaI3rhNNpZgbnM-3AuH3YeDl0DD/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1OMwJPxw0sAJad32p-R23BRQ5ON2dFpIw/view?usp=drive_link"
  },
  {
    "id": "rag-gemma",
    "title": "RAG On Gemma",
    "category": "AI",
    "metric": "Gemma Groq",
    "description": "Document-grounded RAG app built on Gemma served via Groq, with LangChain ingestion, FAISS vector search, and a Streamlit interface for interactive QA.",
    "longDescription": "This project builds a Retrieval-Augmented Generation system that lets users ask questions over their own documents and get grounded answers, using the Gemma model served through Groq for fast, low-latency inference.\n\nWorkflow: documents are ingested and split into chunks, embedded into vectors, and indexed in FAISS for similarity search. When a user submits a question through the Streamlit interface, the system embeds the query, retrieves the most relevant chunks from the FAISS index, and passes them as context to Gemma, which generates an answer grounded in the retrieved passages.\n\nArchitecture: LangChain components wire the pipeline together, connecting the document loaders and splitters to the FAISS retriever and on to the Gemma generator running on Groq's inference backend. FAISS provides efficient nearest-neighbor lookup over the embedding space, while Streamlit supplies the front end for entering queries and viewing responses.\n\nTech: Gemma on Groq, LangChain, FAISS for vector storage and retrieval, and Streamlit for the user interface.",
    "tech": [
      "RAG",
      "Gemma",
      "Groq",
      "LangChain",
      "Streamlit"
    ],
    "image": "/images/projects/arch_gemma_1.png",
    "color": "#0EA5E9",
    "featured": false,
    "year": "2024",
    "documentation": "https://drive.google.com/file/d/17gXGpI1MiXpxVuuaQ7AU95V4mSus2zgM/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1nRpZqcww_5J2E0vwRG7MjD9hKdLWvU2C/view?usp=drive_link"
  },
  {
    "id": "yelp-sentiment",
    "title": "Sentiment Analysis Of Yelp Reviews",
    "category": "AI",
    "metric": "BERT",
    "description": "Automated pipeline that scrapes Yelp reviews and classifies their sentiment with a pre-trained BERT model, turning unstructured feedback into scalable, objective insight.",
    "longDescription": "Reading large volumes of customer reviews by hand is slow and prone to subjective bias. This project automates the task, scraping Yelp reviews and classifying their sentiment with BERT to deliver consistent, objective insights at scale.\n\nWorkflow: review text is collected from Yelp via web scraping, cleaned and tokenized, then fed to a pre-trained BERT model that outputs a sentiment classification for each review. The resulting labels can be aggregated to summarize overall customer sentiment across many reviews.\n\nArchitecture: BERT is a bidirectional Transformer that reads the full review context in both directions to produce rich contextual token representations. Reviews are tokenized into the model's subword vocabulary, encoded through the Transformer layers, and the pooled representation is mapped to a sentiment score, letting the model capture nuance and word order that simple keyword counting misses.\n\nTech: Python, web scraping for data collection, and a pre-trained BERT model for NLP sentiment classification.",
    "tech": [
      "BERT",
      "NLP",
      "Web Scraping",
      "Python"
    ],
    "image": "/images/projects/arch_yelp_1.png",
    "color": "#FF0000",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1f5u8kNpKuST7mS8bmceZV85zKKp1-lK6/view?usp=sharing",
    "link": "https://drive.google.com/file/d/18cbSHKHJbbqiCqbQQEIARR13Lnhzw_we/view?usp=drive_link"
  },
  {
    "id": "imdb-sentiment",
    "title": "IMDB Sentiment Analysis",
    "category": "AI",
    "metric": "SNN/CNN/LSTM",
    "description": "Benchmarks SNN, CNN, and LSTM architectures for binary sentiment classification on IMDb movie reviews, using GloVe word embeddings as the shared input representation.",
    "longDescription": "A comparative study that pits three neural architectures against one another on the IMDb movie-review sentiment task, isolating which inductive bias best captures the polarity of free-text opinions and then deploying the winner to score unseen reviews.\n\nThe pipeline begins with text preprocessing: cleaning, tokenization, and mapping each review into a fixed-length integer sequence. Tokens are then projected into dense vectors via pretrained GloVe embeddings, giving every model the same semantically grounded starting point. The three networks are trained and evaluated on a held-out split, and the strongest model is selected to predict sentiment on new reviews.\n\nArchitecturally, the simple neural network (SNN) flattens embeddings into fully connected layers as a baseline; the CNN slides 1D convolutional filters over the embedding sequence to detect local n-gram sentiment cues before pooling; and the LSTM processes tokens sequentially, carrying gated memory to model longer-range dependencies and word order. Comparing them surfaces the trade-off between local-pattern detection and sequential context for sentiment.\n\nTech stack: Python deep learning with LSTM and CNN models, GloVe embeddings, and an NLP preprocessing pipeline.",
    "tech": [
      "Deep Learning",
      "LSTM",
      "CNN",
      "NLP",
      "GloVe"
    ],
    "image": "/images/projects/arch_imdb_1.png",
    "color": "#F5C518",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1iiMt5LO6vCEqcYfATWiucDp11KCYKwG7/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1Bvf8isfa5dm9CDU2I8iW8Rn3uF1BWV89/view?usp=drive_link"
  },
  {
    "id": "brain-tumor",
    "title": "Brain Tumor Classification",
    "category": "AI",
    "metric": "MRI Analysis",
    "description": "Classifies brain MRI scans as \"no tumor\" or \"pituitary tumor\" with classical ML, reaching 97.14% accuracy with Logistic Regression and 95.51% with SVM.",
    "longDescription": "A machine-learning system that screens brain MRI scans and labels them as either \"no tumor\" or \"pituitary tumor,\" built to show how classical classifiers can support rapid, repeatable tumor detection as a diagnostic aid.\n\nThe workflow starts with image preprocessing: each MRI scan is resized to a uniform dimension, converted to grayscale, and normalized so pixel intensities are comparable across samples. The flattened pixel features then feed two classifiers, Logistic Regression and SVM, which are trained and validated on a held-out test set. A misclassification analysis inspects errors to gauge robustness, and the trained model is wrapped in a simple interface for on-demand prediction.\n\nOn the architecture side, Logistic Regression fits a linear decision boundary over the pixel-intensity features, while the SVM seeks the maximum-margin separating hyperplane, often with a kernel to handle non-linear structure. On the test data, Logistic Regression reached 97.14% accuracy and the SVM 95.51%, with only 38 mislabeled samples out of 879, indicating stable separation between the two classes.\n\nTech stack: Python machine learning with SVM and Logistic Regression for medical imaging, plus an interactive interface for rapid tumor detection.",
    "tech": [
      "Machine Learning",
      "Medical Imaging",
      "SVM",
      "Python"
    ],
    "image": "/images/projects/arch_tumor_1.png",
    "color": "#8B5CF6",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1K9G82896KDNmSb-b9LTMVGbUqitO9RGn/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1YoqHn6t47-JhjPT62kx42AUDcwteT9yP/view?usp=drive_link"
  },
  {
    "id": "breast-cancer",
    "title": "Breast Cancer Tumor Classification",
    "category": "AI",
    "metric": "SVM Classifier",
    "description": "Classifies breast cancer tumors as malignant or benign using an SVM pipeline with integrated scaling and cross-validation for robust, leak-free evaluation.",
    "longDescription": "A healthcare-focused machine-learning project that classifies breast cancer tumors into malignant or benign categories, packaged as a clean, reproducible pipeline so preprocessing and modeling stay consistent end to end.\n\nThe workflow begins with data preparation: missing values are handled and categorical features are encoded into numeric form. Feature scaling and SVM training are then composed into a single pipeline, which guarantees that the scaler is fit only on training folds and applied identically at inference, preventing data leakage. The model is assessed with cross-validation to produce a stable estimate of generalization performance rather than relying on a single split.\n\nArchitecturally, the SVM finds the maximum-margin hyperplane separating malignant from benign samples, using a kernel to capture non-linear relationships among the tumor features. Bundling standardization with the classifier means the same transformation is reproduced consistently across every evaluation fold and on new data.\n\nTech stack: Python with an SVM classifier, scikit-learn-style pipelines for scaling plus modeling, and cross-validation for robust healthcare-AI evaluation.",
    "tech": [
      "SVM",
      "Machine Learning",
      "Healthcare AI",
      "Python"
    ],
    "image": "/images/projects/arch_cancer_1.png",
    "color": "#EC4899",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1eke8C7hTGTRWQrOC76ennX91vkL9iu99/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1AlxcSE_pu4hJEVW2Wb_-V2uYNfIBqfCI/view?usp=drive_link"
  },
  {
    "id": "esrgan",
    "title": "ESRGAN Super Resolution",
    "category": "AI",
    "metric": "Generative AI",
    "description": "Applies ESRGAN, a GAN-based super-resolution model, in PyTorch to upscale low-resolution images into sharper, detail-rich high-resolution outputs.",
    "longDescription": "A computer-vision project that runs ESRGAN (Enhanced Super-Resolution GAN) to reconstruct high-resolution images from low-resolution inputs, recovering fine textures and edges that simple interpolation cannot.\n\nThe workflow loads a low-resolution image, passes it through the pretrained ESRGAN generator to synthesize an upscaled version, and saves the enhanced output for comparison against the original. This turns the model into a practical tool for sharpening and enlarging images via deep learning rather than classical resampling.\n\nArchitecturally, ESRGAN pairs a deep generator built from Residual-in-Residual Dense Blocks with a discriminator trained adversarially to tell real high-resolution images from generated ones. The generator learns to produce outputs the discriminator accepts as realistic, while a perceptual loss computed in a feature space encourages texture and structure that look natural to the eye rather than merely minimizing pixel error, which is what gives ESRGAN its characteristically sharp, detailed results.\n\nTech stack: PyTorch implementation of the ESRGAN GAN architecture for deep-learning-based image super-resolution.",
    "tech": [
      "ESRGAN",
      "PyTorch",
      "GANs",
      "Computer Vision"
    ],
    "image": "/images/projects/arch_esrgan_1.png",
    "color": "#3B82F6",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1hiYgZbDpwv2gk2T1bDi_MnIrpC-FWH5s/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/14BeY2Drf4DBNdAvrwNtJfKJopGRlKVtj/view?usp=drive_link"
  },
  {
    "id": "neuron-segmentation",
    "title": "Neuron Segmentation",
    "category": "AI",
    "metric": "Segment Anything",
    "description": "Automates neuron segmentation in microscopy images with Meta's SAM, hitting 0.92 mean IoU while running ~40% faster than manual annotation on an RTX 3060.",
    "longDescription": "A biomedical computer-vision project that automates neuron segmentation in microscopy images using Meta's Segment Anything Model (SAM), replacing slow manual tracing with a model that generates precise masks at scale to speed up neurobiological analysis.\n\nThe workflow feeds microscopy images into SAM's automatic mask generator, which proposes segmentation masks across the field of view; the masks are then validated quantitatively against ground truth and through visual inspection. Generation runs on GPU (NVIDIA RTX 3060), and the model adapts to diverse neuron morphologies by tuning parameters such as pred_iou_thresh=0.9 and min_mask_region_area=100 to filter low-confidence and spurious small regions.\n\nArchitecturally, SAM combines a Vision Transformer image encoder, a prompt encoder, and a lightweight mask decoder; in automatic mode it samples a grid of point prompts over the image and decodes a mask for each, then deduplicates and filters them by predicted IoU and stability. This promptable design lets a single pretrained model handle varied neuron shapes without task-specific retraining. The system reached a 0.92 mean IoU and processed images roughly 40% faster than manual annotation.\n\nTech stack: PyTorch with Meta's Segment Anything Model and GPU acceleration for medical-imaging segmentation.",
    "tech": [
      "SAM",
      "PyTorch",
      "Medical Imaging",
      "Computer Vision"
    ],
    "image": "/images/projects/arch_neuron_1.png",
    "color": "#10B981",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1ze5J3K5tjZngrjqMeNPiGWKarzt9dXun/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1eyABVrUlExt-apfXNCc_txCqmLYHGzvd/view?usp=drive_link"
  },
  {
    "id": "sandstones",
    "title": "Sandstones Segmentation",
    "category": "AI",
    "metric": "U-Net",
    "description": "U-Net semantic segmentation that labels every pixel of a sandstone micrograph as clay, quartz, or pyrite, reaching 0.8665 mean IoU and 96.37% accuracy.",
    "longDescription": "A deep-learning approach to geological image analysis that automates mineral phase identification in sandstone, assigning each pixel to one of three classes (clay, quartz, pyrite) instead of relying on manual petrographic labelling.\n\nWorkflow: raw sandstone micrographs are tiled into 128x128 pixel patches, paired with their segmentation masks, and split into training and held-out test sets. Training runs on Google Colab GPUs for faster convergence, and the resulting model is evaluated on the separate test set using per-pixel accuracy and Intersection-over-Union.\n\nArchitecture: the model is a U-Net, an encoder-decoder convolutional network. The contracting encoder applies successive convolution and pooling layers to capture context, while the expanding decoder upsamples back to full resolution; skip connections forward high-resolution encoder features to the decoder so fine mineral boundaries are preserved. A final per-pixel softmax produces the three-class map. The trained model achieves a mean IoU of 0.8665 and an accuracy of 96.37%.\n\nTech stack: U-Net, Python, deep-learning tooling on Colab GPU, applied as geology AI.",
    "tech": [
      "U-Net",
      "Deep Learning",
      "Geology AI",
      "Python"
    ],
    "image": "/images/projects/arch_sandstone_1.png",
    "color": "#D97706",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/10ZqytMMbCoOed2OlgPeQ9bG03xJDwe4y/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1SPavtnxRNC6XFguXxQ4lUoRz2rogrGSD/view?usp=drive_link"
  },
  {
    "id": "deep-audio",
    "title": "Deep Audio Classifier",
    "category": "AI",
    "metric": "MFCC & CNN",
    "description": "Urban sound classifier that turns raw audio into MFCC features and feeds them to a neural network, hitting 85% test accuracy on UrbanSound8K.",
    "longDescription": "An audio-classification system that recognises urban sound events despite overlapping acoustic patterns and background noise, supporting use cases like scalable noise monitoring and urban analytics.\n\nWorkflow: audio clips from the UrbanSound8K dataset are loaded and standardised, then transformed into Mel-Frequency Cepstral Coefficients (MFCCs) that compactly summarise the timbral and spectral shape of each sound. These feature vectors are batched and used to train a neural network, which is then evaluated on a held-out test split.\n\nArchitecture: MFCC extraction maps the raw waveform onto the mel scale and applies a discrete cosine transform to produce a small set of perceptually meaningful coefficients, giving the network a noise-robust, lower-dimensional input. A neural-network classifier learns the mapping from these MFCC features to the urban sound categories and outputs class probabilities via a softmax layer. The model reaches 85% test accuracy on UrbanSound8K.\n\nTech stack: Python, MFCC-based audio processing, and a deep-learning classification model.",
    "tech": [
      "Audio Processing",
      "Deep Learning",
      "MFCC",
      "Python"
    ],
    "image": "/images/projects/arch_audio_1.png",
    "color": "#6366F1",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1i_SvYd_FbdifHGsw9tb_lLQBHELGXd0K/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1oIB0Jqn38J84iPwhUxTVTIZBqH0AcxYL/view?usp=sharing"
  },
  {
    "id": "lip-read",
    "title": "Lip Read to Text",
    "category": "AI",
    "metric": "3D CNN + LSTM",
    "description": "Visual speech recognition that reads silent lip movement and transcribes it to text using a 3D CNN plus Bidirectional LSTM with CTC decoding.",
    "longDescription": "A visual speech recognition (lip-reading) model that transcribes spoken words directly from lip movement, addressing the difficulty posed by variable lighting, speaker differences, and the lack of explicit alignment between video frames and characters.\n\nWorkflow: video of a speaker's mouth region is preprocessed into sequences of frames, passed through spatiotemporal feature extraction, decoded into a character sequence, and trained without needing frame-by-frame labels.\n\nArchitecture: a 3D convolutional network extracts spatiotemporal features, learning both the appearance of the mouth and how it moves across consecutive frames. The resulting feature sequence feeds a Bidirectional LSTM that models temporal context in both directions for more robust sequence understanding. Training and inference use Connectionist Temporal Classification (CTC), an alignment-free loss that lets the network learn the mapping from variable-length video to text without manual frame-to-character alignment.\n\nTech stack: TensorFlow, 3D CNN, Bidirectional LSTM, and CTC, applied to a computer-vision speech task.",
    "tech": [
      "3D CNN",
      "LSTM",
      "TensorFlow",
      "Computer Vision"
    ],
    "image": "/images/projects/arch_lip_1.png",
    "color": "#F43F5E",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1hlZQTdIb1GzAGZbhJ9XJHZWV2KXZJgs8/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1ps7LjiKgnh4-PDLa24N6IDAv0J81clgl/view?usp=drive_link"
  },
  {
    "id": "image-to-3d",
    "title": "2D Image to 3D Point Cloud",
    "category": "AI",
    "metric": "Depth Estimation",
    "description": "Reconstructs a 3D mesh from a single 2D image by predicting depth with a Transformer model and rebuilding geometry through a point cloud in Open3D.",
    "longDescription": "A computer-vision pipeline that lifts a single 2D image into 3D geometry, producing a reconstructed mesh from one ordinary photograph without specialised depth hardware.\n\nWorkflow: an input image is passed to a depth-estimation model that predicts a per-pixel depth map; the depth map and image are back-projected into a 3D point cloud; the point cloud is then processed and surfaced into a 3D mesh.\n\nArchitecture: depth is inferred with a Transformer-based depth-estimation model from Hugging Face Transformers, which predicts relative depth for every pixel. Each pixel's image coordinates and estimated depth are converted into 3D points to form a point cloud. Open3D handles the geometric stage, ingesting the point cloud, estimating normals, and running surface reconstruction to turn the discrete points into a connected triangle mesh that can be visualised or exported.\n\nTech stack: Python, Hugging Face Transformers for depth estimation, and Open3D for point-cloud processing and mesh reconstruction.",
    "tech": [
      "Transformers",
      "Open3D",
      "Computer Vision",
      "Python"
    ],
    "image": "/images/projects/arch_3d_1.png",
    "color": "#0EA5E9",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1RBcmLM5-aizNkmyKtjJXM6qsc24FI_8f/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1qeGzIMvqmcuScaa15FPmolMsjsgynWNw/view?usp=sharing"
  },
  {
    "id": "pointnet",
    "title": "PointNet Classification",
    "category": "AI",
    "metric": "3D Deep Learning",
    "description": "3D shape classifier built on the PointNet architecture in TensorFlow, learning directly on raw point clouds from the ModelNet10 dataset.",
    "longDescription": "A 3D deep-learning system that classifies objects directly from point clouds, operating on raw, unordered 3D points rather than voxels or rendered images.\n\nWorkflow: 3D object files from the ModelNet10 dataset are loaded and preprocessed by sampling each mesh into a fixed-size set of points and normalising them; the resulting point sets are batched to train the network, which is then evaluated on a held-out split.\n\nArchitecture: the model follows the PointNet design, which respects the permutation invariance of point sets. Each point is passed independently through shared multilayer perceptrons to learn per-point features, and a symmetric max-pooling operation aggregates them into a single global shape descriptor that is invariant to point ordering. Fully connected layers map this global feature to ModelNet10 class scores. The pipeline covers data preprocessing, model building, training, and evaluation end to end.\n\nTech stack: TensorFlow, the PointNet architecture, and Python for 3D-vision classification.",
    "tech": [
      "PointNet",
      "TensorFlow",
      "3D Vision",
      "Python"
    ],
    "image": "/images/projects/pointnet.png",
    "color": "#8B5CF6",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1E_nkeD5kHpWI5VSPh295BF7qWroe7xem/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1KqVAM8r2UCOewm-tRPP79fMXtdxDOEwN/view?usp=drive_link"
  },
  {
    "id": "midas-depth",
    "title": "Real-Time Depth Estimation",
    "category": "AI",
    "metric": "MiDaS",
    "description": "Real-time monocular depth estimation that turns a standard 2D webcam feed into a live depth map using GPU-accelerated MiDaS models, running at 20-30 FPS.",
    "longDescription": "A real-time monocular depth estimation system that infers 3D structure from ordinary 2D webcam frames, removing the need for costly specialized hardware like LiDAR or stereo rigs and democratizing 3D perception on commodity cameras.\n\nWorkflow: each webcam frame is captured and preprocessed (resize, normalization) to match the model's expected input, passed through the MiDaS network for a forward inference pass, and the raw relative-depth output is then resized back to the frame resolution and colour-mapped into a depth heatmap displayed live alongside the source video.\n\nArchitecture: MiDaS is a learned monocular depth model trained on a mix of datasets to predict relative inverse depth per pixel. This project uses the lightweight MiDaS variants so the encoder-decoder can run fast enough for interactive use, with GPU acceleration handling the per-frame inference to sustain 20-30 FPS. The capture loop, inference, and visualization are pipelined so depth tracks the camera in near real time.\n\nTech stack: MiDaS, PyTorch, OpenCV-based computer vision pipeline, GPU-accelerated real-time inference.",
    "tech": [
      "MiDaS",
      "PyTorch",
      "Computer Vision",
      "Real-time"
    ],
    "image": "/images/projects/midas-depth.png",
    "color": "#14B8A6",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1for27_u2Bv3fheU_Av9ljfehQFm_cS03/view?usp=sharing",
    "link": "https://drive.google.com/file/d/17FdFmYfIyzBCxLE3S3qUmYa851rBLtkf/view?usp=drive_link"
  },
  {
    "id": "weather-prophet",
    "title": "Weather Prediction",
    "category": "AI",
    "metric": "NeuralProphet",
    "description": "Localized temperature forecasting for Williamtown using NeuralProphet, a hybrid neural time-series model that blends Prophet-style decomposition with deep autoregression.",
    "longDescription": "A localized temperature forecasting project for Williamtown that models historical weather patterns to produce actionable long-term temperature trend forecasts, addressing the gap in localized predictions that matter for agriculture and infrastructure planning amid rising climate variability.\n\nWorkflow: historical weather records are loaded and shaped into the date/value series NeuralProphet expects, cleaned and resampled as needed, then split for training and validation; the model is fit on the historical window and used to roll forward a future forecast horizon, with predicted trends and component effects plotted for interpretation.\n\nArchitecture: NeuralProphet is a hybrid time-series framework that keeps Prophet's interpretable additive decomposition (trend plus seasonality) but implements it on PyTorch and augments it with neural autoregression (AR-Net), letting the model capture both smooth seasonal cycles and short-term autocorrelation in the temperature signal. Trend changepoints and seasonal terms make the output explainable rather than a black box.\n\nTech stack: NeuralProphet, Python, time-series modeling, and a data-science workflow for preprocessing and visualization.",
    "tech": [
      "NeuralProphet",
      "Time Series",
      "Python",
      "Data Science"
    ],
    "image": "/images/projects/weather-pred.png",
    "color": "#F59E0B",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1oPgMMp-RmQ0JqHJIn8b3l34P55cKQP5m/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1PYoDuCL8rZ_8KghvN7aFlZS8114Be_Fh/view?usp=drive_link"
  },
  {
    "id": "sales-arima",
    "title": "Sales Forecasting",
    "category": "AI",
    "metric": "ARIMA/SARIMAX",
    "description": "Monthly sales forecasting that fits ARIMA and seasonal SARIMAX models to historical demand and projects future sales for specific time periods.",
    "longDescription": "A classical statistical time-series project that forecasts future monthly sales from a historical sales dataset, using ARIMA and SARIMAX to capture both the underlying trend and recurring seasonal demand patterns for period-specific projections.\n\nWorkflow: the monthly sales series is loaded and preprocessed, then inspected for trend and seasonality and made stationary via differencing as needed; appropriate (p, d, q) and seasonal (P, D, Q, s) orders are selected using ACF/PACF diagnostics, the models are fitted, and forecasts for specific future time periods are generated and plotted against the history.\n\nArchitecture: ARIMA combines autoregression (AR), differencing for stationarity (I), and a moving-average (MA) error term; SARIMAX extends this with an explicit seasonal component (and support for exogenous regressors), making it well suited to the repeating monthly cycles common in sales data. Comparing the two isolates how much of the signal is seasonal versus purely autoregressive.\n\nTech stack: ARIMA/SARIMAX (statsmodels), Python, and a statistics-driven time-series analysis pipeline.",
    "tech": [
      "ARIMA",
      "Statistics",
      "Time Series",
      "Python"
    ],
    "image": "/images/projects/sales-forecasting.png",
    "color": "#22C55E",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1v7jX3pgUazcWWkhZTxtD72IZVf2PLK-I/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1bpkR3dSO7ezBeisGPcvImCajTWMtdvMo/view?usp=drive_link"
  },
  {
    "id": "census-gpu",
    "title": "GPU-Accelerated Census Analysis",
    "category": "AI",
    "metric": "RAPIDS cuML",
    "description": "GPU-accelerated analysis of U.S. Census data with NVIDIA RAPIDS, moving preprocessing and model comparison onto the GPU to predict income at scale.",
    "longDescription": "A GPU-accelerated data-science project that processes large-scale U.S. Census data with NVIDIA RAPIDS to overcome the CPU bottlenecks that arise when cleaning and modeling big tabular datasets, then systematically compares machine-learning models for income prediction.\n\nWorkflow: the Census dataset is ingested into GPU dataframes, cleaned and feature-engineered (encoding categoricals, scaling, handling missing values) entirely on the GPU, then split for training and evaluation; several classifiers are trained and benchmarked on accuracy and runtime to identify the optimal approach for predicting income.\n\nArchitecture: RAPIDS provides a CUDA-backed stack where cuDF mirrors the pandas API for GPU dataframes and cuML mirrors scikit-learn for GPU-trained models, so the same familiar workflow runs across thousands of CUDA cores instead of a single CPU. This parallelism collapses preprocessing and model-fitting time on the high-cardinality Census data, making iterative model comparison practical.\n\nTech stack: NVIDIA RAPIDS (cuDF, cuML), GPU computing, and a comparative data-science workflow in Python.",
    "tech": [
      "RAPIDS",
      "cuML",
      "GPU Computing",
      "Data Science"
    ],
    "image": "/images/projects/census-gpu.png",
    "color": "#76B900",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1GSohsE8NSQF_uYoN0VqR4O7LrpseFH4_/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1zOE7hMQKqYgffmQwg7LnFdi2lxOn2pCE/view?usp=drive_link"
  },
  {
    "id": "steel-pso",
    "title": "Steel Strength Optimization",
    "category": "AI",
    "metric": "PSO + Random Forest",
    "description": "Predicts steel yield strength with a Random Forest regressor and uses Particle Swarm Optimization to search for the feature configuration that maximizes strength.",
    "longDescription": "A materials-informatics project that predicts the yield strength of steel from its composition and processing features using a Random Forest regressor, then applies Particle Swarm Optimization (PSO) on top of that model to search for the feature settings that maximize predicted strength.\n\nWorkflow: the steel dataset is preprocessed and a Random Forest Regressor is trained and validated as the predictive surrogate mapping features to yield strength; PSO then treats the trained model as a fitness function, exploring the feature space to find the input combination that yields the highest predicted strength.\n\nArchitecture: the Random Forest is an ensemble of decision trees whose averaged predictions give a robust, non-linear strength estimator that handles feature interactions without heavy tuning. PSO is a population-based metaheuristic where a swarm of candidate solutions moves through the search space, each particle steered by its own best position and the swarm's global best, converging on a near-optimal feature set. Coupling the two lets the optimizer exploit the learned model directly rather than running expensive physical trials.\n\nTech stack: Random Forest, Particle Swarm Optimization, Python, with an optimization-focused machine-learning pipeline.",
    "tech": [
      "PSO",
      "Random Forest",
      "Optimization",
      "Python"
    ],
    "image": "/images/projects/steel-optimization.png",
    "color": "#64748B",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1BBethH-CFCfgbV5JosAT0OIFUI8aZoe3/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1Eq9p5surHhfGO9ZOM6Rt4Qu8kX_lP9KN/view?usp=sharing"
  },
  {
    "id": "rps-fastervit",
    "title": "RPS Gesture Classifier",
    "category": "AI",
    "metric": "FasterViT",
    "description": "Real-time Rock-Paper-Scissors gesture classifier built on FasterViT, delivering sub-20ms inference with >98% accuracy for live hand-sign recognition.",
    "longDescription": "A real-time hand-gesture classifier that recognizes rock, paper, and scissors from a live camera feed, built to close the gap between transformer accuracy and the latency budget needed for interactive play.\n\nWorkflow: each frame is captured, resized and normalized, then passed through the model in a tight inference loop so predictions track the user's hand in real time; the predicted class is overlaid back onto the video stream.\n\nArchitecture: the backbone is FasterViT, a hybrid vision transformer that pairs fast convolutional stages for early feature extraction with hierarchical attention deeper in the network, using a hierarchical-attention design to cut the quadratic cost of global self-attention. This keeps the model GPU-friendly enough for sub-20ms inference while still reaching >98% accuracy on the three-class gesture task. A lightweight classification head maps the pooled features to the rock/paper/scissors logits.\n\nTech stack: FasterViT, transformer-based computer vision, real-time inference pipeline.",
    "tech": [
      "FasterViT",
      "Transformers",
      "Computer Vision",
      "Real-time"
    ],
    "image": "/images/projects/rps-gesture.png",
    "color": "#F97316",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1oK2qijwqPXxs7Ouj1AgiSHY8u-6SkZ2K/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1bthm5ogWYgUVfjlpMgUkK1DlgV1dz90E/view?usp=drive_link"
  },
  {
    "id": "daisy-dandelion",
    "title": "Daisy vs Dandelion",
    "category": "AI",
    "metric": "Swin Transformer",
    "description": "Fine-grained flower classifier that tells daisies from dandelions using a Swin Transformer's shifted-window attention over petal texture and bloom shape.",
    "longDescription": "A fine-grained image classifier that distinguishes daisies from dandelions, using a Swin Transformer whose shifted-window self-attention captures both local petal texture and the global shape of the bloom.\n\nWorkflow: images are resized and normalized, then augmented with flips, rotation and colour jitter to fight overfitting on a small two-class set; a pretrained Swin backbone is fine-tuned with a lightweight classification head, trained in JupyterLab with GPU acceleration; the model is then evaluated on a held-out split using accuracy and a confusion matrix.\n\nArchitecture: the Swin Transformer is a hierarchical vision transformer that computes self-attention inside local windows and shifts those windows between layers so information flows across window boundaries, building multi-scale feature maps at near-linear cost. Transfer learning from pretrained weights lets the model generalize well despite the limited training data.\n\nTech stack: PyTorch, Swin Transformer, torchvision.",
    "tech": [
      "Swin Transformer",
      "Computer Vision",
      "Deep Learning"
    ],
    "image": "/images/projects/flower-class.png",
    "color": "#EAB308",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1nBUxmpCyBpMzLU0tK3xnk0EcXZNKEuYt/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1LZLDfW4caMM5iZhtnzs0be2uwlFv768i/view?usp=drive_link"
  },
  {
    "id": "happy-sad",
    "title": "Happy or Sad Classifier",
    "category": "AI",
    "metric": "CNN",
    "description": "End-to-end binary CNN that classifies face images as happy or sad, from data cleaning through training to single-image inference.",
    "longDescription": "A binary facial-emotion classifier that labels a face image as happy or sad, built end to end from raw data to inference.\n\nWorkflow: a custom image set is first cleaned of corrupt files, normalized to the [0,1] range and batched through an image data pipeline; a convolutional neural network is trained with binary cross-entropy while loss and accuracy curves are monitored to catch overfitting; the trained model is then scored with precision, recall and accuracy and used for single-image inference.\n\nArchitecture: the network stacks Conv2D and max-pooling blocks that progressively extract edge, texture and facial-feature maps, which are flattened into dense layers ending in a single sigmoid unit that outputs the probability of the 'happy' class. This compact design keeps the model fast to train and easy to deploy for a clean two-class problem.\n\nTech stack: TensorFlow/Keras, OpenCV, Matplotlib.",
    "tech": [
      "CNN",
      "Deep Learning",
      "Computer Vision"
    ],
    "image": "/images/projects/emotion-class.png",
    "color": "#8B5CF6",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1pttNmzVRI8iq0rxXllxRMTjPgWLf9hW-/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1_8_8PJrHWsArQF4q1NYTwgYCmY56tv1Q/view?usp=drive_link"
  },
  {
    "id": "robovla",
    "title": "Vision-Language Robotic Assistant (VLA-Sim)",
    "category": "Robotics",
    "metric": "Embodied VLA",
    "description": "Embodied vision-language-action system for warehouse pick-and-place: DINO v2 + MiDaS perception, Llama 3.1 grounding, Neo4j GraphRAG, fused into a transformer that outputs joint commands.",
    "longDescription": "RoboVLA is an embodied vision-language-action system for robotic warehouse automation that turns a natural-language command and a camera view into executable pick-and-place actions, optimized to run on a single NVIDIA RTX 3060 (12GB VRAM).\n\nWorkflow (pick-and-place): given an RGB image, a text command such as 'pick the red box from the top shelf' and the robot's joint/gripper state, DINO v2 detects the target object, MiDaS estimates depth and 3D Gaussian Splatting reconstructs the scene as a point cloud; Llama 3.1 extracts the intent and target entity while CLIP aligns the visual detection with the language; Neo4j GraphRAG and ChromaDB retrieve similar successful strategies; a cross-attention module fuses the perception and language embeddings and a transformer VLA decoder emits an action vector of joint commands plus gripper state with a success probability.\n\nArchitecture: a three-layer perception to language-grounding to action pipeline, with Soft Actor-Critic reinforcement learning for grasp optimization and QLoRA 4-bit / INT8 quantization to fit the full stack in 12GB. Served behind a FastAPI endpoint, containerized with Docker and orchestrated on Kubernetes with Prometheus and Grafana monitoring for horizontal scaling.\n\nTech stack: DINO v2, MiDaS, 3D Gaussian Splatting, Llama 3.1, CLIP, Neo4j, ChromaDB, transformer VLA + SAC, FastAPI, Docker, Kubernetes, Prometheus/Grafana.",
    "tech": [
      "DINO v2",
      "Llama 3.1",
      "Neo4j",
      "Robotics",
      "NVIDIA Isaac"
    ],
    "image": "/images/projects/robovla.png",
    "architectureImage": "/images/projects/arch_robovla.png",
    "gallery": [
      {
        "src": "/images/projects/arch_robovla.png",
        "alt": "Architecture",
        "caption": "System diagram"
      }
    ],
    "color": "#10B981",
    "featured": true,
    "ongoing": true,
    "year": "2024",
    "github": "https://github.com/Srujan29112001/ROBOWAREHOUSE",
    "link": "https://srujan29112001.github.io/ROBOTICS-SRUJAN/"
  },
  {
    "id": "internship-semester",
    "title": "Internship Semester (UG Final Semester) Project",
    "category": "Robotics",
    "metric": "Edge AI Drone",
    "description": "Edge-AI aerial object detector running YOLOv7 on NVIDIA Jetson AGX Xavier, deployed on the Tunga drone for cloud-free real-time detection at 89% mAP and 22 FPS.",
    "longDescription": "A real-time aerial object detection system that addresses the difficulty of detecting small objects from drones under tight compute budgets and dynamic conditions, by running detection on the edge instead of depending on the cloud.\n\nWorkflow: a custom aerial dataset is collected and annotated, then used to train a YOLOv7 detector; the trained model is optimized for the embedded GPU and deployed onboard, where each captured frame is run through a single forward pass that simultaneously predicts bounding boxes and class scores, with the detections fed back for downstream use in dynamic flight environments.\n\nArchitecture: YOLOv7 is a single-stage detector that performs detection in one network pass for low latency, making it well suited to onboard inference. It runs on the NVIDIA Jetson AGX Xavier for training/heavy compute and is deployed on the 'Tunga' aerial vehicle, which pairs an NVIDIA Jetson Nano for edge inference with a Pixhawk flight controller. The system reaches 89% mAP, 22 FPS inference and 95% reliability.\n\nTech stack: YOLOv7, NVIDIA Jetson AGX Xavier, Jetson Nano, Pixhawk, edge-AI computer vision.",
    "tech": [
      "YOLOv7",
      "NVIDIA Jetson",
      "Edge AI",
      "Computer Vision"
    ],
    "image": "/images/projects/drdo-aerial.png",
    "architectureImage": "/images/projects/arch_drdo_aerial.png",
    "color": "#F59E0B",
    "featured": false,
    "year": "2024",
    "documentation": "https://drive.google.com/drive/folders/1M_hsP4ME88xmN1Oz7PHSEsQ62SkkizNB?usp=sharing",
    "link": "https://drive.google.com/drive/folders/1M_hsP4ME88xmN1Oz7PHSEsQ62SkkizNB?usp=sharing"
  },
  {
    "id": "neural-signal-time-freq",
    "title": "Time-Frequency Analysis of Neural Signals",
    "category": "Robotics",
    "metric": "Signal Processing",
    "description": "Time-frequency decomposition of EEG neural signals using complex Morlet wavelets, benchmarked against filter-Hilbert methods for oscillation characterization.",
    "longDescription": "A neural signal processing study that extracts how oscillatory power and phase evolve over time in EEG recordings, addressing the trade-off classical spectral methods make between time and frequency resolution.\n\nThe workflow takes raw EEG time series, convolves each channel with a family of complex Morlet wavelets spanning the frequency band of interest, and extracts instantaneous power and phase from the resulting complex coefficients to build a time-frequency representation. These results are then compared against a traditional filter-Hilbert pipeline to validate robustness.\n\nArchitecturally, the complex Morlet wavelet is a Gaussian-windowed complex sinusoid whose width is tuned per frequency to balance temporal and spectral precision; convolving it with the signal yields a complex analytic signal from which magnitude (power) and angle (phase) are read directly. The filter-Hilbert baseline instead band-pass filters the signal and applies the Hilbert transform to recover the analytic signal, providing a cross-check on the wavelet estimates.\n\nTech stack: MATLAB, complex Morlet wavelet transforms, the filter-Hilbert method, and EEG signal processing techniques.",
    "tech": [
      "Siganl Processing",
      "EEG",
      "Wavelets",
      "MATLAB"
    ],
    "image": "/images/projects/neural-signal.png",
    "color": "#6366F1",
    "featured": false,
    "year": "2024",
    "documentation": "https://drive.google.com/file/d/174WFLUAsCsRvJn0yrFD4Ug1JxBK4-rUd/view?usp=sharing",
    "link": "https://drive.google.com/file/d/10AdoVKTc1SNIIjdsGTemVcC9ohpVOiEC/view?usp=drive_link"
  },
  {
    "id": "phase-sync",
    "title": "Phase Synchronization Analysis using EEG Data",
    "category": "Robotics",
    "metric": "EEG Analysis",
    "description": "Quantifies phase synchronization between EEG channels using Morlet wavelet transforms with ISPC and PLI connectivity measures in MATLAB.",
    "longDescription": "An EEG connectivity analysis that measures how consistently the phases of oscillations from different brain regions align over time, a proxy for functional coupling between channels.\n\nThe workflow extracts the instantaneous phase of each EEG channel via the Morlet wavelet transform, then compares phase angles across channel pairs to compute synchronization metrics, and finally visualizes the connectivity patterns in MATLAB.\n\nThe approach centers on two complementary measures. Inter-Site Phase Clustering (ISPC) averages the phase-angle differences between two channels over time as a unit-vector mean, yielding a value near 1 for tightly locked phases and near 0 for random ones. The Phase Lag Index (PLI) instead looks at the sign of phase differences to discount zero-lag coupling, making it more resilient to volume conduction and common-reference artifacts. Phase estimates come from convolving each channel with complex Morlet wavelets.\n\nTech stack: MATLAB, Morlet wavelet transforms, ISPC, PLI, and EEG/neuroscience signal processing.",
    "tech": [
      "EEG",
      "MATLAB",
      "Neuroscience",
      "Signal Processing"
    ],
    "image": "/images/projects/arch_phase_1.png",
    "color": "#8B5CF6",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1ij23QD0AeQ-zL_pBJZtAydPK69dc0DBV/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/11mkQBTWKCoTjy2iuQPSDM8wPFryCgZWz/view?usp=drive_link"
  },
  {
    "id": "neural-signal-spectral",
    "title": "Neural Signal Spectral Analysis",
    "category": "Robotics",
    "metric": "FFT Analysis",
    "description": "Spectral analysis of synthesized signals via FFT, including power spectrum computation, noise impact studies, and a from-scratch Fourier transform.",
    "longDescription": "A spectral analysis project that generates controlled sine-wave signals and characterizes their frequency content using the Fast Fourier Transform, serving as a foundation for understanding neural signal spectra.\n\nThe workflow synthesizes sine waves at known frequencies, optionally injects noise, transforms each signal into the frequency domain with the FFT, computes the power spectrum, and studies how added noise distorts spectral estimates. A manual Fourier transform is also implemented to expose the underlying mechanics.\n\nThe FFT efficiently decomposes a sampled signal into complex sinusoidal components; squaring the magnitude of those components yields the power spectrum, which reveals dominant frequencies as peaks. The hand-coded discrete Fourier transform correlates the signal against sine and cosine bases at each frequency, making explicit what the optimized FFT computes, while the noise-impact experiments illustrate how broadband noise raises the spectral floor and obscures weak components.\n\nTech stack: MATLAB, FFT, power spectrum estimation, and spectral signal processing.",
    "tech": [
      "FFT",
      "Spectral Analysis",
      "Signal Processing",
      "MATLAB"
    ],
    "image": "/images/projects/neural-spectral.png",
    "color": "#F43F5E",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1z8naadsLcCtv7WQhO-Fi-9AmbdZTDXyB/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/15RIx7UBf5djT8ao-p5j3E801gC6QxmME/view?usp=drive_link"
  },
  {
    "id": "simulating-eeg",
    "title": "Simulating EEG Data in MATLAB",
    "category": "Robotics",
    "metric": "Simulation",
    "description": "Forward-model EEG simulation in MATLAB that generates signals at the dipole level and projects them onto scalp electrodes.",
    "longDescription": "A simulation framework that synthesizes realistic EEG by modeling neural sources as dipoles and projecting their activity to scalp sensors, providing ground-truth data for testing analysis methods.\n\nThe workflow defines dipole sources, assigns each a time course, builds those time courses from pure sine waves plus noise and from non-oscillatory and non-stationary components, and then maps the dipole activity onto scalp electrodes to produce simulated channel recordings.\n\nThe approach follows the EEG forward-model idea: brain activity is represented as current dipoles, and a projection (leadfield-style) mapping from source space to electrode space yields the scalp signals each sensor would record as a weighted mixture of the active dipoles. By controlling each dipole's signal type, including stationary oscillations, additive noise, and non-stationary or non-oscillatory dynamics, the simulation creates known-source datasets for validating time-frequency, spectral, and connectivity pipelines.\n\nTech stack: MATLAB, dipole-level forward modeling, and EEG/neuroscience simulation.",
    "tech": [
      "MATLAB",
      "Simulation",
      "EEG",
      "Neuroscience"
    ],
    "image": "/images/projects/eeg-sim.png",
    "color": "#0EA5E9",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/15hahC4mAdGdYJrxKGk0d7RYtKUDEHuqX/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1ao3f6vngg0dvMw68IndIM0_Ymtr8U5AW/view?usp=drive_link"
  },
  {
    "id": "pathfinding-algo",
    "title": "Comparative Analysis of Pathfinding Algorithms",
    "category": "Robotics",
    "metric": "Algorithms",
    "description": "Comparative study of DFS, BFS, and A* for maze navigation in Python, visualized with PyAmaze, measuring path length, search time, and heuristic impact.",
    "longDescription": "A robotics-oriented benchmarking project that implements and compares three classic pathfinding algorithms on maze-navigation tasks, quantifying their trade-offs in optimality and search efficiency.\n\nThe workflow generates mazes, runs DFS, BFS, and A* on each, visualizes the explored cells and final paths with PyAmaze, and records metrics including path length, search time, and the effect of different heuristics. Results show BFS guarantees the shortest path, A* with a Manhattan heuristic reduces search time by 25-40% versus DFS, and the Manhattan heuristic outperforms Euclidean in 70% of test cases.\n\nArchitecturally, DFS explores deeply along one branch before backtracking and offers no optimality guarantee; BFS expands the frontier level by level, guaranteeing the shortest path in an unweighted grid at higher memory cost; and A* combines path cost with an admissible heuristic estimate of remaining distance to guide search toward the goal, with the Manhattan distance fitting the four-connected grid better than Euclidean.\n\nTech stack: Python, the PyAmaze maze library, and DFS, BFS, and A* search algorithms.",
    "tech": [
      "Python",
      "Algorithms",
      "Pathfinding",
      "Robotics"
    ],
    "image": "/images/projects/pathfinding.png",
    "color": "#10B981",
    "featured": false,
    "year": "2023",
    "link": "https://drive.google.com/file/d/1itf6XJKZYSxQQ3GsemLFQl5rt42SJ_v-/view?usp=sharing"
  },
  {
    "id": "lane-changing-control",
    "title": "Autonomous Lane Changing Control System",
    "category": "Robotics",
    "metric": "MPC Control",
    "description": "Model Predictive Control system that plans smooth, collision-aware lane-change trajectories for autonomous vehicles by optimizing steering over a receding horizon.",
    "longDescription": "A Model Predictive Control (MPC) system that lets an autonomous vehicle execute precise, comfortable lane-changing maneuvers rather than abrupt swerves, treating the maneuver as a constrained trajectory-optimization problem solved repeatedly as the car moves.\n\nWorkflow: at each control step the vehicle state (lateral position, heading, velocity) is measured and fed to the controller; a reference lane-change trajectory is generated; the MPC predicts the vehicle's future motion over a finite horizon and solves an optimization that minimizes tracking error and control effort; only the first steering command is applied, then the whole horizon shifts forward and the problem is re-solved on the next step.\n\nArchitecture: a vehicle dynamics model propagates predicted states, while the optimizer respects actuator and comfort constraints (steering limits, lateral acceleration). This receding-horizon scheme gives the controller built-in look-ahead, so it anticipates the curvature of the lane change and reacts to disturbances rather than merely correcting after the fact.\n\nTech stack: MPC, control theory, vehicle dynamics modeling, and MATLAB for simulation and tuning.",
    "tech": [
      "MPC",
      "Control Theory",
      "MATLAB",
      "Autonomous Vehicles"
    ],
    "image": "/images/projects/lane-control.png",
    "color": "#F97316",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1UpTz5aM6FuVQGSlm-IpGNkot20IL5oMk/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1J8XQ-JZwxC9K85M9zDJRZYnuMkKlu6ys/view?usp=drive_link"
  },
  {
    "id": "water-tank-dynamics",
    "title": "Simulating Water Tank Dynamics",
    "category": "Robotics",
    "metric": "Proportional Control",
    "description": "MATLAB simulation of fluid dynamics across three interconnected tanks, using proportional control to regulate volumes with animated, real-time plots.",
    "longDescription": "A control-systems simulation that models how water volume evolves across three interconnected tanks and shows how feedback control drives the system toward a desired level, making the behavior of a coupled fluid network tangible through animation.\n\nWorkflow: the dynamics of each tank are expressed as differential equations capturing inflow, outflow and the coupling between neighboring tanks; the equations are integrated over time to track volume in every tank; a proportional controller compares the measured volume against a setpoint and adjusts the actuating flow in proportion to that error; results are rendered as animated plots that show the volumes converging.\n\nArchitecture: the proportional (P) control law applies a corrective action scaled by a gain on the instantaneous error, so larger deviations produce stronger responses while the system settles as the error shrinks. Because the tanks are interconnected, a change in one tank propagates to the others, making this a coupled multi-state system rather than three independent loops.\n\nTech stack: MATLAB for numerical integration and animation, control-systems theory, and dynamic system modeling.",
    "tech": [
      "Control Systems",
      "Simulation",
      "MATLAB",
      "Dynamics"
    ],
    "image": "/images/projects/water-tank.png",
    "color": "#06B6D4",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1_yZ7eAZA3JJui7N2-CiouHYKhSP3LTTk/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1V3HSZidzz9OtidbneRJhlawvIX9xmXiO/view?usp=drive_link"
  },
  {
    "id": "pid-falling-cube",
    "title": "PID Control Simulation for Falling Cube",
    "category": "Robotics",
    "metric": "PID Control",
    "description": "PID control simulation in MATLAB where a train on an inclined rail tracks and catches a falling cube, with animated motion and live error metrics.",
    "longDescription": "A PID control simulation that frames a classic tracking problem as a game: a train running on an inclined rail must position itself to catch a cube falling under gravity, demonstrating how feedback control closes the gap between a moving target and a controlled actuator.\n\nWorkflow: the cube's free-fall trajectory is computed from physics to give a moving target position; at each timestep the controller measures the error between the train's position and the projected catch point; a PID law converts that error into a control force; the train's resulting displacement and velocity are integrated forward; and the run is rendered as an animation alongside plots of the PID error over time.\n\nArchitecture: the controller sums three terms — proportional (reacts to the present error), integral (accumulates past error to remove steady offset), and derivative (anticipates future error from its rate of change) — and the gains are tuned so the train converges on the catch point quickly without overshooting, all while contending with the incline.\n\nTech stack: PID control theory, MATLAB for simulation, numerical integration, and animated visualization.",
    "tech": [
      "PID",
      "Control Theory",
      "MATLAB",
      "Simulation"
    ],
    "image": "/images/projects/pid-cube.png",
    "color": "#EC4899",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1yslDuNLlcBn7WclAAp0edZnZU4FjKRR8/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1av_EO3pLEez9lWdsrHoUO_BzyWDeeYYk/view?usp=drive_link"
  },
  {
    "id": "hand-gesture-cursor",
    "title": "Real Time Hand Gesture Recognition For Cursor Control",
    "category": "Robotics",
    "metric": "MediaPipe",
    "description": "Touchless mouse: a real-time vision system that maps hand gestures to cursor movement and clicks using MediaPipe and PyAutoGUI, with no physical input hardware.",
    "longDescription": "A vision-based human-computer interface that replaces the mouse with bare-hand gestures, improving accessibility and mobility by removing the dependence on physical input hardware.\n\nWorkflow: a webcam stream is processed in real time to detect 21 hand landmarks per frame; the position of the index fingertip is mapped to screen coordinates to move the cursor with under 50ms latency; and a pinch gesture, recognized when the index-thumb distance drops below 20px, triggers mouse clicks.\n\nArchitecture: MediaPipe's hand-tracking model provides the 21-landmark skeleton, which is the basis for both pointing and gesture classification; landmark coordinates are smoothed and rescaled from the camera frame to the display, while PyAutoGUI injects the corresponding cursor moves and click events into the operating system. Tuned thresholds on inter-landmark distances yield 95% gesture accuracy, keeping pointing responsive and clicks deliberate.\n\nTech stack: Python, MediaPipe, PyAutoGUI, and computer-vision techniques for landmark-based gesture control.",
    "tech": [
      "Computer Vision",
      "MediaPipe",
      "HCI",
      "Python"
    ],
    "image": "/images/projects/gesture-cursor.png",
    "color": "#8B5CF6",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1jW5VVQMPeUcjiy11K6qEXb1s6uAtoN0p/view?usp=sharing",
    "link": "https://drive.google.com/file/d/18pD_FxZSHZktE_LkAHHy81ZuJzJsY4p7/view?usp=drive_link"
  },
  {
    "id": "pushup-counter",
    "title": "Real Time Pushup Counter",
    "category": "Robotics",
    "metric": "Pose Estimation",
    "description": "Real-time push-up counter and form checker that uses MediaPipe pose estimation and OpenCV to count reps from joint angles and flag broken posture.",
    "longDescription": "A real-time push-up rep counter and form checker driven by pose estimation, which watches a workout through a webcam, counts valid repetitions, and gives live feedback on technique.\n\nWorkflow: OpenCV captures the webcam feed and MediaPipe Pose extracts 33 body landmarks per frame; joint angles are computed with vector math — the shoulder-elbow-wrist angle gauges push-up depth, while the hip-shoulder-ankle line tracks body posture; a small state machine counts a rep on each down-to-up transition past set angle thresholds, and the side view flags broken form such as sagging hips.\n\nArchitecture: the landmark skeleton is the single source of truth for both counting and form analysis, so deriving angles from 2D landmark vectors avoids any extra sensors. Live overlays render the skeleton, the current joint angle, the running rep count, and the form feedback directly on the video for instant coaching.\n\nTech stack: Python, MediaPipe, OpenCV, and NumPy.",
    "tech": [
      "OpenCV",
      "MediaPipe",
      "Computer Vision",
      "Python"
    ],
    "image": "/images/projects/pushup-counter.png",
    "color": "#10B981",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/18b6hAaXp1-jj_1U3LE4aCUfV3RhNeUMm/view?usp=drive_link",
    "link": "https://drive.google.com/drive/folders/1j7Mjrrfl58mmTMIRsovimnJ03YlmLwhY?usp=drive_link"
  },
  {
    "id": "bicep-curl-counter",
    "title": "Real Time Bicep Curl Counter",
    "category": "Robotics",
    "metric": "Pose Estimation",
    "description": "Real-time bicep-curl rep counter that tracks arm landmarks with markerless pose estimation and counts each completed curl via elbow-angle analysis.",
    "longDescription": "A real-time fitness tracker that counts bicep curls from a plain webcam feed using markerless pose estimation, giving instant rep feedback with no wearables or sensors.\n\nWorkflow: each frame is passed to MediaPipe Pose, which returns the shoulder, elbow and wrist landmarks; the elbow-flexion angle is computed from the dot product of the upper-arm and forearm vectors; a two-stage state machine (arm extended to arm flexed) advances on threshold crossings and increments the rep count once a full down-up cycle completes.\n\nArchitecture: MediaPipe's lightweight CNN-based pose pipeline supplies normalized landmark coordinates per frame, while NumPy handles the vector math for the joint angle. Upper and lower angle thresholds with hysteresis debounce the stage transitions so jitter and partial reps don't produce false counts. OpenCV captures the camera stream and overlays the live angle, current stage and running rep total back onto the frame.\n\nTech stack: MediaPipe, OpenCV, NumPy, Python.",
    "tech": [
      "OpenCV",
      "MediaPipe",
      "Fitness AI",
      "Python"
    ],
    "image": "/images/projects/bicep-counter.png",
    "color": "#F59E0B",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1oskl1rXnQWrQNV7hevUIAbJ3IsAAEz5A/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/11nl8SfuZNa0gtGdKAI_NX9LopomP_yfT/view?usp=drive_link"
  },
  {
    "id": "volume-control",
    "title": "Hand Gesture Volume Control",
    "category": "Robotics",
    "metric": "HCI",
    "description": "Touchless volume controller that maps the pinch distance between thumb and index fingertip to the OS volume level in real time via webcam hand tracking.",
    "longDescription": "A touchless human-computer interface that turns a hand gesture into a system-volume dial, letting you raise or lower audio by pinching in front of the webcam.\n\nWorkflow: MediaPipe Hands detects 21 hand landmarks each frame; the Euclidean distance between the thumb tip and index-finger tip is measured and linearly interpolated (then clamped) onto the OS volume range; the resulting level is pushed to the system audio API. A live overlay draws the landmarks, the pinch line between the two fingertips and a volume bar so the user gets immediate visual feedback.\n\nArchitecture: MediaPipe's hand-tracking model provides per-frame landmark coordinates, NumPy handles the distance computation and range mapping, and PyAutoGUI / the system audio interface applies the volume change. OpenCV manages the capture loop and rendering of the feedback overlay.\n\nTech stack: MediaPipe, OpenCV, NumPy, PyAutoGUI, Python.",
    "tech": [
      "Computer Vision",
      "HCI",
      "Python",
      "MediaPipe"
    ],
    "image": "/images/projects/volume-control.png",
    "color": "#3B82F6",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1sk1imnbX8RNrsVSR9q87AOE1b66XwS3q/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1JeH80W7mR4F7Lvx95AlPjSRUXU551Rwg/view?usp=drive_link"
  },
  {
    "id": "body-pose-react",
    "title": "Real Time Body Pose Estimation",
    "category": "Robotics",
    "metric": "PoseNet",
    "description": "Browser-native React app that runs PoseNet client-side via TensorFlow.js to estimate 17 body keypoints and draw a live skeleton over the webcam feed.",
    "longDescription": "A browser-native pose-estimation app that tracks a person's body in real time with zero server-side inference, so the webcam stream never leaves the device.\n\nWorkflow: a React app requests the camera through getUserMedia and renders frames to an HTML canvas; TensorFlow.js loads the PoseNet model and runs inference on each animation frame, returning 17 body keypoints with per-point confidence scores; keypoints above a confidence threshold are drawn as joints and linked into a skeleton overlay aligned to the video.\n\nArchitecture: PoseNet is a convolutional pose estimator that outputs heatmaps and offset vectors decoded into keypoint coordinates; TensorFlow.js executes it on the in-browser WebGL backend so all computation is GPU-accelerated client-side. A requestAnimationFrame loop keeps detection and canvas rendering in sync for smooth, low-latency tracking.\n\nTech stack: React, TensorFlow.js, PoseNet, HTML Canvas, getUserMedia.",
    "tech": [
      "React",
      "TensorFlow.js",
      "PoseNet",
      "Web AI"
    ],
    "image": "/images/projects/body-pose.png",
    "color": "#8B5CF6",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1zzvv007wIwFMBdtGSdUJGJMmeip6rMXB/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/11mXOkEz5jUiIt4XhiGGMih5z-wVZP725/view?usp=drive_link"
  },
  {
    "id": "body-segmentation",
    "title": "Real Time Body Segmentation",
    "category": "Robotics",
    "metric": "BodyPix",
    "description": "In-browser React demo using TensorFlow.js BodyPix for real-time per-pixel person segmentation, compositing part-maps or background blur over the webcam feed.",
    "longDescription": "A real-time person-segmentation demo that separates a human from the background entirely in the browser, with all inference running locally so no frames are uploaded.\n\nWorkflow: a React app streams the webcam to a canvas and runs TensorFlow.js BodyPix on each frame to produce a per-pixel mask; the mask is then composited over the source video on a second canvas, either as a coloured body-part map or as a selective background blur, driven by a requestAnimationFrame loop.\n\nArchitecture: BodyPix is a CNN-based segmentation model that classifies every pixel as person or background (and optionally into body parts); TensorFlow.js runs it on the WebGL backend for GPU-accelerated client-side inference. The dual-canvas pipeline keeps capture and the segmentation composite in sync each frame for fluid output.\n\nTech stack: React, TensorFlow.js, BodyPix, HTML Canvas.",
    "tech": [
      "React",
      "TensorFlow.js",
      "BodyPix",
      "Web AI"
    ],
    "image": "/images/projects/body-seg.png",
    "color": "#EC4899",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1VO4cgljpMC8yJ7fEz8fmzcljD8hyJsvm/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1En8jLjLpjvj-2ivyq0Pn-o11sHnaJ9FU/view?usp=drive_link"
  },
  {
    "id": "hand-pose-react",
    "title": "Real Time Hand Pose Estimation",
    "category": "Robotics",
    "metric": "TensorFlow.js",
    "description": "Client-side React app running TensorFlow.js Handpose to predict 21 3D hand landmarks per frame and overlay finger connections on the live webcam feed.",
    "longDescription": "A client-side hand-tracking app that detects and visualizes a hand in real time directly in the browser, keeping all video and inference fully on-device for privacy.\n\nWorkflow: a React app captures the webcam and, on every animation frame, runs TensorFlow.js's Handpose model to predict 21 3D hand landmarks plus a hand bounding box; the landmarks and the finger connections between them are then drawn as an overlay on a canvas aligned to the video stream.\n\nArchitecture: Handpose combines a palm detector with a landmark regressor to estimate per-frame 3D keypoints; TensorFlow.js executes the model on the in-browser WebGL backend for GPU-accelerated, low-latency inference. A requestAnimationFrame loop coordinates detection and canvas rendering so the skeleton overlay stays locked to the moving hand.\n\nTech stack: React, TensorFlow.js, Handpose, HTML Canvas.",
    "tech": [
      "React",
      "TensorFlow.js",
      "Handpose",
      "Web AI"
    ],
    "image": "/images/projects/hand-pose.png",
    "color": "#EAB308",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1A_sfzGiag-9r0wkninkuo4AIiGdyB3WQ/view?usp=drive_link",
    "link": "https://drive.google.com/file/d/1eki7QM9JTKEMZ-6iCoeQeGzTyyBdLnew/view?usp=drive_link"
  },
  {
    "id": "exoplanet-detection",
    "title": "Exoplanet Detection via Light Curves",
    "category": "Research",
    "metric": "Astrophysics",
    "description": "Detects exoplanet candidates from Kepler/TESS photometry with Lightkurve — flattening, phase-folding, and a Box Least Squares search that flags periodic transit dips.",
    "longDescription": "A Python pipeline that screens for exoplanet candidates by mining the brightness-over-time signal (light curves) of stars observed by NASA's Kepler and TESS missions, where a planet crossing its host star produces a small, periodic dip in flux.\n\nWORKFLOW — light curves are extracted from target pixel files, then flattened to remove stellar variability and instrumental trends. The cleaned signal is phase-folded on candidate periods so that repeated transits stack and reinforce, amplifying a shallow signal that is otherwise buried in noise. A Box Least Squares (BLS) periodogram then scans a grid of trial periods and durations to pinpoint the most likely orbital period.\n\nAPPROACH — BLS models a transit as a box-shaped drop and reports the period/duration/depth that best fit the folded data, which here surfaced a candidate with a ~5.7-day orbital period, ~2-hour transit, and ~0.1% flux dip — values consistent with an Earth-sized planet. Automating detrending and signal validation yielded >95% confidence in the recovered transit, demonstrating an efficient candidate-screening loop.\n\nTECH — Python, Lightkurve, SciPy, and standard data-analysis/astrophysics tooling.",
    "tech": [
      "Python",
      "Astrophysics",
      "Data Analysis",
      "SciPy"
    ],
    "image": "/images/projects/exoplanet.png",
    "gallery": [],
    "color": "#6366F1",
    "featured": true,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1KXcRJdTl0CW1dJ_MxOBg3a3t6YhAz9qM/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1LQff1VixZMduQ_hDVV2I9tHSOJWIolez/view?usp=sharing"
  },
  {
    "id": "space-debris",
    "title": "Space Debris Tracking & Collision Prediction",
    "category": "Research",
    "metric": "Physics-Informed NN",
    "description": "Autonomous space situational-awareness stack: YOLOv7 + DINOv2 detect orbital debris while Physics-Informed Neural Networks propagate trajectories for collision prediction.",
    "longDescription": "An AI system for space situational awareness that detects orbiting debris, tracks it over time, and predicts conjunction (collision) risk — combining learned perception with physics-grounded trajectory modeling.\n\nWORKFLOW — incoming imagery is passed through a computer-vision front end that detects and localizes debris objects; detections are associated across frames into tracks, and each track's motion is propagated forward to forecast future positions and flag close approaches. A real-time 3D dashboard renders the orbital scene, and multi-agent autonomous monitoring runs the loop continuously.\n\nARCHITECTURE — perception uses YOLOv7 for fast single-pass object detection alongside DINOv2 self-supervised visual features for robust representation. Trajectory prediction uses Physics-Informed Neural Networks (PINNs), which embed the governing equations of orbital mechanics directly into the training loss so predicted paths respect gravitational dynamics rather than relying on data fit alone. A knowledge graph organizes object relationships and context, and 3D Gaussian Splatting supports the real-time volumetric scene rendering.\n\nTECH — YOLOv7, DINOv2, PINNs, orbital mechanics, knowledge graph, and 3D Gaussian Splatting.",
    "tech": [
      "YOLOv7",
      "PINNs",
      "Orbital Mechanics",
      "Knowledge Graph",
      "3D Gaussian Splatting"
    ],
    "image": "/images/projects/space-debris.png",
    "gallery": [],
    "color": "#6366F1",
    "featured": true,
    "ongoing": true,
    "year": "2024",
    "role": "Research Engineer",
    "link": "#"
  },
  {
    "id": "quantum-particle",
    "title": "Quantum Particle Detection Dynamics",
    "category": "Research",
    "metric": "Quantum Physics",
    "description": "Computational study contrasting classical vs. quantum arrival times for a Gaussian wavepacket, revealing non-zero detection probability before the classical bound — a tunneling signature.",
    "longDescription": "A computational physics study of how a quantum particle, initially localized as a Gaussian wavepacket with zero average momentum, evolves in space and time — and how its detection statistics differ from a classical particle.\n\nWORKFLOW — the analysis first treats the particle classically by computing ⟨p²⟩ to derive an arrival time T = mLℏ²/(2a²) (reducing to L² under unit parameters), the moment a classical particle would first be detected beyond position L. It then solves the quantum problem by Fourier-expanding the initial state and propagating it under the time-dependent Schrödinger equation, computing the running probability P(x>L, t) that the particle is found past L.\n\nAPPROACH — symbolic derivations are handled with SymPy and the time-dependent integrals are evaluated numerically with SciPy. The quantum result shows non-zero detection probability even at t<T, with P rising gradually from 0% toward ~50% over t = 0→30, sharply departing from the classical prediction of an abrupt arrival at T. Visualizations make this gap explicit, illustrating quantum tunneling and wavepacket dispersion.\n\nTECH — Python, NumPy, SymPy, SciPy, and quantum/physics-simulation methods.",
    "tech": [
      "Quantum Computing",
      "Physics Simulation",
      "Python",
      "NumPy"
    ],
    "image": "/images/projects/quantum-dynamics.png",
    "color": "#8B5CF6",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/12XYJe34e7WApSzFrnGbV_7lyn9rkIH5S/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1kwQhBWSqk0v61aSamhB1i5ZLjmVYpnu9/view?usp=sharing"
  },
  {
    "id": "lifi-comm",
    "title": "Visible Light Communication System",
    "category": "Research",
    "metric": "LiFi",
    "description": "Undergraduate capstone: a LiFi link sending data PC-to-PC over modulated LED light and photodetectors — 15 Mbps, <10⁻⁵ BER, 2 m range, no RF spectrum needed.",
    "longDescription": "An undergraduate engineering capstone (group project) that prototypes a Visible Light Communication (LiFi) link for PC-to-PC data transfer. It targets the limits of RF wireless — spectrum congestion, interference, and security exposure — by carrying data on visible light, which stays confined to a room and is energy-efficient since it reuses illumination LEDs.\n\nWORKFLOW — on the transmit side, source data is encoded and used to intensity-modulate an LED (switching far faster than the eye can perceive); on the receive side, a photodetector converts the fluctuating light back into an electrical signal that is amplified, demodulated, and decoded into the original bitstream. Both endpoints connect to their host PCs to complete the link.\n\nARCHITECTURE — the team designed and built the hardware (LED transmitter/photodetector transceiver circuits) and the software (encoding/decoding protocols) end to end. The prototype achieved a 15 Mbps data rate, a bit error rate below 10⁻⁵, and a 2-meter transmission range, demonstrating secure, high-speed line-of-sight communication.\n\nTECH — LiFi / visible light communication, embedded systems, transceiver hardware design, and digital communication/encoding.",
    "tech": [
      "LiFi",
      "Embedded Systems",
      "Communication",
      "Hardware"
    ],
    "image": "/images/projects/lifi-system.png",
    "color": "#F59E0B",
    "featured": false,
    "documentation": "https://drive.google.com/file/d/1xaGgViC6ZqSG_RMIFcPvBzCTVtBHB8PN/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1LoNq_7YDIDbSJ2BDyVCWGmynYpG1KhDB/view?usp=drive_link"
  },
  {
    "id": "cellular-automata",
    "title": "Cellular Automata Dynamics Explorer",
    "category": "Research",
    "metric": "Complexity Science",
    "description": "Interactive explorer simulating 1D/2D cellular automata — Rule 30, Rule 110, Game of Life, Totalistic Rule 126 — to visualize how simple local rules produce complex emergent behavior.",
    "longDescription": "A complexity-science sandbox that simulates and visualizes cellular automata in both one and two dimensions, showing how simple, local update rules generate strikingly complex global patterns.\n\nWORKFLOW — a grid of cells is initialized, then evolved step by step: at each timestep every cell's next state is computed from its current state and its neighbors according to a chosen rule. Successive states are stacked (1D) or animated (2D), with runs spanning up to 250 timesteps to expose long-horizon behavior.\n\nAPPROACH — the project implements classic rules across regimes: elementary Rule 30 (chaotic, used historically for randomness), Rule 110 (known to be Turing-complete), Conway's Game of Life (a 2D totalistic rule that produces gliders and other moving structures), and Totalistic Rule 126. Across these it surfaces phase transitions, self-replication, and chaos, and quantifies emergent phenomena such as glider propagation in the Game of Life — bridging theory with hands-on computational experimentation in generative systems.\n\nTECH — Python with cellpylib for the automaton engine and Matplotlib for the simulations, animations, and interactive visualizations.",
    "tech": [
      "Cellular Automata",
      "Python",
      "Simulation",
      "Complexity Science"
    ],
    "image": "/images/projects/cellular-automata.png",
    "color": "#10B981",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1-mWXbkm4SXeZNGVXM8Y2xHCfKallwKqs/view?usp=sharing",
    "link": "https://drive.google.com/file/d/16DRNkKl4_CKk-Bjgc4iUxLL6zG0w_6wp/view?usp=drive_link"
  },
  {
    "id": "covid-simulation",
    "title": "COVID-19 Spread Simulation",
    "category": "Research",
    "metric": "Epidemiology",
    "description": "Agent-based COVID-19 spread simulation driven by SIR dynamics, animating infection, recovery, and fatality across a population on a live polar plot.",
    "longDescription": "An epidemiological simulation that models how COVID-19 propagates through a population using the classic SIR (Susceptible-Infected-Recovered) framework, making the abstract dynamics of an outbreak visible and intuitive. The goal is to show, frame by frame, how a handful of parameters shape the whole trajectory of a pandemic.\n\nWORKFLOW — the model is seeded with key epidemiological inputs: the basic reproduction number (R0), recovery time, and fatality rate. On each time step it advances every individual through the SIR states, deciding who becomes infected from contact, who recovers, and who is lost, then re-renders the population's status. The animation updates dynamically so the rise, peak, and decline of cases unfold in real time.\n\nARCHITECTURE — population members are tracked as state variables and laid out on a polar plot, with infected, recovered, and deceased individuals color-coded so the changing composition of the population is immediately legible. The transition logic applies the SIR rate equations governed by R0, recovery time, and fatality rate, while NumPy handles the numerical state arrays and Matplotlib's animation loop draws each successive frame.\n\nTECH STACK — Python, NumPy, and Matplotlib for simulation, numerical state handling, and animated data visualization.",
    "tech": [
      "Python",
      "Data Visualization",
      "Simulation",
      "Matplotlib"
    ],
    "image": "/images/projects/covid-sim.png",
    "color": "#EF4444",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1jkcdypjfS_V1_B_5ve2nBgytGCiawe0U/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1tCXmz6fvERzUJirARFN_-3lsFWgDx530/view?usp=sharing"
  },
  {
    "id": "hilbert-curve",
    "title": "Hilbert Curve Visualization",
    "category": "Research",
    "metric": "Fractals",
    "description": "Interactive renderer for Hilbert space-filling curves, recursing to 5th-order (65,536 segments) to show how a 1D sequence threads continuously through 2D space.",
    "longDescription": "An interactive visualization of the Hilbert curve, a continuous space-filling fractal that maps a 1D sequence onto a 2D grid while preserving locality. It illustrates algorithmic geometry by drawing how a single unbroken line can sweep through every cell of a square as the recursion deepens.\n\nWORKFLOW — the user selects an iteration order and the program constructs the curve recursively, building each higher-order pattern from four rotated and connected copies of the previous one, then renders the result in a Tkinter GUI. It scales up to 5th-order iterations (65,536 segments), letting the viewer watch fractal complexity grow step by step.\n\nARCHITECTURE — the curve is generated by precise angle-controlled recursion using 90-degree rotations to orient the four sub-quadrants correctly, drawn with Python's Turtle graphics. The design highlights two core properties: locality preservation, where points close together along the 1D path map to nearby 2D coordinates, and the exponential growth of segment count following 4^n, which the implementation surfaces through performance analysis across orders.\n\nTECH STACK — Python, Turtle graphics, and Tkinter, built around a recursive fractal-generation algorithm.",
    "tech": [
      "Fractals",
      "Python",
      "Tkinter",
      "Algorithms"
    ],
    "image": "/images/projects/hilbert-curve.png",
    "color": "#06B6D4",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1uUzG0yH7lUjmwptDzqy-xSqQnE3Uyqfp/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1XzX7iA6eBHwl-_bLiGYDjKIkjnjUKM7N/view?usp=sharing"
  },
  {
    "id": "barnsley-fern",
    "title": "Barnsley Fern Fractal Generation",
    "category": "Research",
    "metric": "Fractals",
    "description": "Generates the Barnsley fern via a chaos-game iterated function system, applying four probabilistic affine transformations across 11,000+ points to grow a self-similar leaf.",
    "longDescription": "A mathematical recreation of the Barnsley fern, a naturalistic fractal that emerges from an iterated function system (IFS), demonstrating how organic-looking form arises from pure math and controlled randomness. It is a hands-on study of how chaos-game iteration converges onto a structured attractor.\n\nWORKFLOW — starting from a single seed point, the program repeatedly picks one of four affine transformation rules at random according to fixed probabilities, applies it to the current point, and plots the result. Iterating over 11,000+ points gradually fills in the fern's stem, fronds, and self-similar sub-leaves.\n\nARCHITECTURE — each of the four transformation rules is an affine map (scaling, rotation, and translation) weighted by a selection probability; one rule draws the stem while the others build the successively smaller leaflets, so deterministic linear algebra plus probabilistic rule selection together reproduce the fern's recursive structure. Rendering uses Python's Turtle graphics with performance optimizations such as tracer control and instant screen updates to keep the high-iteration draw smooth.\n\nTECH STACK — Python, Turtle graphics, and the mathematics of affine transformations and chaos theory.",
    "tech": [
      "Fractals",
      "Python",
      "Chaos Theory",
      "Math"
    ],
    "image": "/images/projects/fractal-gen.png",
    "color": "#22C55E",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1HhqQf6UFMEJ4MSgRbcMfbEDyPDsGWbRw/view?usp=sharing",
    "link": "https://drive.google.com/file/d/1EMN91IZDRg-Od8s9YAzi7dACLNhB4c0j/view?usp=sharing"
  },
  {
    "id": "maurer-rose",
    "title": "Maurer Rose Visualization",
    "category": "Research",
    "metric": "Generative Art",
    "description": "Interactive, animated Maurer rose renderer in p5.js where adjusting the n and d parameters reshapes the polar curve in real time to reveal its intricate patterns.",
    "longDescription": "An interactive, animated visualization of the Maurer rose, a mathematical curve plotted in polar coordinates that produces strikingly intricate geometric patterns from two simple integer parameters. The aim is to make the curve's behavior explorable, letting the viewer build intuition for how small parameter changes ripple into very different forms.\n\nWORKFLOW — the sketch sweeps an angle around a rose curve and connects sampled points with straight line segments, where the chosen parameters (n, which sets the number of petals, and d, the angular step) determine which points are joined and thus the overlapping lattice of lines that results. As parameters are adjusted, the visualization updates dynamically and animates the transition.\n\nARCHITECTURE — each point is computed from the polar rose equation and converted to Cartesian coordinates for drawing; the connect-by-step rule layered over the underlying rose is what creates the dense, web-like Maurer pattern. p5.js's animation loop redraws the curve every frame so the response to parameter changes is immediate and continuous.\n\nTECH STACK — JavaScript with the p5.js creative-coding library, applied to the polar-coordinate mathematics of rose curves.",
    "tech": [
      "p5.js",
      "Creative Coding",
      "Math",
      "JavaScript"
    ],
    "image": "/images/projects/maurer-rose.png",
    "color": "#EC4899",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1EoSE2njBWId9uASjj_tOohbTrYRrfkm5/view?usp=sharing",
    "link": "https://drive.google.com/file/d/10Z2WIdsP8HDPW4J0Ylcgru8ALUYiDfBH/view?usp=sharing"
  },
  {
    "id": "edge-detection",
    "title": "Edge Detection Algorithms",
    "category": "AI",
    "metric": "Computer Vision",
    "description": "Computer-vision pipeline that preprocesses an image and runs Canny edge detection, visualizing each stage from original through grayscale and Gaussian blur to detected edges.",
    "longDescription": "An image-analysis project that implements a classic computer-vision edge-detection pipeline, extracting structural boundaries from an image while showing the effect of each preprocessing stage. It serves as a clear, step-by-step demonstration of how the Canny detector works in practice.\n\nWORKFLOW — the pipeline loads an input image, resizes it, converts it to grayscale, applies a Gaussian blur to suppress noise, and then runs the Canny edge detection algorithm to identify edges. Every intermediate result is rendered, presenting the original, resized, grayscale, blurred, and edge-detected images side by side for comparison.\n\nARCHITECTURE — grayscale conversion reduces the image to a single intensity channel, and the Gaussian blur smooths it so that spurious high-frequency noise is not mistaken for edges. Canny then computes intensity gradients, applies non-maximum suppression to thin candidate edges to single-pixel lines, and uses hysteresis thresholding with a high and low threshold to keep strong edges and only the weak edges connected to them, yielding clean, continuous contours.\n\nTECH STACK — Python with OpenCV for image processing and the Canny pipeline, and Matplotlib for visualizing each stage.",
    "tech": [
      "OpenCV",
      "Python",
      "Image Processing",
      "Matplotlib"
    ],
    "image": "/images/projects/edge-detection.png",
    "color": "#64748B",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1GZqXq9tq4qYq9qXq9qXq9qXq9qXq9qX/view?usp=sharing",
    "link": "#"
  },
  {
    "id": "smart-dustbin",
    "title": "Smart Dustbin",
    "category": "Robotics",
    "metric": "Arduino",
    "description": "Touchless Arduino UNO dustbin that opens automatically on hand proximity via an ultrasonic sensor, cutting contact and spillage with a 0.5s response.",
    "longDescription": "An automated, touchless waste bin built to eliminate the hygiene risks of manual lids: frequent hand contact, lids left open, odor, and spillage. It senses an approaching hand, opens the lid hands-free, and closes again after disposal for cleaner, contactless operation.\n\nWorkflow: an ultrasonic sensor continuously pings the space above the bin and measures distance from the echo return time. When an object is detected within range (up to 50 cm), the Arduino UNO drives the lid open; once the user steps away and the proximity clears, a short timer triggers automatic closure.\n\nArchitecture: the ultrasonic module (trigger/echo) feeds distance readings to the Arduino UNO, where embedded C++ firmware applies a distance threshold to decide open vs. closed and commands a servo motor to actuate the lid through its sweep angles. Tuning the threshold and debounce timing yields reliable triggering with minimal false opens. The build was validated across 100+ test cycles, reaching 95% detection accuracy and a 0.5-second response time for a ~60% gain in user convenience.\n\nTech stack: Arduino UNO, ultrasonic proximity sensor, servo actuation, and embedded C++ on an Arduino microcontroller.",
    "tech": [
      "Arduino",
      "Sensors",
      "Embedded Systems",
      "C++"
    ],
    "image": "/images/projects/smart-dustbin.png",
    "color": "#10B981",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1GZqXq9tq4qYq9qXq9qXq9qXq9qXq9qX/view?usp=sharing",
    "link": "#"
  },
  {
    "id": "autonomous-rover",
    "title": "Autonomous Rover",
    "category": "Robotics",
    "metric": "Arduino Bot",
    "description": "Self-navigating Arduino Duemilanove rover that detects obstacles in real time and steers around them autonomously using onboard proximity sensors.",
    "longDescription": "An autonomous moving bot built on the Arduino Duemilanove that explores its surroundings on its own, detecting and avoiding obstacles in real time without remote control. The goal is hands-free navigation: keep moving forward while continuously watching for and steering clear of anything in the path.\n\nWorkflow: the rover drives forward by default while its onboard sensors scan ahead for obstacles. When an object is detected within a set distance, the controller halts forward motion, evaluates the surroundings, and selects a clear heading — turning or reversing as needed — before resuming forward travel. This sense-decide-act cycle repeats continuously so the bot adapts to its environment on the fly.\n\nArchitecture: proximity/range sensors feed live distance readings to the Arduino Duemilanove, where embedded C++ firmware runs the obstacle-avoidance logic and converts decisions into motor commands via a motor driver to control the drive wheels' speed and direction. Threshold-based detection plus simple turn maneuvers keep the navigation loop fast and reactive.\n\nTech stack: Arduino Duemilanove, obstacle-detection sensors, a motor driver and DC drive motors, and embedded C++ for the real-time control loop.",
    "tech": [
      "Arduino",
      "Robotics",
      "Sensors",
      "C++"
    ],
    "image": "/images/projects/autonomous-rover.png",
    "color": "#F43F5E",
    "featured": false,
    "year": "2023",
    "documentation": "https://drive.google.com/file/d/1GZqXq9tq4qYq9qXq9qXq9qXq9qXq9qX/view?usp=sharing",
    "link": "#"
  }
];
