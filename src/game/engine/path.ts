import { clamp, Vec2 } from './math';

export interface PathCache {
  points: Vec2[];
  segmentLengths: number[];
  cumulative: number[];
  totalLength: number;
}

export function buildPath(points: Vec2[]): PathCache {
  const segmentLengths: number[] = [];
  const cumulative: number[] = [0];
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segmentLengths.push(len);
    total += len;
    cumulative.push(total);
  }
  return { points, segmentLengths, cumulative, totalLength: total };
}

export function samplePath(cache: PathCache, s: number): Vec2 {
  if (cache.points.length < 2) return { x: 0, y: 0 };

  if (s <= 0) {
    const a = cache.points[0];
    const b = cache.points[1];
    const dirX = b.x - a.x;
    const dirY = b.y - a.y;
    const len = Math.max(0.0001, Math.hypot(dirX, dirY));
    return { x: a.x + (dirX / len) * s, y: a.y + (dirY / len) * s };
  }

  if (s >= cache.totalLength) {
    const b = cache.points[cache.points.length - 1];
    const a = cache.points[cache.points.length - 2];
    const dirX = b.x - a.x;
    const dirY = b.y - a.y;
    const len = Math.max(0.0001, Math.hypot(dirX, dirY));
    const overflow = s - cache.totalLength;
    return { x: b.x + (dirX / len) * overflow, y: b.y + (dirY / len) * overflow };
  }

  for (let i = 0; i < cache.segmentLengths.length; i += 1) {
    const start = cache.cumulative[i];
    const end = cache.cumulative[i + 1];
    if (s >= start && s <= end) {
      const t = (s - start) / Math.max(0.0001, end - start);
      const a = cache.points[i];
      const b = cache.points[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
  }

  return cache.points[cache.points.length - 1];
}

export function projectToPath(cache: PathCache, p: Vec2): number {
  let bestS = 0;
  let bestDist2 = Number.POSITIVE_INFINITY;
  for (let i = 0; i < cache.points.length - 1; i += 1) {
    const a = cache.points[i];
    const b = cache.points[i + 1];
    const abX = b.x - a.x;
    const abY = b.y - a.y;
    const abLen2 = Math.max(0.0001, abX * abX + abY * abY);
    const apX = p.x - a.x;
    const apY = p.y - a.y;
    const t = clamp((apX * abX + apY * abY) / abLen2, 0, 1);
    const qX = a.x + abX * t;
    const qY = a.y + abY * t;
    const d2 = (p.x - qX) * (p.x - qX) + (p.y - qY) * (p.y - qY);
    if (d2 < bestDist2) {
      bestDist2 = d2;
      bestS = cache.cumulative[i] + cache.segmentLengths[i] * t;
    }
  }
  return bestS;
}
