import fs from 'fs';
import path from 'path';

// Read the cocktails data
const cocktailsPath = path.join(
  process.cwd(),
  'data',
  'cocktails.json',
);
const cocktailsData = JSON.parse(
  fs.readFileSync(cocktailsPath, 'utf-8'),
);

// Update category values
const updatedCocktails = cocktailsData.map(
  (cocktail: any) => {
    const categories = cocktail.categories || [];
    const updatedCategories = categories.map(
      (category: string) => {
        switch (category.toLowerCase()) {
          case 'strong':
            return 'Strong & Spirit-Focused';
          case 'sweet':
            return 'Sweet & Tart';
          case 'bubbly':
            return 'Tall & Bubbly';
          case 'creamy':
            return 'Rich & Creamy';
          default:
            return category;
        }
      },
    );
    return {
      ...cocktail,
      categories: updatedCategories,
    };
  },
);

// Write the updated data back to the file
fs.writeFileSync(
  cocktailsPath,
  JSON.stringify(updatedCocktails, null, 2),
);

console.log('✅ Categories updated successfully');
