import { Inter, Source_Serif_4, IBM_Plex_Sans, Lora } from "next/font/google";
import type { TemplateSettings } from "@/lib/schemas/resume";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });
const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const templateFontClasses = [
  inter.variable,
  sourceSerif.variable,
  ibmPlex.variable,
  lora.variable,
].join(" ");

export const fontFamilyCss: Record<TemplateSettings["fontFamily"], string> = {
  inter: "var(--font-inter), sans-serif",
  "source-serif": "var(--font-source-serif), serif",
  "ibm-plex": "var(--font-ibm-plex), sans-serif",
  lora: "var(--font-lora), serif",
};

export const fontFamilyLabels: Record<TemplateSettings["fontFamily"], string> = {
  inter: "Inter",
  "source-serif": "Source Serif",
  "ibm-plex": "IBM Plex Sans",
  lora: "Lora",
};
