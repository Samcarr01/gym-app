import { ModeSelector } from '@/components/ModeSelector';

export default function StartPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Choose Your Mode
          </h1>
          <p className="text-muted-foreground text-lg">
            Start fresh or upgrade your current plan
          </p>
        </header>

        <ModeSelector />

        <footer className="text-center text-xs text-muted-foreground">
          <p>Powered by AI • Built for you and your friends</p>
        </footer>
      </div>
    </main>
  );
}
