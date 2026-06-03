# Legal Pages — Full Audit & Compliance Checklist

## Scope

Audited all 8 pages against these frameworks:
- **EU GDPR** (Regulation 2016/679)
- **EU ePrivacy Directive** (2002/58/EC, "Cookie Law")
- **UK GDPR** (UK Data Protection Act 2018 + retained EU GDPR)
- **US Privacy Laws** (CCPA/CPRA, FTC Act, COPPA)
- **Swiss FADP/nDSG** (entered force Sep 2023)
- **Brazil LGPD** (Lei 13.709/2018)

Sources: ICO (ico.org.uk), EDPB (edpb.europa.eu), GDPR-info.eu, CNIL (cnil.fr), FDPIC (edoeb.admin.ch), ANPD (gov.br/anpd), FTC (ftc.gov).

---

## Page-by-Page Audit Results

### 1. Privacy Policy — [privacy.astro](file:///media/kumar/code/monorepo-astt/core/src/pages/privacy.astro)

| GDPR Art. 13 Requirement | Status | Notes |
|---|---|---|
| Controller identity + contact | ✅ | Section 1 — uses `siteConfig.companyName` and `siteConfig.contact.email` |
| DPO contact details | ⬜ N/A | DPO not required for small-scale non-core processing (Art. 37) |
| Purpose of processing | ✅ | Section 4 |
| Legal basis per purpose | ✅ | Section 6 — consent, legitimate interest, contract, legal obligation |
| Legitimate interests stated | ✅ | "security and abuse prevention" |
| Recipients / categories | ✅ | Section 5 — GTM, GA, AdSense, affiliates, contact form, hosting |
| International transfers + safeguards | ✅ | Section 10 — SCCs, adequacy decisions, DPF referenced |
| Retention periods | ✅ | Section 7 — 90 days logs, cookie expiry, local storage |
| Data subject rights listed | ✅ | Section 8 — all 7 GDPR rights + withdrawal + CCPA |
| Right to lodge complaint with SA | ✅ | Section 8 final paragraph |
| Automated decision-making / profiling | ✅ | Section 4: "We do not use your data for automated profiling" |
| Whether data provision is mandatory | ⚠️ **Missing** | Should state that providing data is not mandatory and consequences of refusal |
| Consent language (GDPR-valid) | ✅ | Fixed — no longer uses "by using this site you agree" |

**Swiss FADP gaps:**

| Requirement | Status | Notes |
|---|---|---|
| List of export countries | ⚠️ **Missing** | FADP requires naming specific countries (not just "United States or other") |
| Swiss representative (if foreign) | ⬜ N/A | Only required for large-scale processing of Swiss residents |

**Brazil LGPD gaps:**

| Requirement | Status | Notes |
|---|---|---|
| Right to anonymization | ⚠️ **Missing** | LGPD specifically grants a right to request anonymization (Art. 18(IV)) |
| Right regarding deceased data | ⬜ N/A | Only relevant if you process data of deceased individuals |

**CCPA/CPRA gaps:**

| Requirement | Status | Notes |
|---|---|---|
| "Do Not Sell or Share" statement | ✅ | Section 8 states "we do not sell personal data" |
| "Do Not Sell" link in footer | ⚠️ **Missing** | CCPA requires a visible link if you "share" data for behavioral ads (AdSense does this) |
| Global Privacy Control (GPC) signal | ⚠️ **Missing** | CPRA requires honoring GPC browser signals |

> [!IMPORTANT]
> **AdSense and behavioral advertising technically constitutes "sharing" under CCPA.** This means if California residents use your site, you may need a "Do Not Sell or Share My Personal Information" link. However, this is only required once you meet CCPA thresholds ($25M revenue, 100k consumers, or 50%+ revenue from selling data). For now this is a **future concern**, not an immediate one.

---

### 2. Terms & Conditions — [terms.astro](file:///media/kumar/code/monorepo-astt/core/src/pages/terms.astro)

