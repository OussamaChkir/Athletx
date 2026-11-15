#!/usr/bin/env node
/**
 * i18n sanity check:
 *  1. en / fr / es have exactly the same keys in every namespace (plural suffixes _one/_other/_many count as one key)
 *  2. every static t("key") / t("ns:key") used in src/ exists in English
 *  3. no empty translations
 * Run: node scripts/check-i18n.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "src");
const LANGS = ["en", "fr", "es"];
const localesDir = path.join(root, "i18n", "locales");
const namespaces = fs.readdirSync(path.join(localesDir, "en")).map((f) => f.replace(".json", ""));

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]],
  );
const baseKey = (k) => k.replace(/_(zero|one|two|few|many|other)$/, "");

const data = {};
let errors = 0;
const fail = (msg) => {
  errors++;
  console.error("✗", msg);
};

for (const lang of LANGS) {
  data[lang] = {};
  for (const ns of namespaces) {
    const file = path.join(localesDir, lang, `${ns}.json`);
    if (!fs.existsSync(file)) {
      fail(`missing file ${lang}/${ns}.json`);
      continue;
    }
    data[lang][ns] = new Map(flatten(JSON.parse(fs.readFileSync(file, "utf8"))));
    for (const [k, v] of data[lang][ns]) if (typeof v !== "string" || v.trim() === "") fail(`${lang}/${ns}: empty value for "${k}"`);
  }
}

for (const ns of namespaces) {
  const en = new Set([...data.en[ns].keys()].map(baseKey));
  for (const lang of LANGS.slice(1)) {
    const other = new Set([...data[lang][ns].keys()].map(baseKey));
    for (const k of en) if (!other.has(k)) fail(`${lang}/${ns}: missing "${k}"`);
    for (const k of other) if (!en.has(k)) fail(`${lang}/${ns}: extra "${k}" (not in English)`);
  }
}

// Static usage check
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(tsx?|ts)$/.test(e.name) ? [p] : [];
  });
const hasKey = (ns, key) => {
  const map = data.en[ns];
  if (!map) return false;
  if (map.has(key)) return true;
  return ["zero", "one", "two", "few", "many", "other"].some((s) => map.has(`${key}_${s}`));
};
for (const file of walk(root)) {
  if (file.includes(`${path.sep}i18n${path.sep}`)) continue;
  const src = fs.readFileSync(file, "utf8");
  const defaultNs = [...src.matchAll(/useTranslation\(\s*\[?\s*["'](\w+)["']/g)].map((m) => m[1]);
  const rel = path.relative(path.join(__dirname, ".."), file);
  for (const m of src.matchAll(/\bt\(\s*(["'])([^"'$`]+)\1/g)) {
    let key = m[2];
    let nss = defaultNs.length ? defaultNs : ["common"];
    const colon = key.indexOf(":");
    if (colon > 0) {
      nss = [key.slice(0, colon)];
      key = key.slice(colon + 1);
    }
    if (!nss.some((ns) => hasKey(ns, key))) fail(`${rel}: key "${m[2]}" not found in English (${nss.join(", ")})`);
  }
}

if (errors) {
  console.error(`\n${errors} problem(s)`);
  process.exit(1);
}
console.log("i18n OK:", namespaces.map((ns) => `${ns}(${data.en[ns].size})`).join(" "));
