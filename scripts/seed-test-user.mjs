import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const content = {
  schemaVersion: 1,
  personal: {
    fullName: "Test User",
    headline: "MERN Stack Developer",
    email: "test@example.com",
    phone: "+92 300 0000000",
    location: "Karachi, PK",
    website: "",
    linkedin: "linkedin.com/in/test",
    github: "github.com/test",
  },
  sectionOrder: ["summary", "experience", "education", "skills", "projects", "certifications", "languages", "custom"],
  hiddenSections: [],
  sections: {
    summary: "Full-stack developer with 3 years of experience building web apps with React and Node.js.",
    experience: [
      {
        id: "exp1",
        role: "Software Engineer",
        company: "Acme Corp",
        location: "Remote",
        startDate: "Jan 2023",
        endDate: "",
        current: true,
        bullets: ["Built a resume maker with Next.js and PostgreSQL", "Reduced page load times by 40%"],
      },
    ],
    education: [
      { id: "edu1", degree: "BS Computer Science", institution: "NED University", location: "Karachi", startDate: "2019", endDate: "2023", details: "" },
    ],
    skills: [
      { id: "sk1", group: "Frontend", items: ["React", "Next.js", "Tailwind CSS"] },
      { id: "sk2", group: "Backend", items: ["Node.js", "PostgreSQL", "Prisma"] },
    ],
    projects: [],
    certifications: [],
    languages: [{ id: "lang1", name: "English", level: "Fluent" }],
    custom: [],
  },
};

const settings = {
  accentColor: "#2563eb",
  fontFamily: "inter",
  fontSize: 10,
  lineSpacing: 1.35,
  pageMargin: 16,
  sectionSpacing: 12,
};

const user = await prisma.user.upsert({
  where: { email: "test@example.com" },
  update: {},
  create: { email: "test@example.com", name: "Test User", passwordHash: await hash("password123", 10) },
});

const existing = await prisma.resume.findFirst({ where: { userId: user.id } });
const resume =
  existing ??
  (await prisma.resume.create({
    data: { userId: user.id, title: "Test Resume", content, settings },
  }));

console.log(JSON.stringify({ userId: user.id, resumeId: resume.id }));
await prisma.$disconnect();
