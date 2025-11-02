# Phenohunt Pages — LLM Reference Guide

## 📘 Purpose
This repository hosts static, App-Store-compliant **public web pages** for the Phenohunt app by **Soco Supply, LLC**.

All pages are HTML-only (no JS build step) and deployed automatically to **Vercel** at:

- **https://app.phenohunt.com** → Support + Marketing (homepage)
- **/support** → same as homepage
- **/privacy** → Privacy Policy
- **/terms** → Terms of Service

These pages satisfy Apple's *Support URL* and *Marketing URL* requirements for App Store Connect.

---

## 🧩 Repository Structure

```
phenohunt-pages/
├─ support.html     → Combined Support + Marketing homepage
├─ privacy.html     → Privacy Policy
├─ terms.html       → Terms of Service
├─ vercel.json      → Routes `/`, `/support`, `/privacy`, `/terms`
└─ README.md        → (this file)
```

All pages share identical styling:  
`--accent: #2b7a78` (teal), responsive, accessible, and optimized for mobile.

---

## 🧠 Update Logic (for LLMs)

When modifying or generating new content:

1. **Preserve structure**
   - Maintain header/footer consistency.
   - Keep inline `<style>` blocks for self-containment.
   - Follow semantic HTML hierarchy (`h1 → h2 → h3`).

2. **Compliance priorities**
   - Support section must include:
     - Contact email: `support@phenohunt.com`
     - Business hours: Mon–Fri 9 AM–5 PM PT
     - Response window: ≤ 2 business days
   - Privacy and Terms links must remain visible on every page.
   - No login gating, no JavaScript dependencies.

3. **When adding pages**
   - Create a new `.html` file.
   - Update `vercel.json` with a route entry:
     ```json
     { "src": "^/newpage$", "dest": "/newpage.html" }
     ```
   - Commit and push → Vercel redeploys automatically.

4. **Image / media inclusion**
   - Use inline base64 (`data:image/png;base64,`) for portability.
   - Limit total HTML size to < 3 MB for fast load times.

5. **When generating updates**
   - Use formal, consistent writing (matching tone of Privacy Policy & Terms).
   - Include effective date updates at the top of the document.

---

## 🚀 Deployment

Vercel auto-builds on every commit to `main`.

To trigger a redeploy:
```bash
git add .
git commit -m "Update <page> content"
git push
```

No manual build or npm step required.

---

## 🧰 Context for App Review

- **App Name:** Phenohunt  
- **Company:** Soco Supply, LLC  
- **Jurisdiction:** California (venue Sonoma County)  
- **Support URL (App Store):** https://app.phenohunt.com  
- **Marketing URL (App Store):** https://app.phenohunt.com  
- **Privacy Contact:** privacy@phenohunt.com  
- **Support Contact:** support@phenohunt.com

---

## ✅ Revision History

| Date | Description |
|------|--------------|
| 2025-10-27 | Created Privacy Policy and Terms of Service pages |
| 2025-11-02 | Added Support + Marketing homepage; routed `/` and `/support` |
| 2025-11-02 | Added this LLM-optimized README for future AI reference |

---

## 💬 Notes for Future AI Assistants

When updating or refactoring:
- **Never** remove contact info, legal disclaimers, or compliance-critical sections.
- Use the existing CSS theme for continuity.
- Avoid adding client-side scripts unless explicitly requested.
- Always verify URLs (Privacy, Terms, Support) remain live after deployment.
- Confirm Vercel auto-redeploy succeeded before ending session.

---

_End of file_
