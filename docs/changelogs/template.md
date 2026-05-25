# Changelog

All notable changes to this project will be documented in this file.

This project follows a structured changelog format and semantic versioning.

---

## [Unreleased]

### Added
- 

### Changed
- 

### Deprecated
- 

### Removed
- 

### Fixed
- 

### Performance
- 

### Security
- 

### Refactored
- 

### Docs
- 

### Chore
- 

### Notes
- Internal notes or upcoming migration warnings


---

## [X.Y.Z] - YYYY-MM-DD

### Added
- New features or capabilities

### Changed
- Changes in existing functionality

### Deprecated
- Features that will be removed in future versions

### Removed
- Features removed in this version

### Fixed
- Bug fixes

### Performance
- Performance improvements

### Security
- Security fixes or improvements

### Refactored
- Code changes that neither fix bugs nor add features

### Docs
- Documentation updates

### Chore
- Maintenance tasks (build system, dependencies, configs)

### Breaking Changes ⚠️
- Describe breaking changes clearly
- Include migration steps if needed

### Migration Guide
- Step-by-step instructions for upgrading (if breaking changes exist)

### Notes
- Any additional context, highlights, or important info


---

## Version Naming Guide

- **MAJOR (X.0.0)** → Breaking changes
- **MINOR (0.X.0)** → New features, backward compatible
- **PATCH (0.0.X)** → Bug fixes, small improvements


---

## Commit Type Mapping (Optional)

Use this if you follow conventional commits:

- `feat:` → Added
- `fix:` → Fixed
- `perf:` → Performance
- `refactor:` → Refactored
- `docs:` → Docs
- `chore:` → Chore
- `seo:` → Changed (or separate SEO section if needed)
- `ui:` / `ui-ux:` → Changed / Fixed (depending on context)


---

## Example

```md
## [1.2.0] - 2026-04-29

### Added
- Multi-author support for blog posts

### Changed
- Improved SEO metadata handling

### Fixed
- Mobile menu responsiveness issue

### Performance
- Reduced bundle size by optimizing imports

### Breaking Changes ⚠️
- Author field structure changed

### Migration Guide
- Replace `author: string` with `author: reference('authors')`

### Notes
- Focused on content architecture improvements