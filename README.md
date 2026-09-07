# Meridian — Accounts-Receivable Payment Reconciliation Prototype

An interactive desktop web prototype designed for B2B accounts-receivable (AR) teams to eliminate **knowledge evaporation** and solve the **blind trust** problem in automated payment reconciliation.

Built strictly with standard web technologies (HTML5, CSS3, JavaScript) with **zero backend and zero external build dependencies**.

---

## The Two Core Problems Solved

| Problem | Existing Experience | The Meridian Solution in this Prototype |
|---|---|---|
| **1. Knowledge Evaporation** | When an AR analyst manually resolves an unrecognised bank payer string (e.g. `ASHFORD PMTS LTD` → `Ashford Holdings Inc`), that knowledge is thrown away. The same payment lands in the unapplied queue again the following month. | **Screen 2 Post-Apply Inline Card:** Appears *after* work is done based on **3rd-time repetition** and verifiable banking evidence (same bank account `****4419`, invoice billing match, remittance syntax match). Provides equal-weight `[ Not now ]` and `[ Remember this payer ]`. |
| **2. Blind Trust in Auto-Matching** | Systems simply show the word "Matched". Analysts don't trust black boxes, so they spend hours manually checking matches — work that is invisible to every metric. | **Screen 3 Reasoning Block:** Surfaces exact evidence (saved payer origin, remittance OCR, line-item exact match, zero variance) and provides a **1-click unapply action** (`[ This is wrong — unapply ]`) to capture negative feedback signals. |

---

## Screen Architecture & Flow

### Screen 1 — Unapplied Cash Queue
- **Context:** The starting point for AR analysts clearing incoming wires and ACH transactions that failed auto-reconciliation.
- **Data Columns:** Payer (from bank), Amount, Received, Reason for unmatched state, Days in queue, and Action.
- **Interactive Trigger:** Clicking row 1 (`ASHFORD PMTS LTD` · `$47,320.00` · 3 days in queue) navigates directly to Screen 2.

### Screen 2 — Resolving an Unrecognised Payer (The Core Interaction)
- **Split Workspace:**
  - **Left Panel (Source of Truth):** Displays inbound bank wire metadata (`WIRE-8845217`, `****4419`), attached remittance chip (`remittance_ashford_mar.pdf` with interactive PDF document extract viewer), and parsed invoices list (`INV-4471` through `INV-4519`).
  - **Right Panel (Analyst's Action):** Autocomplete search for `Ashford Holdings Inc`, 6 pre-ticked open invoices summing to `$47,320.00`, and live zero-variance balancing bar.
- **The Moment That Matters:**
  - Clicking **Apply payment** renders an **inline card** directly in place (not a disruptive modal).
  - Displays the 3rd repetition count and 3 concrete evidence bullet points.
  - Presents equal-weight options: `[ Not now ]` and `[ Remember this payer ]`.

### Screen 3 — Matched Payment with Reasoning (The Trust Half)
- Detail view for auto-matched payment (`ASHFORD PMTS LTD` · `$12,880.00` · *Applied automatically — 2 hours ago*).
- **Why this matched reasoning block:** Visually distinct from the neutral chrome, featuring:
  1. Saved payer rule origin (`confirmed 12 Mar by D. Reyes, used 4 times`), clickable to inspect the alias in Screen 4.
  2. Remittance advice received, listing 3 invoices.
  3. `INV-4533` — $9,200.00 — applied in full.
  4. `INV-4540` — $3,680.00 — applied in full.
  5. `INV-4547` — $1,400.00 — $1,247.00 applied, **$153.00 still open** (partial payment applied; 2 clean invoices closed, remaining $153 balance continues aging without holding the whole $12,880 in unapplied cash).
  6. Total applied: $12,880.00.
- **1-Click Unapply Action:** `[ This is wrong — unapply ]` is the entire error-detection path for the engine. It works in a single click with zero modal friction, logging a reversal signal and immediately returning the transaction to the queue with undo capability.

### Screen 4 — Saved Payers (Alias Management)
- Confirmed 1:1 payer mappings.
- **Consequence-Aware Deletion Modal:** When clicking *Remove* on `ASHFORD PMTS LTD`, it explicitly surfaces the consequence:
  > *"Removing this will stop future automatic matching for `ASHFORD PMTS LTD`."*
  > *"This mapping has applied **14 payments** totalling **$312,400**. Review them?"*
  > Actions: `[ Just remove it ]` and `[ Review the 14 payments ]`.

---

## How to Run

1. Simply open `index.html` in any web browser:
   ```bash
   open index.html
   ```
2. Or serve locally with any static web server:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```
