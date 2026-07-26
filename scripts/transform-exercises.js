/**
 * Transforms exercises.json:
 *  - Removes the `videos` array
 *  - Adds a `gif` field using the menspower.nl URL pattern
 *
 * GIF slug = title lowercased, spaces → hyphens, special chars stripped
 * e.g. "Barbell Curl" → "https://menspower.nl/wp-content/uploads/2018/02/barbell-curl.gif"
 */
const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "../src/data/exercises.json");

const exercises = JSON.parse(fs.readFileSync(INPUT, "utf8"));

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const transformed = exercises.map(({ videos, ...rest }) => ({
  ...rest,
  gif: `https://menspower.nl/wp-content/uploads/2018/02/${slugify(rest.title)}.gif`,
}));

fs.writeFileSync(INPUT, JSON.stringify(transformed, null, 2));
console.log(`✅ Transformed ${transformed.length} exercises.`);
console.log("Sample:", transformed[0]);
