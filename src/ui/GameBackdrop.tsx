import { useEffect, useState } from 'react';

const ART_VIEWPORT = '(min-width: 1440px) and (hover: hover) and (pointer: fine)';
const art = import.meta.glob<string>('../assets/game-backdrops/*.webp', {
  eager: true, query: '?url', import: 'default',
});

type Backdrop = { gameId: string; left: string; right: string };

async function decodeImage(src: string) {
  const image = new Image();
  image.src = src;
  await image.decode();
}

export function GameBackdrop({ gameId }: { gameId: string | null }) {
  const [loaded, setLoaded] = useState<Backdrop | null>(null);

  useEffect(() => {
    const left = art[`../assets/game-backdrops/${gameId}-left.webp`];
    const right = art[`../assets/game-backdrops/${gameId}-right.webp`];
    if (!gameId || !left || !right || !window.matchMedia(ART_VIEWPORT).matches) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        await Promise.all([decodeImage(left), decodeImage(right)]);
        if (!cancelled) setLoaded({ gameId, left, right });
      } catch {
        // Decorative art is optional if either image fails to load.
      }
    }, 100);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [gameId]);

  return (
    <div className="game-backdrop" aria-hidden="true" data-visible={!!loaded && loaded.gameId === gameId}>
      {loaded && <>
        <img className="game-backdrop-left" src={loaded.left} alt="" draggable={false} />
        <img className="game-backdrop-right" src={loaded.right} alt="" draggable={false} />
      </>}
    </div>
  );
}
