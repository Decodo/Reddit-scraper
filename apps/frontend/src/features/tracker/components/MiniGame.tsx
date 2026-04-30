import { useCallback, useEffect, useReducer, useRef } from 'react';

const W = 560;
const H = 130;
const FLOOR = 100;
const CHAR_X = 50;
const CHAR_W = 24;
const CHAR_H = 24;
const OBS_W = 22;
const GRAVITY = 0.55;
const JUMP_V = -13;
const BASE_SPEED = 2;
const OBSTACLE_ORANGE = '#ff4500';

type Status = 'idle' | 'running' | 'dead';
interface Obs {
  id: number;
  x: number;
  h: number;
}
interface BgEl {
  id: number;
  x: number;
  y: number;
  sym: string;
  size: number;
  opacity: number;
}

interface GameState {
  status: Status;
  vy: number;
  y: number;
  obs: Obs[];
  obsId: number;
  score: number;
  dist: number;
  nextObs: number;
  speed: number;
  lastTs: number;
  bgEls: BgEl[];
  bgId: number;
  nextBg: number;
  frame: number;
}

export const MiniGame = () => {
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  const rafRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const g = useRef<GameState>({
    status: 'idle',
    vy: 0,
    y: FLOOR - CHAR_H,
    obs: [],
    obsId: 0,
    score: 0,
    dist: 0,
    nextObs: 130,
    speed: BASE_SPEED,
    lastTs: 0,
    bgEls: [],
    bgId: 0,
    nextBg: 80,
    frame: 0,
  });

  const startLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);

    const tick = (ts: number) => {
      const s = g.current;
      if (s.status !== 'running') return;

      const dt = s.lastTs ? Math.min((ts - s.lastTs) / 16.67, 3) : 1;
      s.lastTs = ts;
      s.frame++;

      // physics
      s.vy += GRAVITY * dt;
      s.y = Math.min(s.y + s.vy * dt, FLOOR - CHAR_H);
      if (s.y >= FLOOR - CHAR_H) s.vy = 0;

      // obstacles
      s.dist += s.speed * dt;
      s.nextObs -= s.speed * dt;
      s.speed = BASE_SPEED + s.dist / 5000;

      if (s.nextObs <= 0) {
        const spawnX = (containerRef.current?.offsetWidth ?? W) + OBS_W;
        s.obs.push({ id: s.obsId++, x: spawnX, h: 16 + Math.random() * 18 });
        s.nextObs = 180 + Math.random() * 150;
      }

      s.obs = s.obs.map((o) => ({ ...o, x: o.x - s.speed * dt })).filter((o) => o.x > -OBS_W);

      // background parallax elements
      s.nextBg -= s.speed * dt;
      if (s.nextBg <= 0) {
        const syms = ['▲', '▲', '▼', '◆', '✦'];
        s.bgEls.push({
          id: s.bgId++,
          x: W + 20,
          y: 8 + Math.random() * 72,
          sym: syms[Math.floor(Math.random() * syms.length)],
          size: 9 + Math.random() * 9,
          opacity: 0.04 + Math.random() * 0.07,
        });
        s.nextBg = 100 + Math.random() * 120;
      }
      s.bgEls = s.bgEls
        .map((b) => ({ ...b, x: b.x - s.speed * 0.35 * dt }))
        .filter((b) => b.x > -30);

      // collision (slightly inset for fairness)
      for (const o of s.obs) {
        if (
          CHAR_X + CHAR_W - 3 > o.x + 2 &&
          CHAR_X + 3 < o.x + OBS_W - 2 &&
          s.y + CHAR_H - 8 > FLOOR - o.h // -8 excludes legs from collision box
        ) {
          s.status = 'dead';
          s.score = Math.floor(s.dist / 10);
          redraw();
          return;
        }
      }

      s.score = Math.floor(s.dist / 10);
      redraw();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const action = useCallback(() => {
    const s = g.current;
    if (s.status === 'idle' || s.status === 'dead') {
      Object.assign(s, {
        status: 'running',
        vy: JUMP_V,
        y: FLOOR - CHAR_H,
        obs: [],
        bgEls: [],
        score: 0,
        dist: 0,
        nextObs: 200,
        nextBg: 80,
        speed: BASE_SPEED,
        lastTs: 0,
        frame: 0,
      });
      startLoop();
    } else if (s.y >= FLOOR - CHAR_H - 1) {
      s.vy = JUMP_V;
    }
  }, [startLoop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, [action]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const { status, y, vy, obs, score, bgEls, frame } = g.current;
  const onGround = y >= FLOOR - CHAR_H - 0.5;

  // squash on landing, stretch while rising
  const scaleX = onGround ? 1 : vy < -5 ? 0.82 : vy > 5 ? 1.14 : 1;
  const scaleY = onGround ? 1 : vy < -5 ? 1.2 : vy > 5 ? 0.84 : 1;

  // tilt: lean back on jump, forward on fall
  const tilt = !onGround ? (vy < 0 ? -35 : 20) : 0;

  // dot blink: flash orange on a slow irregular cycle (mirrors the real logo animation)
  const dotPhase = frame % 120;
  const dotColor =
    dotPhase < 3 || (dotPhase >= 6 && dotPhase < 9) ? OBSTACLE_ORANGE : 'var(--color-primary)';

  return (
    <div className="flex flex-col items-center gap-2 pt-4">
      <div
        ref={containerRef}
        className="relative w-full cursor-pointer select-none overflow-hidden rounded-lg border border-border bg-muted/20 active:scale-[0.99] transition-transform"
        style={{ height: H, touchAction: 'manipulation' }}
        onClick={action}
        onTouchStart={(e) => {
          e.preventDefault();
          action();
        }}
        role="button"
        tabIndex={0}
        aria-label="Mini game — tap or press space to jump over obstacles"
        onKeyDown={(e) => {
          if (e.code === 'Space' || e.code === 'ArrowUp') action();
        }}
      >
        {/* Background parallax symbols */}
        {bgEls.map((b) => (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              fontSize: b.size,
              opacity: b.opacity,
              color: OBSTACLE_ORANGE,
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {b.sym}
          </div>
        ))}

        {/* Floor line */}
        <div className="absolute left-0 right-0 bg-border" style={{ top: FLOOR, height: 1 }} />

        {/* Decodo D character — outer div handles tilt with easing, inner handles squash/stretch */}
        <div
          style={{
            position: 'absolute',
            left: CHAR_X,
            top: y,
            width: CHAR_W,
            height: CHAR_H,
            transformOrigin: 'bottom center',
            transform: `rotate(${tilt}deg)`,
            transition: 'transform 0.12s ease-out',
          }}
        >
          <div
            style={{
              width: CHAR_W,
              height: CHAR_H,
              transformOrigin: 'bottom center',
              transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
            }}
          >
            <svg
              width={CHAR_W}
              height={CHAR_H}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 0H0V12H4V4H10C13.3143 4 16 6.68571 16 10C16 13.3143 13.3143 16 10 16H8V20H10C15.5229 20 20 15.5229 20 10C20 4.47714 15.5229 0 10 0Z"
                fill="var(--color-primary)"
              />
              <path d="M4 16H0V20H4V16Z" fill={dotColor} />
              <path d="M8 12H4V16H8V12Z" fill={dotColor} />
            </svg>
          </div>
        </div>

        {/* Obstacles  */}
        {obs.map((o) => (
          <div
            key={o.id}
            style={{
              position: 'absolute',
              left: o.x,
              top: FLOOR - o.h,
              width: OBS_W,
              height: o.h,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: OBSTACLE_ORANGE,
                opacity: 0.85,
                borderRadius: '5px 5px 0 0',
              }}
            />
            {/* Upvote arrow */}
            <div
              style={{
                position: 'absolute',
                top: 5,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '7px solid rgba(255,255,255,0.65)',
              }}
            />
          </div>
        ))}

        {/* Karma score */}
        <div className="absolute right-2 top-1.5 font-mono text-xs tabular-nums text-muted-foreground flex items-center gap-1">
          <span style={{ color: OBSTACLE_ORANGE, fontSize: 9 }}>▲</span>
          {score} karma
        </div>

        {/* Idle overlay */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">tap or press space to play</span>
          </div>
        )}

        {/* Dead overlay */}
        {status === 'dead' && (
          <div className="absolute inset-0 flex items-center justify-center gap-4">
            <span className="text-xs font-medium">{score} karma</span>
            <span className="text-xs text-muted-foreground">tap to try again</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">something to do while you wait</p>
    </div>
  );
};
