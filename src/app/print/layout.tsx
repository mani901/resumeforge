import { templateFontClasses } from "@/lib/fonts";
import "./print.css";

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className={templateFontClasses}>{children}</div>;
}
