import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Alert } from '../../../components/ui/Alert';
import { AuthMessage } from '../../../types/auth.types';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

vi.mock('lucide-react', () => ({
  AlertCircle: ({ size }: { size: number }) => (
    <svg data-testid="alert-circle-icon" width={size} height={size}>
      <circle />
    </svg>
  ),
  CheckCircle: ({ size }: { size: number }) => (
    <svg data-testid="check-circle-icon" width={size} height={size}>
      <circle />
    </svg>
  ),
}));

describe('Alert', () => {
  describe('Rendered with error message', () => {
    const errorMessage: AuthMessage = {
      type: 'error',
      text: 'Error al iniciar sesión',
    };

    it('should render the error message', () => {
      render(<Alert message={errorMessage} />);

      expect(screen.getByText('Error al iniciar sesión')).toBeDefined();
    });

    it('should display the Alert Circle icon for errors', () => {
      render(<Alert message={errorMessage} />);

      const icon = screen.getByTestId('alert-circle-icon');
      expect(icon).toBeDefined();
      expect(icon.getAttribute('width')).toBe('20');
      expect(icon.getAttribute('height')).toBe('20');
    });

    it('should apply error styles (red)', () => {
      const { container } = render(<Alert message={errorMessage} />);

      const alertDiv = container.querySelector('.bg-red-100.text-red-700');
      expect(alertDiv).toBeDefined();
    });

    it('should have the correct base classes', () => {
      const { container } = render(<Alert message={errorMessage} />);

      const alertDiv = container.querySelector('.flex.items-center.gap-2.p-3.rounded-lg');
      expect(alertDiv).toBeDefined();
    });
  });

  describe('Rendered with a message of success', () => {
    const successMessage: AuthMessage = {
      type: 'success',
      text: 'Inicio de sesión exitoso',
    };

    it('should render the success message', () => {
      render(<Alert message={successMessage} />);

      expect(screen.getByText('Inicio de sesión exitoso')).toBeDefined();
    });

    it('should display the Check Circle icon for success', () => {
      render(<Alert message={successMessage} />);

      const icon = screen.getByTestId('check-circle-icon');
      expect(icon).toBeDefined();
      expect(icon.getAttribute('width')).toBe('20');
      expect(icon.getAttribute('height')).toBe('20');
    });

    it('You should apply successful styles (green)', () => {
      const { container } = render(<Alert message={successMessage} />);

      const alertDiv = container.querySelector('.bg-green-100.text-green-700');
      expect(alertDiv).toBeDefined();
    });
  });

  describe('Component structure', () => {
    it('should have a span with the class text-sm and font-semibold', () => {
      const message: AuthMessage = {
        type: 'error',
        text: 'Mensaje de prueba',
      };

      const { container } = render(<Alert message={message} />);

      const span = container.querySelector('.text-sm.font-semibold');
      expect(span).toBeDefined();
      expect(span?.textContent).toBe('Mensaje de prueba');
    });

    it('should contain the icon and the text in the correct order.', () => {
      const message: AuthMessage = {
        type: 'success',
        text: 'Mensaje ordenado',
      };

      const { container } = render(<Alert message={message} />);

      const alertDiv = container.firstChild as HTMLElement;
      const children = Array.from(alertDiv.children);

      expect(children).toHaveLength(2);
      expect(children[0].tagName).toBe('svg'); // Icono primero
      expect(children[1].tagName).toBe('SPAN'); // Texto después
    });
  });

  describe('Different types of messages', () => {
    it('should handle long error messages', () => {
      const longErrorMessage: AuthMessage = {
        type: 'error',
        text: 'Este es un mensaje de error muy largo que debería mostrarse correctamente en el componente de alerta sin causar problemas de diseño',
      };

      render(<Alert message={longErrorMessage} />);

      const text = screen.getByText(/Este es un mensaje de error muy largo/);
      expect(text).toBeDefined();
    });

    it('should handle short success messages', () => {
      const shortSuccessMessage: AuthMessage = {
        type: 'success',
        text: 'OK',
      };

      render(<Alert message={shortSuccessMessage} />);

      expect(screen.getByText('OK')).toBeDefined();
    });

    it('should handle special characters in the message', () => {
      const specialCharsMessage: AuthMessage = {
        type: 'error',
        text: '¡Error! @#$%^&*() <>"\'',
      };

      render(<Alert message={specialCharsMessage} />);

      expect(screen.getByText('¡Error! @#$%^&*() <>"\'', { exact: true })).toBeDefined();
    });
  });

  describe('Message type changes', () => {
    it('should change from error to success correctly.', () => {
      const errorMessage: AuthMessage = {
        type: 'error',
        text: 'Error',
      };

      const { rerender, container } = render(<Alert message={errorMessage} />);

      expect(container.querySelector('.bg-red-100')).toBeDefined();
      expect(screen.getByTestId('alert-circle-icon')).toBeDefined();

      const successMessage: AuthMessage = {
        type: 'success',
        text: 'Éxito',
      };

      rerender(<Alert message={successMessage} />);

      expect(container.querySelector('.bg-green-100')).toBeDefined();
      expect(screen.getByTestId('check-circle-icon')).toBeDefined();
    });
  });

  describe('Accesibilidad y semántica', () => {
    it('should have the text visible', () => {
      const message: AuthMessage = {
        type: 'success',
        text: 'Mensaje visible',
      };

      render(<Alert message={message} />);

      const textElement = screen.getByText('Mensaje visible');
      expect(textElement.textContent).toBe('Mensaje visible');
    });

    it('should render the icon at the correct size', () => {
      const message: AuthMessage = {
        type: 'error',
        text: 'Test',
      };

      render(<Alert message={message} />);

      const icon = screen.getByTestId('alert-circle-icon');
      expect(icon.getAttribute('width')).toBe('20');
      expect(icon.getAttribute('height')).toBe('20');
    });
  });
});