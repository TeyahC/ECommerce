# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Running this project (local dev)

1. Install dependencies:

   npm install

2. Create a `.env` in the project root with your Supabase keys:

   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_KEY=your-anon-or-service-key

3. Start the dev server:

   npm run dev

Open the site at the URL printed by Vite (e.g. http://localhost:5175).

Note: This project stores Supabase keys in a local `.env` for development only. Do not commit sensitive keys to source control.

If you run into issues with routing or authentication, check the browser console for error logs — the login page and header print helpful debug messages.