| Aspect | Status | Notes |
|---|---|---|
| Description of service | ✅ | Section 1 — generic, works for all tool types |
| Acceptance mechanism | ✅ | Section 2 |
| Age restriction | ✅ | 13 (US) / 16 (EEA) |
| Licence grant + restrictions | ✅ | Section 3 |
| IP ownership | ✅ | Section 4 |
| User content ownership | ✅ | Section 4 — "your content is never transmitted" |
| Prohibited conduct | ✅ | Section 5 — comprehensive |
| Disclaimer of warranties | ✅ | Section 6 — "AS IS", all caps as required |
| Limitation of liability | ✅ | Section 7 — all caps, covers all damage types |
| Indemnification | ✅ | Section 8 |
| Third-party links | ✅ | Section 9 |
| Governing law + disputes | ✅ | Section 11 — includes EU ODR platform link |
| Severability | ✅ | Section 12 |
| Entire agreement | ✅ | Section 13 — references Privacy + Disclaimer |
| **Cross-reference to Affiliate Disclosure** | ⚠️ **Missing** | Entire Agreement (Section 13) should also reference Affiliate Disclosure and DMCA |

**Verdict:** Solid. One minor fix needed in Section 13.

---

### 3. Disclaimer — [disclaimer.astro](file:///media/kumar/code/monorepo-astt/core/src/pages/disclaimer.astro)

| Aspect | Status |
|---|---|
| Informational purposes only | ✅ |
| No professional advice (finance, legal, medical, engineering) | ✅ |
| No warranty of accuracy | ✅ |
| User responsibility + verification | ✅ |
| Limitation of liability | ✅ |
| Third-party content disclaimer | ✅ |
| No professional relationship | ✅ |
| Tool-specific limitations (calculators, files, code, text) | ✅ |

**Verdict:** Complete. No changes needed.

---

### 4. Affiliate Disclosure — [affiliate-disclosure.astro](file:///media/kumar/code/monorepo-astt/core/src/pages/affiliate-disclosure.astro)

| Requirement | Status | Notes |
|---|---|---|
| FTC 16 CFR Part 255 compliance | ✅ | Section 6 |
| Amazon Associates mandatory statement | ✅ | Section 2 — exact required wording |
| Other affiliate programs | ✅ | Section 3 |
| Editorial integrity statement | ✅ | Section 5 |
| EU Unfair Commercial Practices Directive | ✅ | Section 6 |
| User choice / alternative | ✅ | Section 7 |

**Verdict:** Complete. No changes needed.

---

### 5. DMCA — [dmca.astro](file:///media/kumar/code/monorepo-astt/core/src/pages/dmca.astro)

| 17 U.S.C. § 512 Requirement | Status |
|---|---|
| Designated agent contact | ✅ |
| Takedown notice requirements (6 elements) | ✅ |
| Counter-notice procedure | ✅ |
| Repeat infringer policy | ✅ |
| § 512(f) misuse warning | ✅ |
| Copyright ownership of own content | ✅ |

**Verdict:** Complete. No changes needed.

---

### 6. About Page — [about.astro](file:///media/kumar/code/monorepo-astt/core/src/pages/about.astro)

| Aspect | Status |
|---|---|
| Generic / multi-niche language | ✅ (just fixed) |
| Honest about ad-supported model | ✅ (just fixed) |
| Accurate privacy claim | ✅ — "privacy by design" not "absolute privacy" |

**Verdict:** Complete after today's fix.

---

### 7. Contact Page & 8. Support Page

These are functional pages (forms), not legal documents. No compliance issues — they operate correctly with the privacy policy's Section 3.3 and Section 5 (Web3Forms disclosure).

---

## The Cookie Consent Banner Question — Honest Answer

### Can you skip it?

**Short answer: It depends on where your users are.**

| Jurisdiction | Banner required? | Why |
|---|---|---|
| **EU (GDPR + ePrivacy)** | **Yes, mandatory** | ePrivacy Directive Art. 5(3): non-essential cookies require prior informed consent. No exceptions for AdSense/GA cookies. |
| **UK (UK GDPR + PECR)** | **Yes, mandatory** | ICO explicitly requires opt-in consent for analytics and advertising cookies. |
| **Germany** | **Strictest in EU** | 2025 Hanover court ruling: GTM itself requires consent before loading. |
| **France** | **Yes** | CNIL has fined Google €150M and Facebook €60M for non-compliant cookie banners. |
| **US (CCPA/CPRA)** | **Not a banner, but opt-out required** | No prior consent needed, but you must honor opt-out and GPC signals. |
| **Switzerland (FADP)** | **Generally opt-out, not opt-in** | Less strict than EU. Banner not legally required but recommended. |
| **Brazil (LGPD)** | **Recommended** | ANPD has not formally mandated banners but LGPD's consent requirements imply one. |

### Can you have "Accept Only" (no Reject button)?

**No. This is explicitly illegal in the EU since 2022.**

