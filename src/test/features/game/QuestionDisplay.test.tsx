import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuestionDisplay from '../../../features/game/QuestionDisplay';

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
  },
}));

vi.mock('lucide-react', () => ({
  Clock: ({ className, size }: any) => <svg data-testid="clock" className={className} width={size} height={size}><circle /></svg>,
}));

describe('QuestionDisplay (ms-based UI)', () => {
  it('renders decimal seconds based on `timeLeftMs` and computes progress from `maxTimeMs`', () => {
    const { container } = render(
      <QuestionDisplay
        question="¿Test?"
        questionNumber={1}
        roomCode="ROOM1"
        timeLeft={0}
        timeLeftMs={7500}
        maxTimeSeconds={30}
        maxTimeMs={15000}
      />
    );

    // decimal seconds text
    expect(screen.getByText('7.5s')).toBeDefined();

    // progress: 7500 / 15000 => 50%
    const divs = Array.from(container.querySelectorAll('div'));
    const widthEl = divs.find((d) => (d as HTMLElement).style && (d as HTMLElement).style.width);
    expect(widthEl).toBeDefined();
    expect((widthEl as HTMLElement).style.width).toBe('50%');
  });
});
