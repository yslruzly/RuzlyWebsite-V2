import {
  Code2,
  Cpu,
  Terminal,
  Pencil,
  Sprout,
  Computer,
  type LucideIcon,
} from "lucide-react";

export type SkillItem = {
  Icon: LucideIcon;
  name: string;
  desc: string;
  tags: string[];
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  kind: string;
  image?: string;
  Icon: LucideIcon;
  github?: string;
  live?: string;
  featured?: boolean;
};

export type ExpItem = {
  year: string;
  role: string;
  company: string;
  desc: string;
};

export const SKILLS: SkillItem[] = [
  {
    Icon: Code2,
    name: "Frontend",
    desc: "Developing responsive, user-centered front-end interfaces with clean, maintainable code and a focus on performance and seamless user experience.",
    tags: ["React", "TypeScript", "Next.js", "Tailwind"],
  },
  {
    Icon: Terminal,
    name: "Backend",
    desc: "Developing reliable and scalable backend systems with a focus on clean architecture, optimized performance, and efficient APIs.",
    tags: ["Node.js", "Python", "PostgreSQL", "Postman", "Prisma", "tRPC", "Docker", "Firebase", "Supabase"],
  },
  {
    Icon: Pencil,
    name: "Design & Media",
    desc: "Creating visually engaging graphics, digital content, and 3D visuals with a focus on clarity, creativity, and meaningful visual impact.",
    tags: ["Figma", "Canva", "Adobe PS", "Blender"],
  },
  {
    Icon: Cpu,
    name: "Infrastructure",
    desc: "Deploying and managing scalable cloud-based applications using modern platforms.",
    tags: ["AWS", "Vercel"],
  },
];

export const projects: Project[] = [
  {
    slug: "anisense",
    name: "AniSense",
    tagline: "Crop market monitoring for farmers",
    description:
      "Mobile-based crop market monitoring application built as our group undergraduate thesis — price tracking, AI analytics, and market insights for Filipino farmers.",
    stack: ["React Native", "TypeScript", "Tailwind", "PostgreSQL", "Capacitor", "Python", "TensorFlow"],
    kind: "Thesis / Mobile",
    image: "/images/Thesis.png",
    Icon: Sprout,
    github: "https://github.com/yslruzly",
    featured: true,
  },
  {
    slug: "notechat",
    name: "NoteChat",
    tagline: "RAG-powered study assistant",
    description:
      "Upload notes and ask questions. Features an AI eval dashboard that automatically scores every response for faithfulness, relevance, and completeness using an LLM-as-judge pipeline.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind", "Supabase", "Vercel"],
    kind: "AI / RAG",
    image: "/images/NoteChat.png",
    Icon: Computer,
    github: "https://github.com/yslruzly/NoteChat",
    live: "https://note-chat-s.vercel.app",
    featured: true,
  },
  {
    slug: "researchai",
    name: "ResearchAI",
    tagline: "Agentic research, not search results",
    description:
      "An AI-powered research assistant that helps users explore and synthesize information across multiple topics. Delivers structured insights, source breakdowns, and key takeaways through a clean, conversational interface.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Groq Llama", "Jina AI"],
    kind: "AI / Agent",
    image: "/images/ResearchAI.png",
    Icon: Code2,
    github: "https://github.com/yslruzly",
    live: "https://researchai-rm.vercel.app",
    featured: true,
  },
  {
    slug: "portfolio-v1",
    name: "Portfolio Website",
    tagline: "Version 1 of this site",
    description:
      "A modern portfolio website showcasing my work and skills — the first version of the site you're looking at right now.",
    stack: ["React", "TypeScript", "Tailwind", "Vite", "Vercel"],
    kind: "Web",
    image: "/images/Portfolio.png",
    Icon: Sprout,
    github: "https://github.com/yslruzly/Portfolio-website",
    live: "https://ruzly-macatula.vercel.app",
  },
  {
    slug: "pillars-of-wisdom",
    name: "Pillars of Wisdom",
    tagline: "Ancient philosophy, explored",
    description:
      "Exploring the foundational ideas of ancient Greek and Roman philosophy through an interactive web experience.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind", "Firebase", "Vercel"],
    kind: "Web",
    Icon: Computer,
    github: "https://github.com/yslruzly",
  },
  {
    slug: "archiboardph",
    name: "ArchiBoardPH",
    tagline: "Architecture board exam review",
    description:
      "Architecture Board Exam review platform for Philippine examinees — curriculum, mock exams, and progress tracking. Currently in progress.",
    stack: ["React", "Next.js", "TypeScript", "Tailwind", "Supabase", "Vercel"],
    kind: "EdTech / In progress",
    image: "/images/ArchiBoardPH.png",
    Icon: Code2,
    github: "https://github.com/yslruzly",
  },
];

export const EXPERIENCES: ExpItem[] = [
  {
    year: "2026 — Present",
    role: "On The Job Training",
    company: "Onecore Consultancy / NextCore Technology · Onsite",
    desc: "Developing practical skills in a real-world work environment.",
  },
  {
    year: "2023 — Present",
    role: "3rd Year BS ComSci",
    company: "University Of The East - Manila · Hybrid",
    desc: "Aspiring Software Engineer Student.",
  },
  {
    year: "2022",
    role: "Wrote my First Line of Code",
    company: "N/A · Remote",
    desc: "Marked the beginning of my coding journey, where I learned basic programming concepts and logic.",
  },
];

export const stackMarquee = [
  "React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", "Python",
  "PostgreSQL", "Supabase", "Prisma", "tRPC", "Docker", "Firebase",
  "Vercel", "AWS", "Figma", "Blender",
];

export const links = {
  github: "https://github.com/yslruzly",
  githubLabel: "@yslruzly",
  linkedin: "https://linkedin.com/in/ruzly-macatula",
  linkedinLabel: "linkedin.com/in/ruzly-macatula",
  facebook: "https://facebook.com/ruzly.macatula",
  facebookLabel: "facebook.com/ruzly.macatula",
  email: "mailto:macatulajohnruzly@gmail.com",
  emailLabel: "macatulajohnruzly@gmail.com",
  website: "https://ruzly-macatula.vercel.app",
  websiteLabel: "ruzly-macatula.vercel.app",
};