The CNIL (France), EDPB, and multiple EU courts have ruled:
- It must be **as easy to reject** cookies as it is to accept them
- **"Accept only"** = dark pattern = invalid consent = liable for fines
- Both buttons must have **equal visual prominence** (same size, same styling)
- You cannot hide "Reject" behind a "Manage preferences" submenu

### What do other tools websites actually do?

| Site | Has banner? | What it looks like |
|---|---|---|
| **Canva** | ✅ Yes | Full CMP with Accept All / Reject All / Manage |
| **iLovePDF** | ✅ Yes | Accept / Reject / Settings |
| **TinyPNG** | ✅ Yes | GDPR-compliant banner |
| **Squoosh (Google)** | ❌ No | Zero cookies, zero analytics, no third-party scripts at all |
| **Remove.bg** | ✅ Yes | Full CMP banner |

**Squoosh doesn't need a banner because it uses zero third-party scripts.** The moment you add Google Analytics, GTM, or AdSense — you need one.

### Are policy pages enough without a banner?

**No.** The ePrivacy Directive is crystal clear: consent must be obtained **before** setting non-essential cookies. A privacy policy is a transparency document — it tells users what you do. But it is not a consent mechanism. The banner **is** the consent mechanism.

> [!CAUTION]
> **Without a cookie consent banner, your privacy policy's claim "we rely on your explicit consent" is technically a false statement.** You'd be saying you get consent but not actually collecting it. This is worse than having no privacy policy at all — it's an explicit lie to a regulator.

### Practical recommendation

**Don't build your own.** Use a third-party CMP:

| Tool | Cost | Notes |
|---|---|---|
| **CookieYes** | Free tier (100 pages) | Easy to integrate, auto-scans cookies |
| **Cookiebot (Usercentrics)** | Free (<100 pages) | IAB TCF certified, used by many EU sites |
| **Klaro** | Free (open source) | Self-hosted, lightweight, developer-friendly |
| **Osano** | Free tier | Simple, good for small sites |

All of these:
- Block GTM/GA/AdSense scripts until consent is given
- Show Accept All + Reject All buttons with equal prominence
- Save consent records (GDPR requires proof of consent)
- Auto-detect user location to show banner only where legally required

---

## Privacy Policy — Changes Needed

Two small additions required based on this audit:

### 1. Add "data provision is not mandatory" statement (GDPR Art. 13(2)(e))

Add to Section 3 or Section 4:
> Providing personal data is not a statutory or contractual requirement. You are not obliged to provide any personal data. However, if you choose not to provide certain information (such as your email address on the contact form), we may not be able to respond to your enquiry.

### 2. Update Section 13 (Entire Agreement) in Terms to cross-reference all legal docs

Current Terms Section 13 references only Privacy Policy and Disclaimer. Should also include Affiliate Disclosure and DMCA.

---

## Post-Launch TODO Checklist

### 🔴 Must Do Before Launch (if EU/UK traffic expected)

- [ ] **Implement cookie consent banner (CMP)** — Use CookieYes, Cookiebot, or Klaro. Must have Accept All + Reject All buttons with equal prominence. Must block GTM/GA/AdSense until consent given.
- [ ] **Add "data provision not mandatory" to Privacy Policy** — GDPR Art. 13(2)(e) requirement
- [ ] **Update Terms Section 13** (Entire Agreement) — Add cross-references to Affiliate Disclosure and DMCA Policy

### 🟡 Should Do Before Scaling (as you add more sites/countries)

- [ ] **Add "Do Not Sell or Share" link in footer** — Required by CCPA if you meet revenue/data thresholds AND use behavioral advertising (AdSense qualifies as "sharing")
- [ ] **Honor GPC (Global Privacy Control) signals** — CPRA mandate for California residents
- [ ] **List specific data export countries in Privacy Policy** — Swiss FADP requirement (e.g., "United States" explicitly, not "other countries")
- [ ] **Add right to anonymization to Privacy Policy Section 8** — Brazil LGPD Art. 18(IV) grants this right specifically
- [ ] **Create in-page affiliate disclosure component** — Short disclosure near affiliate links on every page that links to the full `/affiliate-disclosure` page. Example text: *"This page contains affiliate links. We may earn a commission at no extra cost to you. [Full disclosure](/affiliate-disclosure)"*

### 🟢 Nice to Have / Future

