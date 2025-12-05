import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnswerOptions from '../../../features/game/AnswerOptions';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, animate, style, ...props }: any) => {
      const appliedStyle = { ...(style || {}) } as any;
      if (animate && typeof animate === 'object' && animate.width) {
        appliedStyle.width = animate.width;
      }
      return (
        <div {...props} style={appliedStyle}>
          {children}
        </div>
      );
    },
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

vi.mock('lucide-react', () => ({
  Clock: ({ className, size }: any) => <svg data-testid="clock" className={className} width={size} height={size}><circle /></svg>,
}));

describe('AnswerOptions (ms-based UI)', () => {
  it('renders decimal seconds and progress from ms props', () => {
    const { container } = render(
      <AnswerOptions
        options={["Opción A", "Opción B"]}
        onSelect={() => {}}
        timeLeft={0}
        timeLeftMs={3000}
        maxTimeMs={6000}
      />
    );

    expect(screen.getByText('3.0s')).toBeDefined();

    const divs = Array.from(container.querySelectorAll('div'));
    const widthEl = divs.find((d) => (d as HTMLElement).style && (d as HTMLElement).style.width);
    expect(widthEl).toBeDefined();
    expect((widthEl as HTMLElement).style.width).toBe('50%');
  });

  it('falls back to seconds-based props when ms props are absent', () => {
    const { container } = render(
      <AnswerOptions
        options={["A", "B"]}
        onSelect={() => {}}
        timeLeft={5}
      />
    );

    expect(screen.getByText('5.0s')).toBeDefined();

    const divs = Array.from(container.querySelectorAll('div'));
    const widthEl = divs.find((d) => (d as HTMLElement).style && (d as HTMLElement).style.width);
    // when timeLeft == maxTime (no maxTimeMs provided), percentage should be 100%
    expect(widthEl).toBeDefined();
    expect((widthEl as HTMLElement).style.width).toBe('100%');
  });
});
