# Minerva Frontend Architecture & Design System

This document is the absolute source of truth for the Minerva React application. It outlines our strict Apple-like minimalism, exact grid spacing, and role delegations.

## 1. Tech Stack
* **Core Framework:** React (via Vite)
* **Styling Engine:** Tailwind CSS
* **UI Components:** shadcn/ui + Radix UI
* **Form State & Validation:** React Hook Form + Zod

---

## 2. The Spacing System (8-Point Grid)
We strictly adhere to an 8px base grid. No arbitrary margin or padding values are allowed. Everything must be a multiple of 8.

| Element / Context | Pixel Value | Tailwind Class | Usage Scenario |
| :--- | :--- | :--- | :--- |
| **Micro-Spacing** | 4px | `p-1`, `m-1` | Between a small element and its text label. |
| **Component Internal** | 8px | `p-2`, `m-2` | Padding inside small buttons or input fields. |
| **Standard Spacing** | 16px | `p-4`, `m-4` | Padding inside standard cards, distance between form fields. |
| **Section Gap** | 24px | `gap-6`, `p-6` | Distance between major sections inside a single view. |
| **Page Margin** | 32px | `p-8`, `m-8` | Outer padding of the main container/dashboard layout. |
| **Epic Separation** | 64px | `p-16`, `mt-16`| Distance between completely independent blocks of content. |

---

## 3. Typography & Color Matrix (Dark Theme)
Our UI relies on white space and typography rather than borders. 

| Token | Value / Setup | Application |
| :--- | :--- | :--- |
| **Primary Accent** | `#512988` | Main action buttons, active states, focus rings, primary links. |
| **Background** | `#000000` | Global page background (Completely dark). |
| **Surface** | `#121212` | Cards, modals, and input backgrounds. |
| **Text Primary** | `#FFFFFF` | Main headings and body text. |
| **Text Muted** | `#A1A1AA` | Helper texts, placeholders, and disabled states. |
| **Border Radius** | `12px` (`rounded-xl`)| Universal radius for all cards and primary buttons to ensure a soft feel. |

---

## 4. The "Max 10" Rule & Minimalism
* **Component Limit:** No single screen or view may contain more than 10 interactive elements.
* **Forms:** If a form requires more than 3-4 inputs, it must be divided into a multi-step wizard.
* **Visual Dividers:** Do not use `<hr />` or border lines to separate content. Use the **24px** or **32px** spacing rules defined above.

---

## 5. Micro-Interactions (Delightful Feedback)
All interactive elements must feel tactile and responsive without being slow.

| Interaction | Behavior Specification | Implementation Reference |
| :--- | :--- | :--- |
| **Button Hover** | Very subtle opacity drop or slight shadow increase. | `hover:opacity-90 transition-opacity duration-200` |
| **Button Click** | Elastic scale-down effect (feels like pressing physical hardware). | `active:scale-[0.98] transition-transform duration-150` |
| **Input Focus** | Smooth appearance of a `#512988` focus ring without moving layout. | `focus:ring-2 focus:ring-[#512988] focus:ring-offset-2 focus:ring-offset-black focus:outline-none` |

---

## 6. Workflow Delegation

### UI/UX Designer:
* Build Figma prototypes adhering strictly to the **8-Point Grid** matrix above.
* Ensure no view breaks the **Max 10** interactive component rule.
* Use `#512988` exclusively for the most critical action on the screen.

### Frontend Developer (React):
* Initialize all components using `shadcn/ui`.
* Map the Design System matrix directly into `tailwind.config.js` and `globals.css`.
* Implement the exact transition classes for micro-interactions.