- [ ] **Add a "Manage Cookie Preferences" link in footer** — Lets users change consent at any time (GDPR requires withdrawal to be as easy as giving consent)
- [ ] **Consider privacy-first analytics (Plausible/Umami)** — These don't require cookie consent banners at all because they don't use cookies. Would eliminate the banner requirement entirely if you drop GA.
- [ ] **Add cookie table to Privacy Policy** — List each cookie by name, purpose, type (session/persistent), and expiry. Many CMPs auto-generate this.
- [ ] **Appoint Swiss representative** — Only if you start processing Swiss residents' data at large scale (Art. 14 FADP)
- [ ] **Add ANPD contact procedure** — Only if you start specifically targeting Brazilian users
- [ ] **Create an "Advertise With Us" / "Sponsor" page** — You mentioned the reference site has one. This is a business page, not a legal requirement, but useful for monetization. Low priority.

----


## What You CAN and CANNOT Do — Based on Your Legal Pages

### ✅ CAN DO

**Tools & Content**
- Build tools in any category: finance, PDF, image, SVG, dev, text, QR, study, gaming, beauty — anything
- Process user files, text, images, code entirely in the browser — your privacy policy explicitly backs this as a "technical guarantee"
- Show tool results without disclaimers on every page — your Disclaimer page covers all output types globally
- Publish blog articles, guides, tutorials on any topic relevant to your tools
- Keep all tools 100% free forever

**Advertising**
- Run Google AdSense on any or all sites
- Use multiple ad networks simultaneously
- Display display ads, in-feed ads, auto ads
- Use Google Tag Manager to manage all ad and analytics scripts
- Use Google Analytics for traffic data

**Affiliate Links**
- Add Amazon affiliate links anywhere on the site — your Affiliate Disclosure covers all Amazon international stores (.com, .co.uk, .in, .ca, etc.)
- Add affiliate links from any other platform (ShareASale, CJ, Flipkart, etc.) — Section 3 of the disclosure covers "other programmes"
- You don't need to disclose affiliate links individually in the legal pages — just on the page where they appear (that's the in-page component which is in your TODO)

**Geography**
- Serve users from USA, UK, EU (Germany, Spain, Netherlands, France, etc.), India, Brazil, Switzerland — all covered
- The privacy policy properly addresses all these jurisdictions

**Copyright Protection**
- Your DMCA page actively protects your content — anyone copying your tool code, blog articles, or UI without permission can receive a takedown
- You can file DMCA against sites that scrape/copy your content

**Future Sites**
- All legal pages are niche-agnostic — you can add dev tools, img tools, pdf tools, gaming, study, QR, beauty sites without changing a single legal page. Everything is generic by design.

---

### ❌ CANNOT DO (without updating legal pages first)

**Must update Privacy Policy before doing these:**
- **Add a new analytics tool** (e.g., Microsoft Clarity, Hotjar, Mixpanel) — not disclosed in Section 5. Must add it before enabling.
- **Add a new ad network** beyond AdSense (e.g., Mediavine, Ezoic, Carbon Ads) — Section 5 says "Google AdSense and may use other ad networks" so you're technically covered broadly, but a named disclosure is better practice when you commit to a specific network.
- **Start collecting email addresses** for a newsletter/mailing list — not described anywhere. Would need a new section in the Privacy Policy and a separate consent mechanism.
- **Add user accounts/logins** — not covered. Would need significant additions: account data, password handling, account deletion rights, etc.
- **Add user-generated content** (comments, reviews, ratings) — not covered in either DMCA or Terms. DMCA counter-notice only covers content *we* host; user submissions need additional Terms clauses.

**Cannot do without adding a Cookie Consent Banner:**
- **Enable Google Analytics for EU/UK users** — your Privacy Policy now correctly says consent is required for analytics cookies. Without the banner actually collecting that consent, running GA for EEA/UK users is a legal contradiction. For US/India-only traffic it's fine right now.
- **Enable AdSense for EU/UK users** — same reason. AdSense behavioural cookies need prior consent in EEA/UK.

**Cannot do, period:**
- **Sell user data** — your Privacy Policy explicitly states "we do not sell, rent, or trade your personal data." If you ever do, the policy would be fraudulent.
- **Use social media tracking pixels** (Meta Pixel, Twitter/X Pixel) — your policy explicitly says "we do not use social media tracking pixels." If you add one, you must update the policy first.
- **Use tool outputs to build user profiles** — "We do not use your data for automated profiling." Tools run client-side, so this is also a technical constraint, not just a policy one.
- **Target users under 13** (or under 16 in EEA) — Section 9 bars this.
