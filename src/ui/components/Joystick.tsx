import { PointerEvent, useRef } from 'react';

interface Props {
  onMove: (x: number, y: number) => void;
}

export function Joystick({ onMove }: Props) {
  const active = useRef(false);

  const handle = (e: PointerEvent<HTMLDivElement>) => {
    if (!active.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    onMove(Math.max(-1, Math.min(1, dx)), Math.max(-1, Math.min(1, dy)));
  };

  return (
    <div
      className="joystick"
      onPointerDown={(e) => {
        active.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={handle}
      onPointerUp={() => {
        active.current = false;
        onMove(0, 0);
      }}
    >
      <div className="joystick-inner" />
    </div>
  );
}
