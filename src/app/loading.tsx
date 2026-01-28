export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </main>
  );
}
