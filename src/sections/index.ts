import type { ComponentType, ReactNode } from "react";
import { EnvBlock, Interaktiv, Proof, Quiz, ExpandedReading, Eq, MD } from "../lib";
import { groupCards, splitCards, type CardKind, type LessonCard } from "../lesson/cards";
export interface SectionEntry { id: string; key?: string; title: string; cards: LessonCard[]; }
type SectionModule = { default: ComponentType; id?: string; key?: string; title?: string; };
const kinds = new Map<unknown, CardKind>([[EnvBlock,"definition"],[Interaktiv,"experiment"],[Proof,"proof"],[Quiz,"quiz"],[ExpandedReading,"reading"]]);
const math = new Set<unknown>([Eq, MD]);
const modules = import.meta.glob("./S*.mdx", { eager: true }) as Record<string, SectionModule>;
export const sections: SectionEntry[] = Object.entries(modules).map(([file, mod]) => {
  if (!mod.id?.trim() || !mod.title?.trim()) throw new Error(`Section ${file} must export id and title.`);
  // Chapter MDX is static, hook-free authoring. Calling its compiled factory builds elements;
  // widgets remain React elements and are rendered normally inside their cards.
  const content = (mod.default as (props: Record<string, unknown>) => ReactNode)({});
  return { id: mod.id, key: mod.key, title: mod.title, cards: groupCards(splitCards(content, mod.id, mod.title, kinds, math)) };
}).sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
