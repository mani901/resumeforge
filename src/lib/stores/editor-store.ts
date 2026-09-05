import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import type {
  ResumeContent,
  TemplateSettings,
  SectionId,
  Personal,
  CustomSection,
} from "@/lib/schemas/resume";

export type SaveState = "saved" | "dirty" | "saving" | "error";

type ListSectionKey = Exclude<keyof ResumeContent["sections"], "summary">;
type SectionItem<K extends ListSectionKey> = ResumeContent["sections"][K][number];

interface EditorState {
  resumeId: string;
  title: string;
  templateId: string;
  content: ResumeContent;
  settings: TemplateSettings;
  saveState: SaveState;
  hydrated: boolean;

  init(data: {
    resumeId: string;
    title: string;
    templateId: string;
    content: ResumeContent;
    settings: TemplateSettings;
  }): void;
  markSaving(): void;
  markSaved(): void;
  markError(): void;
  markDirty(): void;

  setTitle(title: string): void;
  setTemplate(templateId: string): void;
  updateSettings(patch: Partial<TemplateSettings>): void;

  setPersonal<K extends keyof Personal>(field: K, value: Personal[K]): void;
  setSummary(value: string): void;

  addItem<K extends ListSectionKey>(section: K, item: SectionItem<K>): void;
  updateItem<K extends ListSectionKey>(section: K, id: string, patch: Partial<SectionItem<K>>): void;
  removeItem(section: ListSectionKey, id: string): void;
  moveItem(section: ListSectionKey, fromId: string, toId: string): void;

  reorderSections(fromId: SectionId, toId: SectionId): void;
  toggleSectionHidden(id: SectionId): void;
  setSectionTitle(id: SectionId, title: string): void;

  updateCustomSection(id: string, patch: Partial<Omit<CustomSection, "items">>): void;
  addCustomItem(sectionId: string, item: CustomSection["items"][number]): void;
  updateCustomItem(
    sectionId: string,
    itemId: string,
    patch: Partial<CustomSection["items"][number]>
  ): void;
  removeCustomItem(sectionId: string, itemId: string): void;
}

function moveById<T extends { id: string }>(list: T[], fromId: string, toId: string) {
  const from = list.findIndex((i) => i.id === fromId);
  const to = list.findIndex((i) => i.id === toId);
  if (from === -1 || to === -1) return;
  const [item] = list.splice(from, 1);
  list.splice(to, 0, item);
}

export const useEditorStore = create<EditorState>()(
  temporal(
    immer((set) => ({
    resumeId: "",
    title: "",
    templateId: "ats-classic",
    content: null as unknown as ResumeContent,
    settings: null as unknown as TemplateSettings,
    saveState: "saved",
    hydrated: false,

    init: (data) =>
      set((s) => {
        s.resumeId = data.resumeId;
        s.title = data.title;
        s.templateId = data.templateId;
        s.content = data.content;
        s.settings = data.settings;
        s.saveState = "saved";
        s.hydrated = true;
      }),
    markSaving: () => set((s) => void (s.saveState = "saving")),
    markSaved: () =>
      set((s) => {
        if (s.saveState === "saving") s.saveState = "saved";
      }),
    markError: () => set((s) => void (s.saveState = "error")),
    markDirty: () => set((s) => void (s.saveState = "dirty")),

    setTitle: (title) =>
      set((s) => {
        s.title = title;
        s.saveState = "dirty";
      }),
    setTemplate: (templateId) =>
      set((s) => {
        s.templateId = templateId;
        s.saveState = "dirty";
      }),
    updateSettings: (patch) =>
      set((s) => {
        Object.assign(s.settings, patch);
        s.saveState = "dirty";
      }),

    setPersonal: (field, value) =>
      set((s) => {
        s.content.personal[field] = value;
        s.saveState = "dirty";
      }),
    setSummary: (value) =>
      set((s) => {
        s.content.sections.summary = value;
        s.saveState = "dirty";
      }),

    addItem: (section, item) =>
      set((s) => {
        (s.content.sections[section] as SectionItem<typeof section>[]).push(item);
        s.saveState = "dirty";
      }),
    updateItem: (section, id, patch) =>
      set((s) => {
        const list = s.content.sections[section] as { id: string }[];
        const item = list.find((i) => i.id === id);
        if (item) Object.assign(item, patch);
        s.saveState = "dirty";
      }),
    removeItem: (section, id) =>
      set((s) => {
        const list = s.content.sections[section] as { id: string }[];
        const idx = list.findIndex((i) => i.id === id);
        if (idx !== -1) list.splice(idx, 1);
        s.saveState = "dirty";
      }),
    moveItem: (section, fromId, toId) =>
      set((s) => {
        moveById(s.content.sections[section] as { id: string }[], fromId, toId);
        s.saveState = "dirty";
      }),

    reorderSections: (fromId, toId) =>
      set((s) => {
        const order = s.content.sectionOrder;
        const from = order.indexOf(fromId);
        const to = order.indexOf(toId);
        if (from === -1 || to === -1) return;
        order.splice(from, 1);
        order.splice(to, 0, fromId);
        s.saveState = "dirty";
      }),
    toggleSectionHidden: (id) =>
      set((s) => {
        const idx = s.content.hiddenSections.indexOf(id);
        if (idx === -1) s.content.hiddenSections.push(id);
        else s.content.hiddenSections.splice(idx, 1);
        s.saveState = "dirty";
      }),
    setSectionTitle: (id, title) =>
      set((s) => {
        if (title.trim()) s.content.sectionTitles[id] = title;
        else delete s.content.sectionTitles[id];
        s.saveState = "dirty";
      }),

    updateCustomSection: (id, patch) =>
      set((s) => {
        const cs = s.content.sections.custom.find((c) => c.id === id);
        if (cs) Object.assign(cs, patch);
        s.saveState = "dirty";
      }),
    addCustomItem: (sectionId, item) =>
      set((s) => {
        s.content.sections.custom.find((c) => c.id === sectionId)?.items.push(item);
        s.saveState = "dirty";
      }),
    updateCustomItem: (sectionId, itemId, patch) =>
      set((s) => {
        const item = s.content.sections.custom
          .find((c) => c.id === sectionId)
          ?.items.find((i) => i.id === itemId);
        if (item) Object.assign(item, patch);
        s.saveState = "dirty";
      }),
    removeCustomItem: (sectionId, itemId) =>
      set((s) => {
        const cs = s.content.sections.custom.find((c) => c.id === sectionId);
        if (!cs) return;
        const idx = cs.items.findIndex((i) => i.id === itemId);
        if (idx !== -1) cs.items.splice(idx, 1);
        s.saveState = "dirty";
      }),
    })),
    {
      limit: 100,
      partialize: (s) => ({
        content: s.content,
        settings: s.settings,
        title: s.title,
        templateId: s.templateId,
      }),
    }
  )
);

