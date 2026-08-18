export const site = {
  name: "Ajay Kumar Koilathachetta",
  shortName: "Ajay Kumar",
  title: "SDE 2 (Founding Engineer)",
  company: "Lenity Health",
  companyUrl: "https://www.linkedin.com/company/lenityhealth/",
  tagline:
    "I build production AI systems end to end — voice agents, event-driven backends, and the interfaces that run them.",
  location: "Bengaluru, Karnataka, India",
  email: "ajaykumarkc03@gmail.com",
  url: "https://ajaykumarkc.vercel.app",
  links: {
    github: "https://github.com/ajaykumarkc",
    linkedin: "https://www.linkedin.com/in/ajay-kumar-koilathachetta-369675252",
    leetcode: "https://leetcode.com/u/ajaykumarkc03/",
  },
};

export const about = [
  "I'm a software engineer in Bengaluru, currently the founding engineer at Lenity Health, where I've built and architected a production AI voice-agent platform from scratch as the primary engineer on a two-person team — owning everything from system design and backend services to AI integrations and production infrastructure.",
  "The platform turns unstructured phone conversations into structured intents, summaries, and automated clinical workflows for medical practices. In its first 30 days it processed over 2,500 production calls, and its event-driven pipeline has driven 100+ automated tele-encounters into eClinicalWorks since launch.",
  "Before Lenity, I shipped AI-powered reporting features at CAST Software and built inventory systems serving 500+ active users at Powerplay. I care about systems that hold up in production, interfaces that stay out of the way, and owning problems from architecture to deployment.",
];

export type Experience = {
  company: string;
  companyUrl: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  tags: string[];
};

export const experience: Experience[] = [
  {
    company: "Lenity Health",
    companyUrl: "https://www.linkedin.com/company/lenityhealth/",
    role: "Software Engineer II",
    period: "Jan 2026 — Present",
    location: "Bengaluru",
    summary:
      "Built and architected a production AI voice-agent platform from scratch as the primary engineer on a 2-person team — owning system design, Java/Spring Boot services, React/TypeScript frontends, AI integrations, workflow automation, and production infrastructure.",
    highlights: [
      "Built the Retell AI voice-agent pipeline and real-time operations dashboard — 2,500+ production calls processed in 30 days, converting unstructured conversations into structured intents, summaries, and actionable workflows for medical practices.",
      "Designed an event-driven workflow pipeline connecting AI-generated intent to downstream clinical automation, including structured payload generation and eClinicalWorks integration via Cyberdesk — 100+ automated tele-encounters since launch.",
      "Designed for concurrent voice workloads — 20 simultaneous AI calls on the current Retell configuration — with a modular architecture for onboarding new practices, intents, and workflows.",
      "Owned the complete engineering lifecycle: architecture, implementation, debugging, deployment, product decisions, and hiring in a high-autonomy 2-engineer org.",
    ],
    tags: ["Java", "Spring Boot", "React", "TypeScript", "Retell AI", "Event-Driven Architecture"],
  },
  {
    company: "CAST Software",
    companyUrl: "https://www.castsoftware.com/",
    role: "SDE Intern",
    period: "Jul 2025 — Dec 2025",
    location: "Bengaluru",
    summary:
      "Worked across React and Go microservices on developer-facing product features and infrastructure.",
    highlights: [
      "Developed an Application Report Generation feature using React and Go, with optional AI-generated summaries powered by LangChain and Claude endpoints.",
      "Optimized production Dockerfiles, cutting container image sizes by 500MB+ and accelerating CI/CD pipeline execution.",
      "Integrated OpenAPI/Swagger documentation across Go microservices and implemented deep linking for application flaw insights, improving API discoverability and cross-team debugging.",
    ],
    tags: ["React", "Go", "LangChain", "Claude", "Docker", "OpenAPI"],
  },
  {
    company: "Powerplay",
    companyUrl: "https://www.getpowerplay.in/",
    role: "SDE Intern",
    period: "Feb 2025 — Jul 2025",
    location: "Bengaluru",
    summary:
      "Built backend systems for construction-management workflows at scale.",
    highlights: [
      "Engineered a Subcontractor Inventory Management System with version history and analytics for 500+ active users.",
      "Reduced API response times by 70% via optimized paginated endpoints; implemented Elasticsearch for rapid Material Return ID search.",
      "Built asynchronous Excel report generation using Amazon SQS and executed database migrations for 2,000+ legacy records.",
    ],
    tags: ["REST APIs", "Elasticsearch", "Amazon SQS"],
  },
];

export const skills: { label: string; items: string[] }[] = [
  {
    label: "Languages",
    items: ["Java", "Python", "Go", "C++", "JavaScript", "TypeScript", "SQL"],
  },
  {
    label: "Frameworks",
    items: ["Spring Boot", "React", "Next.js", "FastAPI", "Node.js", "Redux"],
  },
  {
    label: "Cloud & Infrastructure",
    items: ["AWS", "Docker", "Kubernetes", "Jenkins", "ArgoCD", "Linux", "Shell Scripting"],
  },
  {
    label: "Systems & Data",
    items: ["REST APIs", "Microservices", "Event-Driven Architecture", "MongoDB", "Elasticsearch"],
  },
  {
    label: "AI & Developer Tools",
    items: ["Retell AI", "Claude", "LangChain", "OpenAPI/Swagger", "Git", "Prometheus", "Grafana"],
  },
];

export const achievements = [
  {
    title: "Top 20 · Flipkart Grid 6.0",
    description:
      "Placed in the top 20 among 160,000+ teams across India in Flipkart's flagship engineering challenge.",
    linkLabel: "FLIP-Chart on GitHub",
    url: "https://github.com/ajaykumarkc/FLIP-Chart",
  },
  {
    title: "Global Rank 1753 · LeetCode Weekly Contest 364",
    description:
      "Competitive programming under time pressure, against a global field.",
    linkLabel: "LeetCode profile",
    url: "https://leetcode.com/u/ajaykumarkc03/",
  },
];

export const education = {
  school: "International Institute of Information Technology, Raipur",
  degree: "B.Tech in Computer Science",
  period: "2021 — 2025",
  location: "Raipur, Chhattisgarh",
  detail: "CGPA 7.88 / 10",
};
