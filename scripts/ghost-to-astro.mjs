#!/usr/bin/env node
/**
 * Ghost JSON export → Astro markdown converter
 *
 * Usage:
 *   node scripts/ghost-to-astro.mjs ~/path/to/export.json
 *
 * Requires:
 *   npm install turndown
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

// ---------------------------------------------------------------------------
// Turndown (HTML → Markdown)
// ---------------------------------------------------------------------------
let TurndownService
try {
  const mod = await import("turndown")
  TurndownService = mod.default
} catch {
  console.error(
    "Missing dependency. Run:\n  npm install turndown\nthen retry."
  )
  process.exit(1)
}

const td = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Slugify a string into a safe directory name */
function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/** Format a date as "Mon DD YYYY" to match existing posts (e.g. "Mar 17 2024") */
function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

/** Escape YAML string value (wrap in quotes, escape inner quotes) */
function yamlStr(value) {
  const escaped = String(value).replace(/"/g, '\\"')
  return `"${escaped}"`
}

/** Build YAML frontmatter block */
function buildFrontmatter({ title, summary, date, tags, draft }) {
  const tagLines =
    tags.length > 0
      ? `\ntags:\n${tags.map((t) => `- ${t}`).join("\n")}`
      : `\ntags: []`
  const draftLine = draft ? `\ndraft: true` : ""
  return `---\ntitle: ${yamlStr(title)}\nsummary: ${yamlStr(summary)}\ndate: "${date}"${tagLines}${draftLine}\n---\n`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
const exportPath = args.find((a) => !a.startsWith("--"))
const ghostUrlArg = args.find((a) => a.startsWith("--ghost-url="))
const ghostUrl = ghostUrlArg
  ? ghostUrlArg.replace("--ghost-url=", "").replace(/\/$/, "")
  : "https://byteofprash.com"

if (!exportPath) {
  console.error(
    "Usage: node scripts/ghost-to-astro.mjs <path-to-export.json> [--ghost-url=https://yourblog.com]"
  )
  process.exit(1)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, "../src/content/blog")

let raw
try {
  raw = readFileSync(resolve(exportPath), "utf8")
} catch (err) {
  console.error(`Cannot read file: ${exportPath}\n${err.message}`)
  process.exit(1)
}

const ghostExport = JSON.parse(raw)

// Ghost export wraps everything under db[0].data
const data = ghostExport?.db?.[0]?.data ?? ghostExport?.data
if (!data) {
  console.error("Unexpected Ghost export format — cannot find .db[0].data")
  process.exit(1)
}

const posts = data.posts ?? []
const tagsById = {}
;(data.tags ?? []).forEach((t) => {
  tagsById[t.id] = t.name
})

// Build post-id → tag names map from the junction table
const postTagMap = {}
;(data.posts_tags ?? []).forEach(({ post_id, tag_id }) => {
  if (!postTagMap[post_id]) postTagMap[post_id] = []
  const name = tagsById[tag_id]
  if (name && !name.startsWith("#")) {
    // skip internal Ghost tags (prefixed with #)
    postTagMap[post_id].push(name)
  }
})

let converted = 0
let skipped = 0

for (const post of posts) {
  // Skip pages, only process posts
  if (post.type && post.type !== "post") {
    skipped++
    continue
  }

  const title = post.title ?? "Untitled"
  const slug = post.slug ? toSlug(post.slug) : toSlug(title)
  const isDraft = post.status !== "published"
  const dateSource = post.published_at ?? post.created_at ?? new Date().toISOString()
  const date = formatDate(dateSource)
  const summary =
    post.custom_excerpt ||
    post.excerpt ||
    post.meta_description ||
    ""
  const tags = postTagMap[post.id] ?? []
  // Replace Ghost's placeholder with the real origin (or root-relative if unknown)
  const html = (post.html ?? "").replaceAll("__GHOST_URL__", ghostUrl)

  let markdown = ""
  if (html.trim()) {
    try {
      markdown = td.turndown(html)
    } catch (err) {
      console.warn(`  [warn] HTML→MD conversion failed for "${title}": ${err.message}`)
      markdown = html // fallback: keep raw HTML (still valid in .md)
    }
  }

  const frontmatter = buildFrontmatter({ title, summary, date, tags, draft: isDraft })
  const fileContent = frontmatter + "\n" + markdown + "\n"

  const postDir = resolve(outDir, slug)
  const filePath = resolve(postDir, "index.md")

  if (existsSync(filePath)) {
    console.warn(`  [skip] Already exists, not overwriting: ${filePath}`)
    skipped++
    continue
  }

  mkdirSync(postDir, { recursive: true })
  writeFileSync(filePath, fileContent, "utf8")
  console.log(`  [ok]  ${slug}/index.md  (${isDraft ? "draft" : "published"})`)
  converted++
}

console.log(`\nDone. ${converted} post(s) converted, ${skipped} skipped.`)
console.log(`Output: ${outDir}`)
