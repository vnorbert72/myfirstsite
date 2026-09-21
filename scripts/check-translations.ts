/**
 * Translation completeness checker.
 *
 * Compares the flattened key sets of hu.json and es.json against en.json
 * (the source of truth) and fails with a list of missing or extra keys.
 * Run via:
 *
 *   npx tsx scripts/check-translations.ts
 *
 * Exits with code 1 if any locale is out of sync with en.json.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = resolve(__dirname, "../client/src/i18n/locales");

const SOURCE_LANG = "en";
const TARGET_LANGS = ["hu", "es"];

function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return [prefix];
  }
  const entries = Object.entries(obj as Record<string, unknown>);
  if (entries.length === 0) return [prefix];
  return entries.flatMap(([key, value]) =>
    flattenKeys(value, prefix ? `${prefix}.${key}` : key),
  );
}

function loadLocale(lang: string): Set<string> {
  const path = resolve(LOCALES_DIR, `${lang}.json`);
  const parsed = JSON.parse(readFileSync(path, "utf-8"));
  return new Set(flattenKeys(parsed));
}

const sourceKeys = loadLocale(SOURCE_LANG);
let failed = false;

for (const lang of TARGET_LANGS) {
  const targetKeys = loadLocale(lang);
  const missing = [...sourceKeys].filter((k) => !targetKeys.has(k)).sort();
  const extra = [...targetKeys].filter((k) => !sourceKeys.has(k)).sort();

  if (missing.length === 0 && extra.length === 0) {
    console.log(`✓ ${lang}.json is in sync with ${SOURCE_LANG}.json (${targetKeys.size} keys)`);
    continue;
  }

  failed = true;
  if (missing.length > 0) {
    console.error(`✗ ${lang}.json is missing ${missing.length} key(s) present in ${SOURCE_LANG}.json:`);
    for (const key of missing) console.error(`    - ${key}`);
  }
  if (extra.length > 0) {
    console.error(`✗ ${lang}.json has ${extra.length} key(s) not present in ${SOURCE_LANG}.json:`);
    for (const key of extra) console.error(`    - ${key}`);
  }
}

// ---------------------------------------------------------------------------
// Key-usage check: every t('...') key referenced in client/src must exist in
// en.json. Dynamic keys like t(`aboutPage.${key}`) are checked by prefix —
// at least one en.json key must start with the literal prefix.
// ---------------------------------------------------------------------------

const SRC_DIR = resolve(__dirname, "../client/src");
const SKIP_DIRS = new Set(["ui", "i18n"]);

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      files.push(...collectSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

interface Usage {
  file: string;
  line: number;
  key: string;
  dynamic: boolean;
}

const STATIC_RE = /\bt\(\s*(["'])((?:(?!\1).)+)\1/g;
const TEMPLATE_RE = /\bt\(\s*`([^`]*)`/g;

function extractUsages(file: string): Usage[] {
  const usages: Usage[] = [];
  const text = readFileSync(file, "utf-8");
  const lineAt = (index: number) => text.slice(0, index).split("\n").length;
  const rel = relative(resolve(__dirname, ".."), file);

  for (const m of text.matchAll(STATIC_RE)) {
    usages.push({ file: rel, line: lineAt(m.index!), key: m[2], dynamic: false });
  }
  for (const m of text.matchAll(TEMPLATE_RE)) {
    const template = m[1];
    const exprStart = template.indexOf("${");
    if (exprStart === -1) {
      usages.push({ file: rel, line: lineAt(m.index!), key: template, dynamic: false });
    } else {
      const prefix = template.slice(0, exprStart);
      usages.push({ file: rel, line: lineAt(m.index!), key: prefix, dynamic: true });
    }
  }
  return usages;
}

const usages = collectSourceFiles(SRC_DIR).flatMap(extractUsages);
const sourceKeyList = [...sourceKeys];
const unknown: Usage[] = [];

for (const usage of usages) {
  if (usage.dynamic) {
    if (!sourceKeyList.some((k) => k.startsWith(usage.key))) unknown.push(usage);
  } else if (!sourceKeys.has(usage.key)) {
    unknown.push(usage);
  }
}

if (unknown.length > 0) {
  failed = true;
  console.error(`✗ ${unknown.length} translation key usage(s) in client/src not found in ${SOURCE_LANG}.json:`);
  for (const u of unknown) {
    const label = u.dynamic ? `${u.key}\${...} (dynamic prefix)` : u.key;
    console.error(`    - ${label}  (${u.file}:${u.line})`);
  }
} else {
  const staticCount = usages.filter((u) => !u.dynamic).length;
  const dynamicCount = usages.length - staticCount;
  console.log(
    `✓ all ${staticCount} static and ${dynamicCount} dynamic t() key usages resolve against ${SOURCE_LANG}.json`,
  );
}

if (failed) {
  console.error("\nTranslation check failed. Add the missing keys so visitors never see untranslated English text.");
  process.exit(1);
}

console.log("All locales are in sync.");
