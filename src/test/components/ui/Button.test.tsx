import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Button } from '../../../components/ui/Button';

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, className, disabled, type, ...props }: any) => (
      <button
        onClick={onClick}
        className={className}
        disabled={disabled}
        type={type}
        {...props}
      >
        {children}
      </button>
    ),
  },
}));

describe('Button', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Basic rendering', () => {
    it('should render the button with children', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByText('Click me')).toBeDefined();
    });

    it('should have type="button" by default', () => {
      render(<Button>Button</Button>);

      const button = screen.getByText('Button') as HTMLButtonElement;
      expect(button.type).toBe('button');
    });

    it('should apply the base classes correctly', () => {
      render(<Button>Test</Button>);

      const button = screen.getByText('Test');
      expect(button.className).toContain('font-bold');
      expect(button.className).toContain('py-3');
      expect(button.className).toContain('px-6');
      expect(button.className).toContain('rounded-xl');
      expect(button.className).toContain('shadow-lg');
      expect(button.className).toContain('transition-all');
    });
  });

  describe('Prop type', () => {
    it('should accept type="submit"', () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByText('Submit') as HTMLButtonElement;
      expect(button.type).toBe('submit');
    });

    it('should accept type="reset""', () => {
      render(<Button type="reset">Reset</Button>);

      const button = screen.getByText('Reset') as HTMLButtonElement;
      expect(button.type).toBe('reset');
    });
  });

  describe('Variants', () => {
    it('should apply variant="primary" styles by default', () => {
      render(<Button>Primary</Button>);

      const button = screen.getByText('Primary');
      expect(button.className).toContain('bg-gradient-to-r');
      expect(button.className).toContain('from-blue-500');
      expect(button.className).toContain('to-purple-500');
      expect(button.className).toContain('text-white');
    });

    it('should apply styles of variant="secondary"', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByText('Secondary');
      expect(button.className).toContain('bg-gray-200');
      expect(button.className).toContain('text-gray-600');
    });

    it('should apply variant styles="tab"', () => {
      render(<Button variant="tab">Tab</Button>);

      const button = screen.getByText('Tab');
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('text-gray-700');
      expect(button.className).toContain('px-4');
      expect(button.className).toContain('py-2');
      expect(button.className).toContain('rounded-lg');
    });
  });

  describe('state disabled', () => {
    it('should be enabled by default', () => {
      render(<Button>Enabled</Button>);

      const button = screen.getByText('Enabled') as HTMLButtonElement;
      expect(button.disabled).toBe(false);
    });

    it('should disable the button when disabled=true', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByText('Disabled') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('should apply disabled classes', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByText('Disabled');
      expect(button.className).toContain('disabled:opacity-50');
      expect(button.className).toContain('disabled:cursor-not-allowed');
    });

    it('should not execute onClick when it is disabled', () => {
      render(
        <Button disabled onClick={mockOnClick}>
          Disabled Click
        </Button>
      );

      const button = screen.getByText('Disabled Click');
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Prop fullWidth', () => {
    it('should not have the w-full class by default', () => {
      render(<Button>Normal</Button>);

      const button = screen.getByText('Normal');
      expect(button.className).not.toContain('w-full');
    });

    it('should apply the w-full class when fullWidth=true', () => {
      render(<Button fullWidth>Full Width</Button>);

      const button = screen.getByText('Full Width');
      expect(button.className).toContain('w-full');
    });
  });

  describe('Prop isActive', () => {
    it('should not have default ring classes', () => {
      render(<Button>Not Active</Button>);

      const button = screen.getByText('Not Active');
      expect(button.className).not.toContain('ring-2');
    });

    it('should apply ring classes when isActive=true', () => {
      render(<Button isActive>Active</Button>);

      const button = screen.getByText('Active');
      expect(button.className).toContain('ring-2');
      expect(button.className).toContain('ring-offset-2');
      expect(button.className).toContain('ring-blue-300');
    });
  });

  describe('Prop className custom', () => {
    it('should apply additional custom classes', () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByText('Custom');
      expect(button.className).toContain('custom-class');
    });

    it('should maintain the base classes with custom className', () => {
      render(<Button className="my-custom">Custom</Button>);

      const button = screen.getByText('Custom');
      expect(button.className).toContain('my-custom');
      expect(button.className).toContain('font-bold');
      expect(button.className).toContain('py-3');
    });
  });

  describe('Eventos onClick', () => {
    it('should execute onClick when a click occurs', () => {
      render(<Button onClick={mockOnClick}>Click</Button>);

      const button = screen.getByText('Click');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple clicks', () => {
      render(<Button onClick={mockOnClick}>Multiple</Button>);

      const button = screen.getByText('Multiple');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('should work without the onClick prop', () => {
      render(<Button>No onClick</Button>);

      const button = screen.getByText('No onClick');
      
      // No debería lanzar error
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe('Children', () => {
    it('should render JSX elements as children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );

      expect(screen.getByText('Icon')).toBeDefined();
      expect(screen.getByText('Text')).toBeDefined();
    });

    it('should render icons and text combined', () => {
      render(
        <Button>
          <svg data-testid="icon">
            <circle />
          </svg>
          Submit Form
        </Button>
      );

      expect(screen.getByTestId('icon')).toBeDefined();
      expect(screen.getByText('Submit Form')).toBeDefined();
    });
  });

  describe('Prop combinations', () => {
    it('should combine variant, fullWidth, and isActive correctly', () => {
      render(
        <Button variant="secondary" fullWidth isActive>
          Combined
        </Button>
      );

      const button = screen.getByText('Combined');
      expect(button.className).toContain('bg-gray-200');
      expect(button.className).toContain('w-full');
      expect(button.className).toContain('ring-2');
    });

    it('should combine disabled with variant', () => {
      render(
        <Button variant="primary" disabled>
          Disabled Primary
        </Button>
      );

      const button = screen.getByText('Disabled Primary') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      expect(button.className).toContain('bg-gradient-to-r');
      expect(button.className).toContain('disabled:opacity-50');
    });

    it('should combine all the props', () => {
      render(
        <Button
          type="submit"
          variant="tab"
          fullWidth
          isActive
          disabled
          className="extra-class"
          onClick={mockOnClick}
        >
          All Props
        </Button>
      );

      const button = screen.getByText('All Props') as HTMLButtonElement;
      expect(button.type).toBe('submit');
      expect(button.disabled).toBe(true);
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('w-full');
      expect(button.className).toContain('ring-2');
      expect(button.className).toContain('extra-class');
    });
  });

  describe('Accessibility', () => {
    it('should have the role of button', () => {
      render(<Button>Accessible</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDefined();
    });

    it('should be accessible with visible text', () => {
      render(<Button>Visible Text</Button>);

      const button = screen.getByText('Visible Text');
      expect(button.textContent).toBe('Visible Text');
    });
  });
});