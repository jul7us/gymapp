import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h1>Welcome to Gym Tracker</h1>
      <p>Select your workout for today:</p>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <Link href="/push">
          <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>Push</button>
        </Link>
        <Link href="/pull">
          <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>Pull</button>
        </Link>
        <Link href="/legs">
          <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>Legs</button>
        </Link>
      </div>
    </div>
  );
}