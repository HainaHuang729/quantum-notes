import { Children, Fragment, cloneElement, createElement, isValidElement, type ReactNode } from "react";

export type CardKind = "concept" | "definition" | "proof" | "experiment" | "quiz" | "reading";
export interface LessonCard {
  id: string;
  sectionId: string;
  title: string;
  kind: CardKind;
  nodes: ReactNode[];
  anchors: string[];
  topics?: number;
}
type ElementProps = { children?: ReactNode; id?: string; title?: string; label?: string; className?: string };
const propsOf = (node: ReactNode) => isValidElement<ElementProps>(node) ? node.props : {};
export function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  return isValidElement<ElementProps>(node) ? nodeText(node.props.children) : "";
}
function flatten(node: ReactNode): ReactNode[] {
  return Children.toArray(node).flatMap((child) => isValidElement<ElementProps>(child) && child.type === Fragment
    ? flatten(child.props.children) : typeof child === "string" && !child.trim() ? [] : [child]);
}
function anchorsOf(nodes: ReactNode[]): string[] {
  return nodes.flatMap((node) => {
    if (!isValidElement<ElementProps>(node)) return [];
    return [...(node.props.id ? [node.props.id] : []), ...anchorsOf(Children.toArray(node.props.children))];
  });
}

/** Partition static MDX blocks; interactive component functions are never invoked here. */
export function splitCards(content: ReactNode, sectionId: string, sectionTitle: string,
  kinds: ReadonlyMap<unknown, CardKind>, mathTypes: ReadonlySet<unknown>): LessonCard[] {
  const cards: LessonCard[] = [];
  let heading = sectionTitle, pending: ReactNode[] = [], weight = 0, serial = 0;
  const add = (nodes: ReactNode[], title: string, kind: CardKind) => {
    cards.push({ id: `card-${sectionId}-${cards.length + 1}`, sectionId, title, kind, nodes, anchors: anchorsOf(nodes) });
  };
  const flush = () => {
    if (!pending.length) return;
    add(pending, serial ? `${heading} · 续` : heading, "concept"); pending = []; weight = 0; serial++;
  };
  const blocks = flatten(content);
  for (let i = 0; i < blocks.length; i++) {
    const node = blocks[i], p = propsOf(node);
    if (isValidElement(node) && typeof node.type === "string" && /^(h[1-4])$/.test(node.type)) {
      flush(); heading = nodeText(node); serial = 0;
      if (p.id) pending.push(node); // Retain source anchors without repeating the slide title.
      continue;
    }
    if (isValidElement(node) && node.type === "p" && p.className === "text-sm text-slate-500 dark:text-slate-400" && cards.length && !pending.length) {
      cards[cards.length - 1].nodes.push(node);
      continue;
    }
    const special = isValidElement(node) ? kinds.get(node.type) : undefined;
    if (special) {
      const headingOnly = pending.length > 0 && pending.every(el => isValidElement(el) && typeof el.type === "string" && /^h[1-4]$/.test(el.type));
      if (!headingOnly) flush();
      const prefix = headingOnly ? pending : [];
      pending = []; weight = 0;
      const title = p.title || (special === "quiz" ? "停一下，检查你的理解" : special === "proof" ? `${heading}：逐步推导` : p.label?.replace(/^\d+(?:\.\d+)*\s*\((.*)\)$/, "$1") || heading);
      const body = flatten(p.children);
      const widgetAt = special === "experiment" ? body.findIndex(el => isValidElement(el) && typeof el.type === "function" && !mathTypes.has(el.type) && !kinds.has(el.type)) : -1;
      if (widgetAt >= 0 && widgetAt + 1 < body.length && isValidElement<ElementProps>(node)) {
        add([...prefix, cloneElement(node, {}, ...body.slice(0, widgetAt + 1))], title, special);
        for (const part of splitCards(body.slice(widgetAt + 1), sectionId, `${title}：观察与理解`, kinds, mathTypes)) add(part.nodes, part.title, part.kind);
      } else if (special === "definition" && isValidElement<ElementProps>(node) && (nodeText(p.children).length > 360 || flatten(p.children).length > 5)) {
        const parts = splitCards(p.children, sectionId, title, kinds, mathTypes);
        parts.forEach((part, j) => add([...(j ? [] : prefix), cloneElement(node, { id: j ? undefined : p.id }, ...part.nodes)], j ? `${title} · ${j + 1}` : title, part.kind === "concept" ? special : part.kind));
      } else add([...prefix, node], title, special);
      continue;
    }
    // A lead-in paragraph travels with its equations instead of ending on a separate slide.
    const unit = [node];
    while (unit.length < 3 && i + 1 < blocks.length && isValidElement(blocks[i + 1]) && mathTypes.has((blocks[i + 1] as {type: unknown}).type)) unit.push(blocks[++i]);
    const cost = unit.reduce<number>((n, el) => n + nodeText(el).replace(/\\[a-z]+|[{}]/gi, "").length, 0);
    if (pending.length && (weight + cost > 340 || pending.length + unit.length > 6)) flush();
    pending.push(...unit); weight += cost;
  }
  flush();
  return cards;
}

/** Keep related explanation, statements and derivation together; retain old links. */
export function groupCards(cards: LessonCard[]): LessonCard[] {
  const result: LessonCard[] = [];
  let group: LessonCard[] = [], weight = 0, blocks = 0;
  const flush = () => {
    if (!group.length) return;
    const first = group[0];
    if (group.length === 1) result.push(first);
    else {
      const nodes: ReactNode[] = [], titles = new Set<string>();
      for (const card of group) {
        const title = card.title.replace(/\s*·\s*(?:续|\d+)$/, "");
        const heading=nodes.length&&!titles.has(title)&&card.kind!=="definition"
          ? createElement("h3", {className:"topic-subheading"}, title) : null;
        titles.add(title);
        nodes.push(createElement("div", {className:"topic-part",key:card.id,id:card.id===first.id?undefined:card.id}, heading, ...card.nodes));
      }
      result.push({...first, kind:"concept", topics:group.length, nodes,
        anchors:[...new Set(group.flatMap(card=>[...card.anchors,...(card.id===first.id?[]:[card.id])]))]});
    }
    group=[]; weight=0; blocks=0;
  };
  for (const card of cards) {
    if (["experiment","quiz","reading"].includes(card.kind)) { flush(); result.push(card); continue; }
    const cost=nodeText(card.nodes).replace(/\\[a-z]+|[{}]/gi, "").length;
    if (group.length && (group.length===3 || weight+cost>900 || blocks+card.nodes.length>14)) flush();
    group.push(card); weight+=cost; blocks+=card.nodes.length;
  }
  flush();
  return result;
}
