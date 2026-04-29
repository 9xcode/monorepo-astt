You are already off to a great start by thinking about `npm run build` and `npx astro check`. Those are the core foundations for ensuring an Astro app is ready for production.

With a stack heavily reliant on TypeScript and Svelte 5's new Runes system, you want to make sure your types and components are bulletproof before deploying. Here is a comprehensive checklist of commands to run and exactly what they check.

### 1. The Pre-Flight Commands

Run these sequentially. If any of them throw an error, stop and fix it before moving on.

* **`npx astro check`**
* **What it does:** This checks your `.astro` files for TypeScript errors, syntax issues, and invalid component props.
* **Why it matters:** Astro files don't inherently throw TypeScript errors in the editor the same way strict `.ts` files do. This ensures your Astro layouts and pages are solid.


* **`npx svelte-check`**
* **What it does:** Strictly checks your Svelte components (`.svelte` files) for TypeScript errors, unused CSS, and accessibility (a11y) warnings.
* **Why it matters:** Astro check doesn't deeply validate Svelte-specific syntax. Since you are using Svelte 5 with Shadcn-Svelte, you want to ensure your Runes (`$state`, `$derived`, etc.) and props are typed correctly.


* **`npx tsc --noEmit`**
* **What it does:** Runs the standard TypeScript compiler across your entire project just to check for errors, without actually outputting any compiled JavaScript files.
* **Why it matters:** This catches errors in your standard utility files, API endpoints, or shared Svelte state files (like `.ts` or `.js` files) that the Astro or Svelte-specific checkers might miss.



### 2. The Build and Test Commands

Once your code passes the static checks above, it is time to build and verify the final output.

* **`npm run build`**
* **What it does:** Compiles your Astro, Svelte, and Tailwind code into highly optimized, minified static HTML/CSS/JS (or server-side code if you are using an SSR adapter).
* **What to look for:** Ensure it completes without throwing any final bundling errors. It will also output a list of your generated routes. Check this list to make sure all expected pages were generated successfully.


* **`npm run preview`**
* **What it does:** Spins up a local web server to serve the *exact* files that `npm run build` just created in your `dist` folder.
* **Why it matters:** **This is the most important step.** Do not trust the development server (`npm run dev`) for production testing. The dev server skips certain optimizations for speed. Testing your site in `preview` mode ensures that hydration, Svelte interactions, and Tailwind utility classes behave exactly as they will on your live server.



### 3. Optional but Recommended Checks

If you haven't set these up yet, they are fantastic for maintaining code quality in a modern stack:

* **Linting (`npm run lint`):** If you use ESLint, this will catch logical bugs or code-style violations that TypeScript ignores.
* **Formatting (`npm run format`):** If you use Prettier, running this (usually `npx prettier --check .`) ensures all your files are formatted uniformly, which is great to do before committing your code.

### 4. The All-In-One Validation Script

To make your life easier, you can combine all these checks into a single script in your `package.json`. Add this to your `"scripts"` block:

```json
"validate": "astro check && svelte-check && tsc --noEmit && npm run build"
```

Now, instead of running 4 different commands, you just type:

`npm run validate`

This checks Astro files, Svelte files, TypeScript files, and then builds the project if all checks pass. It's the ultimate pre-deployment sanity check.


### Extra
```
npm run astro -- info
# or using npx
npx astro info
```