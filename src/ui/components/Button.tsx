import { PropsWithChildren } from 'react';

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({ onClick, disabled, className, children }: PropsWithChildren<Props>) {
  return (
    <button className={`btn ${className ?? ''}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
