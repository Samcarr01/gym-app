import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="p-8 max-w-md text-center space-y-4">
        <h2 className="text-4xl font-bold">404</h2>
        <p className="text-muted-foreground">This page doesn't exist.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </Card>
    </main>
  );
}
