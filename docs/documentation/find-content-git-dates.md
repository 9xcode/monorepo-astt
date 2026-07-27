# Find content publish and update date from git history


Two separate commands. Run both from the repo root:

**Published date (first commit = when file was first added):**
```bash
for f in sites/onlineqrcodescanner-com/src/content/tools/*/index.md sites/onlineqrcodescanner-com/src/content/blog/*/index.md; do
  slug=$(echo "$f" | sed 's|.*content/\([^/]*\)/\([^/]*\)/index.md|\1/\2|')
  date=$(git log --follow --diff-filter=A --format="%aI" -- "$f" | tail -1)
  echo "$slug | $date"
done
```

**Updated date (last commit = most recent change):**
```bash
for f in sites/onlineqrcodescanner-com/src/content/tools/*/index.md sites/onlineqrcodescanner-com/src/content/blog/*/index.md; do
  slug=$(echo "$f" | sed 's|.*content/\([^/]*\)/\([^/]*\)/index.md|\1/\2|')
  date=$(git log --follow --diff-filter=ACRM --format="%aI" -- "$f" | head -1)
  echo "$slug | $date"
done
```

**Key difference:**
- Published → `--diff-filter=A` + `tail -1` → oldest commit that *added* the file
- Updated → `--diff-filter=ACRM` + `head -1` → newest commit that touched it

Run both, paste the output here and I'll add the `publishedAt`/`updatedAt` frontmatter to each file.