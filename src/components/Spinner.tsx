import { useEffect, useState } from 'react';

interface SpinnerProps {
  color?: 'white' | 'black' | 'foreground' | 'muted';
  delay?: boolean;
}

export const Spinner = ({
  color = 'foreground',
  delay = false,
}: SpinnerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const colorClass = {
    white: 'text-white',
    black: 'text-black',
    foreground: 'text-foreground',
    muted: 'text-muted-foreground',
  }[color];

  useEffect(() => {
    if (delay) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [delay]);

  return (
    <div
      className="animate-fadeIn"
      style={{ height: '1.25rem', width: '1.25rem' }}
    >
      {isVisible ? (
        <svg
          className={`animate-spin h-5 w-5 ${colorClass}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-0"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <div aria-hidden="true" />
      )}
    </div>
  );
};
