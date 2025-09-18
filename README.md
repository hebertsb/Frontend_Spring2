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

## Environment Configuration

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Configure your API URL in `.env.local`:
```env
# For development
NEXT_PUBLIC_API_URL=http://localhost:8000/api/

# For production
NEXT_PUBLIC_API_URL=https://your-production-api.com/api/
```

## Deployment to Production

### Common Issues & Solutions

**Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"**

This error occurs when the API returns HTML instead of JSON. Common causes:

1. **API not available**: Verify your backend is running and accessible
2. **Wrong API URL**: Check `NEXT_PUBLIC_API_URL` in your environment variables
3. **CORS issues**: Ensure your backend allows requests from your frontend domain

**Solutions:**
- Verify your API is responding correctly: `curl https://your-api-url/api/servicios/`
- Check browser network tab for actual response content
- Ensure environment variables are set correctly in your hosting platform

### Environment Variables for Production

When deploying to platforms like Vercel, Netlify, or Railway, set:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/
```

### Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

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
