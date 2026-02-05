"use client";

import { type VariantProps, cva } from "class-variance-authority";

/**
 * Loading spinner component with different sizes
 * Provides visual feedback during async operations
 */

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-solid border-current border-r-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-3",
      },
      variant: {
        primary: "text-[var(--accent-primary)]",
        secondary: "text-[var(--text-secondary)]",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  },
);

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  /** Optional text to display below spinner */
  text?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * LoadingSpinner - Reusable loading indicator
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" text="Loading posts..." />
 * ```
 */
export default function LoadingSpinner({
  size,
  variant,
  text,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className={spinnerVariants({ size, variant })}
        role="status"
        aria-label={text || "Loading"}
      >
        <span className="sr-only">{text || "Loading..."}</span>
      </div>
      {text && (
        <p className="text-sm text-[var(--text-secondary)] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
