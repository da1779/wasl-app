import { createFileRoute } from "@tanstack/react-router";
import { SikkahGame } from "@/components/game/SikkahGame";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="h-dvh w-full overflow-hidden bg-bg">
      <SikkahGame />
    </main>
  );
}
