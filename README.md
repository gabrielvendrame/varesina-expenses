This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Apple Shortcut Transactions API

You can post transactions from Apple Shortcuts without Clerk session auth.

### Endpoint

- Method: POST
- URL: /api/shortcut/transactions
- Auth: Bearer token in Authorization header

### Required env vars

- SHORTCUT_API_TOKEN=your_long_random_token
- SHORTCUT_USER_ID=the_clerk_user_id_that_owns_the_transactions

### Request body

```json
{
	"amount": 12.5,
	"description": "Coffee",
	"date": "2026-05-17T10:30:00.000Z",
	"category": "Food",
	"type": "expense"
}
```

Notes:

- date is optional. If missing, the server uses current date/time.
- type defaults to expense.
- category must exist for SHORTCUT_USER_ID.

### Example request

```bash
curl -X POST "https://your-domain.com/api/shortcut/transactions" \
	-H "Authorization: Bearer YOUR_SHORTCUT_API_TOKEN" \
	-H "Content-Type: application/json" \
	-d '{
		"amount": 4.20,
		"description": "Apple Pay",
		"category": "Food",
		"type": "expense"
	}'
```
