import { writeFileSync } from 'fs';
import { slugify } from '../src/lib/utils';
import { cocktailService } from '../src/services/cocktail-service';

const baseUrl = 'https://cocktails.monsoonclub.co';

function generateSitemap() {
  const cocktails =
    cocktailService.getAllCocktailsWithDetails();

  // Get all unique flavors
  const allFlavors = new Set<string>();
  cocktails.forEach(cocktail => {
    cocktail.flavor_descriptors.forEach(flavor => {
      allFlavors.add(slugify(flavor.en));
    });
  });

  // Get all unique ingredients
  const allIngredients = new Set<string>();
  cocktails.forEach(cocktail => {
    [
      ...cocktail.base_spirits,
      ...cocktail.liqueurs,
      ...cocktail.ingredients,
    ].forEach(ingredient => {
      allIngredients.add(slugify(ingredient.name.en));
    });
  });

  const today = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Home pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${baseUrl}/zh"/>
  </url>

  <!-- Cocktail pages -->
  ${cocktails
    .map(cocktail => {
      const cocktailSlug = slugify(cocktail.name.en);
      return `
  <url>
    <loc>${baseUrl}/en/cocktails/${cocktailSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/cocktails/${cocktailSlug}"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${baseUrl}/zh/cocktails/${cocktailSlug}"/>
  </url>
  <url>
    <loc>${baseUrl}/zh/cocktails/${cocktailSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/cocktails/${cocktailSlug}"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${baseUrl}/zh/cocktails/${cocktailSlug}"/>
  </url>`;
    })
    .join('')}

  <!-- Flavor pages -->
  ${Array.from(allFlavors)
    .map(
      flavorSlug => `
  <url>
    <loc>${baseUrl}/en/flavours/${flavorSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/flavours/${flavorSlug}"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${baseUrl}/zh/flavours/${flavorSlug}"/>
  </url>
  <url>
    <loc>${baseUrl}/zh/flavours/${flavorSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/flavours/${flavorSlug}"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${baseUrl}/zh/flavours/${flavorSlug}"/>
  </url>`,
    )
    .join('')}

  <!-- Ingredient pages -->
  ${Array.from(allIngredients)
    .map(
      ingredientSlug => `
  <url>
    <loc>${baseUrl}/en/ingredients/${ingredientSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/ingredients/${ingredientSlug}"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${baseUrl}/zh/ingredients/${ingredientSlug}"/>
  </url>
  <url>
    <loc>${baseUrl}/zh/ingredients/${ingredientSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/ingredients/${ingredientSlug}"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${baseUrl}/zh/ingredients/${ingredientSlug}"/>
  </url>`,
    )
    .join('')}
</urlset>`;

  // Write the sitemap to public directory
  writeFileSync('public/sitemap.xml', sitemap);
  console.log('Sitemap generated successfully!');
}

generateSitemap();
