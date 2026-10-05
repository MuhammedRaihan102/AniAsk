import { Button } from "@/components/ui/button";

// Temporary theme preview. Replaced by the real landing page in Phase 1, step 3.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-semibold tracking-tight">
        Ani<span className="text-primary">Ask</span>
      </h1>
      <p className="text-muted-foreground">
        Theme preview: one accent, dark surfaces.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>

      <div className="bg-card text-card-foreground w-full max-w-sm rounded-xl border p-6">
        <p className="font-medium">A card</p>
        <p className="text-muted-foreground text-sm">
          Anime cards and info panels will sit on this surface.
        </p>
      </div>
    </main>
  );
}
