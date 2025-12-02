import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InputField } from '../../../components/ui/InputField';

const MockIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg
    data-testid="mock-icon"
    className={className}
    width={size}
    height={size}
  >
    <circle />
  </svg>
);

describe('InputField', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    label: 'Email',
    type: 'email',
    value: '',
    onChange: mockOnChange,
    placeholder: 'Enter your email',
    icon: MockIcon,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Basic rendering', () => {
    it('should render the label correctly', () => {
      render(<InputField {...defaultProps} />);

      expect(screen.getByText('Email')).toBeDefined();
    });

    it('should render the input with the placeholder', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter your email');
      expect(input).toBeDefined();
    });

    it('should render the icon', () => {
      render(<InputField {...defaultProps} />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeDefined();
    });

    it('should have the correct div structure', () => {
      const { container } = render(<InputField {...defaultProps} />);

      const outerDiv = container.firstChild;
      const relativeDiv = container.querySelector('.relative');

      expect(outerDiv).toBeDefined();
      expect(relativeDiv).toBeDefined();
    });
  });

  describe('Prop label', () => {
    it('should display the label with the correct classes', () => {
      render(<InputField {...defaultProps} />);

      const label = screen.getByText('Email');
      expect(label.tagName).toBe('LABEL');
      expect(label.className).toContain('block');
      expect(label.className).toContain('text-sm');
      expect(label.className).toContain('font-bold');
      expect(label.className).toContain('text-gray-700');
      expect(label.className).toContain('mb-2');
    });

    it('should accept different label texts', () => {
      render(<InputField {...defaultProps} label="Password" />);

      expect(screen.getByText('Password')).toBeDefined();
    });
  });

  describe('Prop type', () => {
    it('should have type="email" when specified', () => {
      render(<InputField {...defaultProps} type="email" />);

      const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      expect(input.type).toBe('email');
    });

    it('should accept type="password"', () => {
      render(<InputField {...defaultProps} type="password" />);

      const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('should accept type="text"', () => {
      render(<InputField {...defaultProps} type="text" />);

      const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      expect(input.type).toBe('text');
    });
  });

  describe('Prop value', () => {
    it('should display the initial empty value', () => {
      render(<InputField {...defaultProps} value="" />);

      const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should display the value when it is provided', () => {
      render(<InputField {...defaultProps} value="test@example.com" />);

      const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      expect(input.value).toBe('test@example.com');
    });

    it('should update the value when the property changes', () => {
      const { rerender } = render(<InputField {...defaultProps} value="" />);

      let input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      expect(input.value).toBe('');

      rerender(<InputField {...defaultProps} value="updated@example.com" />);

      input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      expect(input.value).toBe('updated@example.com');
    });
  });

  describe('Prop onChange', () => {
    it('should call onChange when the user types', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter your email');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });

    it('should call onChange multiple times', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter your email');
      
      fireEvent.change(input, { target: { value: 't' } });
      fireEvent.change(input, { target: { value: 'te' } });
      fireEvent.change(input, { target: { value: 'tes' } });

      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 't');
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 'te');
      expect(mockOnChange).toHaveBeenNthCalledWith(3, 'tes');
    });

    it('should pass the full value to onChange', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter your email');
      fireEvent.change(input, { target: { value: 'full@email.com' } });

      expect(mockOnChange).toHaveBeenCalledWith('full@email.com');
    });
  });

  describe('Prop placeholder', () => {
    it('should show the placeholder', () => {
      render(<InputField {...defaultProps} placeholder="Type here..." />);

      const input = screen.getByPlaceholderText('Type here...');
      expect(input).toBeDefined();
    });

    it('should accept different placeholders', () => {
      render(<InputField {...defaultProps} placeholder="Enter password" />);

      expect(screen.getByPlaceholderText('Enter password')).toBeDefined();
    });
  });

  describe('Prop icon', () => {
    it('should render the icon at the correct size.', () => {
      render(<InputField {...defaultProps} />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon.getAttribute('width')).toBe('20');
      expect(icon.getAttribute('height')).toBe('20');
    });

    it('should position the icon before the input', () => {
      const { container } = render(<InputField {...defaultProps} />);

      const relativeDiv = container.querySelector('.relative');
      const children = Array.from(relativeDiv?.children || []);

      expect(children[0].tagName).toBe('svg'); // Icono primero
      expect(children[1].tagName).toBe('INPUT'); // Input después
    });
  });

  describe('Prop required', () => {
    it('should not be required by default', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      expect(input.required).toBe(false);
    });

    it('should be required when specified', () => {
      render(<InputField {...defaultProps} required />);

      const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      expect(input.required).toBe(true);
    });

    it('should be required when required=true', () => {
      render(<InputField {...defaultProps} required={true} />);

      const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      expect(input.required).toBe(true);
    });

    it('should not be required when required=false', () => {
      render(<InputField {...defaultProps} required={false} />);

      const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      expect(input.required).toBe(false);
    });
  });

  describe('Classes CSS of input', () => {
    it('should have the correct base classes', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter your email');
      expect(input.className).toContain('w-full');
      expect(input.className).toContain('pl-12');
      expect(input.className).toContain('pr-4');
      expect(input.className).toContain('py-3');
      expect(input.className).toContain('border-2');
      expect(input.className).toContain('border-gray-300');
      expect(input.className).toContain('rounded-xl');
      expect(input.className).toContain('focus:border-blue-500');
      expect(input.className).toContain('focus:outline-none');
      expect(input.className).toContain('transition-colors');
    });
  });

  describe('Full integration', () => {
    it('should function as a complete email field', () => {
      render(
        <InputField
          label="Email Address"
          type="email"
          value=""
          onChange={mockOnChange}
          placeholder="john@example.com"
          icon={MockIcon}
          required
        />
      );

      expect(screen.getByText('Email Address')).toBeDefined();
      expect(screen.getByTestId('mock-icon')).toBeDefined();

      const input = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      expect(input.type).toBe('email');
      expect(input.required).toBe(true);

      fireEvent.change(input, { target: { value: 'john@example.com' } });
      expect(mockOnChange).toHaveBeenCalledWith('john@example.com');
    });

    it('should function as a complete password field', () => {
      render(
        <InputField
          label="Password"
          type="password"
          value="secret"
          onChange={mockOnChange}
          placeholder="Enter password"
          icon={MockIcon}
          required
        />
      );

      const input = screen.getByPlaceholderText('Enter password') as HTMLInputElement;
      expect(input.type).toBe('password');
      expect(input.value).toBe('secret');
      expect(input.required).toBe(true);
    });
  });

  describe('Special cases', () => {
    it('should handle values ​​with special characters', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter your email');
      fireEvent.change(input, { target: { value: 'test+special@example.com' } });

      expect(mockOnChange).toHaveBeenCalledWith('test+special@example.com');
    });

    it('should handle empty values ​​correctly', () => {
      render(<InputField {...defaultProps} value="test" />);

      const input = screen.getByPlaceholderText('Enter your email');
      fireEvent.change(input, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should handle long labels', () => {
      render(
        <InputField
          {...defaultProps}
          label="Este es un label muy largo que debería mostrarse correctamente"
        />
      );

      expect(
        screen.getByText('Este es un label muy largo que debería mostrarse correctamente')
      ).toBeDefined();
    });
  });

  describe('AccesiAccessibilitybilidad', () => {
    it('should associate the label with the input', () => {
      render(<InputField {...defaultProps} />);

      const label = screen.getByText('Email');
      const input = screen.getByPlaceholderText('Enter your email');

      expect(label.tagName).toBe('LABEL');
      expect(input.tagName).toBe('INPUT');
    });

    it('should be accessible via keyboard', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter your email');
      input.focus();

      expect(document.activeElement).toBe(input);
    });
  });
});