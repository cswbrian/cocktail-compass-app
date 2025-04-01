# Cocktail Compass App

A client-side only Progressive Web App (PWA) built with Next.js for exploring cocktail recipes and combinations.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with Static Site Generation (SSG)
- **Package Manager**: [pnpm](https://pnpm.io) (v9.7.1)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Data Visualization**: [D3.js](https://d3js.org/)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com)

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

- `/app` - Next.js app directory with route components
- `/components` - Reusable UI components
- `/data` - Static data and assets
- `/lib` - Utility functions and shared logic
- `/scripts` - Build and data processing scripts
- `/public` - Static assets
- `/types` - TypeScript type definitions

## Build Process

The project uses a two-step build process:

1. Compress cocktail data:
```bash
pnpm build:compress
```

2. Build the application:
```bash
pnpm build
```

## Deployment

This project is configured for deployment on Cloudflare Pages. The build output is static and optimized for edge delivery.

To deploy:
1. Ensure your repository is connected to Cloudflare Pages
2. Push to your main branch
3. Cloudflare Pages will automatically build and deploy your site

## Development Notes

- This is a client-side only application - all data is processed at build time and served statically
- The app uses static site generation (SSG) for optimal performance
- Progressive Web App features are enabled for offline capability
- Firebase is integrated for additional functionality

## License

[Add your license information here]
