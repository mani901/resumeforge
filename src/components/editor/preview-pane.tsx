"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { getTemplate } from "@/templates/registry";
import { templateFontClasses } from "@/lib/fonts";

const A4_WIDTH_PX = 794; // 210mm at 96dpi
const A4_HEIGHT_PX = 1123; // 297mm at 96dpi
const MM_TO_PX = 96 / 25.4;
const MAX_EXTRA_PAGES = 10;

// The content is laid out in CSS columns of exactly one page-content size, which runs
// the browser's real fragmentation engine — the same one Puppeteer uses when printing —
// so break-inside/break-after rules paginate the preview exactly like the PDF.
function pagerStyle(pageCount: number, contentHeight: number): CSSProperties {
  return {
    width: pageCount * A4_WIDTH_PX,
    height: contentHeight,
    columnWidth: A4_WIDTH_PX,
    columnGap: 0,
    columnFill: "auto",
  };
}

export function PreviewPane() {
  const content = useEditorStore((s) => s.content);
  const settings = useEditorStore((s) => s.settings);
  const templateId = useEditorStore((s) => s.templateId);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const pagerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [flowHeight, setFlowHeight] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  // Vertical page margins are real print margins (@page), mirrored here.
  const marginPx = settings.pageMargin * MM_TO_PX;
  const contentHeight = A4_HEIGHT_PX - 2 * marginPx;
  const estimate = Math.max(1, Math.ceil(flowHeight / contentHeight));

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

  // Natural flow height gives a lower bound for the page count.
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setFlowHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset to the lower bound whenever content changes, then grow until the pager
  // stops overflowing — break-avoidance pushes content into extra pages.
  useLayoutEffect(() => {
    setPageCount(estimate);
  }, [content, settings, templateId, estimate]);

  useLayoutEffect(() => {
    const el = pagerRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth + 2 && pageCount < estimate + MAX_EXTRA_PAGES) {
      setPageCount((c) => c + 1);
    }
  }, [pageCount, estimate, content, settings, templateId]);

  const Template = getTemplate(templateId).component;
  const page = <Template content={content} settings={settings} mode="preview" />;

  return (
    <div ref={containerRef} className="h-full overflow-y-auto bg-zinc-200/70 p-3 sm:p-6 dark:bg-zinc-800">
      <div className="relative mx-auto w-fit" style={{ zoom: scale }}>
        <div className={templateFontClasses}>
          {/* invisible copies: natural-height measurer + overflow probe */}
          <div aria-hidden className="pointer-events-none invisible absolute left-0 top-0 overflow-hidden">
            <div ref={measureRef}>{page}</div>
          </div>
          <div aria-hidden className="pointer-events-none invisible absolute left-0 top-0 overflow-hidden">
            <div ref={pagerRef} style={pagerStyle(pageCount, contentHeight)}>
              {page}
            </div>
          </div>

          {Array.from({ length: pageCount }, (_, i) => (
            <div key={i} className={i < pageCount - 1 ? "mb-6" : ""}>
              <div
                className="relative overflow-hidden bg-white shadow-lg"
                style={{ width: A4_WIDTH_PX, height: A4_HEIGHT_PX }}
              >
                <div
                  className="absolute"
                  style={{ ...pagerStyle(pageCount, contentHeight), top: marginPx, left: -i * A4_WIDTH_PX }}
                >
                  {page}
                </div>
              </div>
              {pageCount > 1 && (
                <p className="mt-1.5 text-center text-xs text-zinc-500">
                  Page {i + 1} of {pageCount}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
