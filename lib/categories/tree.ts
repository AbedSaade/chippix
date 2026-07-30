import categoriesData from "@/data/categories.json";

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  image?: string;
  parentId?: number;
  depth: 1 | 2 | 3;
  productTotal?: number;
  childCount?: number;
};

type CategoryFile = {
  categories: CategoryNode[];
};

const nodes = (categoriesData as CategoryFile).categories;
const byId = new Map(nodes.map((node) => [node.id, node]));
const bySlug = new Map(nodes.map((node) => [`${node.id}-${node.slug}`, node]));
const childIndex = new Map<number | null, CategoryNode[]>();

for (const node of nodes) {
  const parent = node.parentId ?? null;
  const current = childIndex.get(parent) ?? [];
  current.push(node);
  childIndex.set(parent, current);
}

for (const children of childIndex.values()) {
  children.sort((a, b) => a.name.localeCompare(b.name));
}

export function allCategories() {
  return nodes;
}

export function topCategories() {
  return childIndex.get(null) ?? [];
}

export function categoryById(id: number) {
  return byId.get(id);
}

export function categoryByKey(key: string) {
  return bySlug.get(key);
}

export function childrenOf(id: number) {
  return childIndex.get(id) ?? [];
}

export function ancestorsOf(id: number) {
  const ancestors: CategoryNode[] = [];
  let current = byId.get(id);
  while (current?.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}

export function categoryKey(node: CategoryNode) {
  return `${node.id}-${node.slug}`;
}
