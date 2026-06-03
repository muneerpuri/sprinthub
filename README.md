# SprintHub 🚀

SprintHub is a modern, state-of-the-art task management application designed for streamlined workflows, collaborative project tracking, and agile sprint coordination. Built using Next.js, Redux Toolkit (RTK Query), Material-UI (MUI), and Supabase.

---

## Key Features

- **📊 Comprehensive Dashboard**: Get a high-level workload breakdown with statistics cards (total, pending, completed, high-priority tasks) and a dynamic tasks-by-priority chart.
- **📁 Project Workspaces**: Organize initiatives in isolated projects. Manage project details, view members, edit project settings, or archive projects.
- **👥 Collaborative Memberships**: Roles-based access control (`owner`, `editor`, `viewer`) allowing you to invite members, update roles, and manage project collaboration permissions.
- **📋 Kanban Board**: Interact with an agile drag-and-drop board for tasks across columns (`To Do`, `In Progress`, `Done`), configure priority levels, story points, due dates, and add comments.
- **⚡ Keyboard Navigation Shortcuts**:
  - `Shift + D` ➜ Go to Dashboard
  - `Shift + P` ➜ Go to Projects
  - `Shift + T` ➜ Go to Tasks
  - *Smart Focus Protection: Shortcuts automatically ignore triggers when typing inside inputs, textareas, selects, or content-editable elements.*
- **🔒 Secure Authentication**: Guards protected routes using a Supabase session validation layout (`AuthGuard`) and handles sign-in, signup, and callback verifications.

---

## Tech Stack

- **Framework**: Next.js 16 (Turbopack) & React 19
- **State Management & Caching**: Redux Toolkit & RTK Query (decoupled modular slices mapping endpoints dynamically)
- **UI & Styling**: Material-UI (MUI v9) & custom context theme mode provider (Light/Dark themes)
- **Backend / DB**: Supabase (PostgreSQL, authentication, storage, database hooks)
- **Animations**: Framer Motion
- **Testing**: Jest & React Testing Library (RTL)

---

## Getting Started

### 1. Installation

Install project dependencies:

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory and specify your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Development Server

Launch the Next.js development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view SprintHub.

---

## Testing

SprintHub has a robust test environment. Unit and integration test suites cover page renders, redirects, state mutations, drag-and-drop events, and keyboard shortcuts.

### Run Tests

Run the full Jest test suite:

```bash
npm run test
```

### Run Tests in Watch Mode

Keep tests running reactively in the background as you edit code:

```bash
npm run test:watch
```
