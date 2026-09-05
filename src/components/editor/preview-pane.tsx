"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { getTemplate } from "@/templates/registry";
import { templateFontClasses } from "@/lib/fonts";

const A4_WIDTH_PX = 794; // 210mm at 96dpi

export function PreviewPane() {
  const content = useEditorStore((s) => s.content);
  const settings = useEditorStore((s) => s.settings);
  const templateId = useEditorStore((s) => s.templateId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width - 48;
      setScale(Math.min(available / A4_WIDTH_PX, 1.2));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Template = getTemplate(templateId).component;

  return (
    <div ref={containerRef} className="h-full overflow-y-auto bg-zinc-200/70 p-3 sm:p-6 dark:bg-zinc-800">
      <div className="mx-auto w-fit" style={{ zoom: scale }}>
        <div className={templateFontClasses}>
          <div className="shadow-lg">
            <Template content={content} settings={settings} mode="preview" />
          </div>
        </div>
      </div>
    </div>
  );
}
