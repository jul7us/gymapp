import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My Next.js App</h1>
      <p>This is your first customized Next.js page, Julius!</p>
      <Link href="/about">Go to About Page</Link>
    </div>
  );
}