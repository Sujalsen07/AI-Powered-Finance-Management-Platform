This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.






# Challenges
- The add-account drawer originally split inputs across multiple `<form>` tags, so the “Create Account” submit button wasn’t tied to your `react-hook-form` handler. That meant clicking the button never called `createAccountFn`, so no toast and no DB writes. I wrapped the entire drawer content in one `<form onSubmit={handleSubmit(onSubmit)}>`, wired the select/switch to the form state, and gated the success toast on `newAccount?.success`. Now the drawer submits properly, shows a spinner on submit, resets/ closes on success, and emits a Sonner toast.

- The server action `createAccount` was returning `undefined` after creating the Prisma record (because it tried to `return serializedAccount = ...` before actually defining that variable or revalidating). I added a `serializeAccount` helper that converts Prisma’s Decimal to a plain number, revalidate the dashboard path, and return `{ success: true, data: serializedAccount }`. That gives the client a clear success flag and makes dashboard data refresh so Supabase gets the new row immediately.
