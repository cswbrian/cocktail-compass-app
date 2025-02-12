import Link from 'next/link'

export function Header() {
  return (
    <header className="flex justify-between items-center p-6">
      <Link href="/">Cocktail Compass</Link>
    </header>
  );
}
