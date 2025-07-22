# AI Development Rules

This document outlines the rules and conventions for AI-driven development of this application. Following these rules ensures consistency, maintainability, and adherence to the chosen technology stack.

## Technology Stack

The application is built using the following technologies:

-   **Framework**: React 18+ with Vite as the build tool.
-   **Language**: TypeScript for robust, type-safe code.
-   **Routing**: `react-router-dom` for all client-side navigation.
-   **Styling**: Tailwind CSS for a utility-first styling approach.
-   **UI Components**: `shadcn/ui` is the designated component library.
-   **Icons**: `lucide-react` provides the icon set for the entire application.
-   **State Management**: React Context API and built-in hooks (`useState`, `useReducer`).
-   **Project Structure**: Code is organized into `src/pages`, `src/components`, and `src/contexts` for clarity.

## Library Usage Guidelines

To maintain consistency, please adhere to the following rules for using specific libraries:

### UI and Styling

-   **Component Library**: **ALWAYS** use components from `shadcn/ui` for standard UI elements (e.g., `Button`, `Card`, `Input`, `Dialog`). Do not create custom components for elements that already exist in the library.
-   **Styling**: **ONLY** use Tailwind CSS utility classes for styling. Avoid writing custom CSS files or using inline `style` attributes unless absolutely necessary for dynamic properties that cannot be handled by Tailwind.
-   **Icons**: **EXCLUSIVELY** use icons from the `lucide-react` package. Do not use any other icon library or SVGs directly.

### Routing

-   **Router**: All client-side routes **MUST** be managed using `react-router-dom`.
-   **Route Definitions**: All primary routes **MUST** be defined in `src/App.tsx` to provide a centralized routing configuration.

### State Management

-   **Local State**: Use `useState` for simple component-level state.
-   **Complex Local State**: Use `useReducer` for more complex state logic within a single component.
-   **Global State**: Use the React Context API for application-wide state. Follow the pattern established in `src/contexts/AuthContext.tsx`. Avoid introducing other state management libraries like Redux or Zustand unless explicitly requested and approved.

### Forms

-   **Simple Forms**: Manage state using `useState` for forms with a few input fields and simple validation.
-   **Complex Forms**: If complex validation or state management is required, `react-hook-form` combined with `zod` for schema validation is the preferred solution. These packages must be added as dependencies before use.

### Data Fetching

-   **API Calls**: Use the native `fetch` API for simple data fetching. If more advanced features like automatic caching, re-fetching, and server state management are needed, use `react-query` (TanStack Query). This package must be added as a dependency before use.

---

# Backend System Overview: Laravel Implementation Guide

[Struktur proyek backend Laravel dan detail implementasi ada di sini.]

**Untuk panduan instalasi dan konfigurasi sistem lengkap (termasuk deployment ke Hostinger/aaPanel), silakan merujuk ke file `DEPLOYMENT_GUIDE.md`.**

**Untuk panduan konfigurasi API (MikroTik, Fonte WhatsApp, Google Integration), silakan merujuk ke file `API_CONFIGURATION_GUIDE.md`.**