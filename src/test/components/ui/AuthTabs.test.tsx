import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthTabs } from '../../../components/ui/AuthTabs';

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, className, ...props }: any) => (
      <button onClick={onClick} className={className} {...props}>
        {children}
      </button>
    ),
  },
}));

describe('AuthTabs', () => {
  const mockOnLoginClick = vi.fn();
  const mockOnRegisterClick = vi.fn();

  beforeEach(() => {
    mockOnLoginClick.mockClear();
    mockOnRegisterClick.mockClear();
  });

  describe('Rendering', () => {
    it('should render both buttons', () => {
      render(
        <AuthTabs
          isLogin={true}
          onLoginClick={mockOnLoginClick}
          onRegisterClick={mockOnRegisterClick}
        />
      );

      expect(screen.getByText('Iniciar Sesión')).toBeDefined();
      expect(screen.getByText('Registrarse')).toBeDefined();
    });

    it('should render the container with the correct classes', () => {
      const { container } = render(
        <AuthTabs
          isLogin={true}
          onLoginClick={mockOnLoginClick}
          onRegisterClick={mockOnRegisterClick}
        />
      );

      const divContainer = container.querySelector('.flex.gap-2.mb-6');
      expect(divContainer).toBeDefined();
    });
  });

  describe('state isLogin=true', () => {
    it('should apply active styles to the login button', () => {
      render(
        <AuthTabs
          isLogin={true}
          onLoginClick={mockOnLoginClick}
          onRegisterClick={mockOnRegisterClick}
        />
      );

      const loginButton = screen.getByText('Iniciar Sesión');
      expect(loginButton.className).toContain('bg-purple-600');
      expect(loginButton.className).toContain('text-white');
      expect(loginButton.className).toContain('shadow-lg');
    });
  });

  describe('state isLogin=false', () => {
    it('should apply inactive styles to the login button', () => {
      render(
        <AuthTabs
          isLogin={false}
          onLoginClick={mockOnLoginClick}
          onRegisterClick={mockOnRegisterClick}
        />
      );

      const loginButton = screen.getByText('Iniciar Sesión');
      expect(loginButton.className).toContain('bg-gray-200');
      expect(loginButton.className).toContain('text-gray-600');
      expect(loginButton.className).not.toContain('shadow-lg');
    });
  });

  describe('Interactions', () => {
    it('should call onLongClick when the login button is clicked', () => {
      render(
        <AuthTabs
          isLogin={true}
          onLoginClick={mockOnLoginClick}
          onRegisterClick={mockOnRegisterClick}
        />
      );

      const loginButton = screen.getByText('Iniciar Sesión');
      fireEvent.click(loginButton);

      expect(mockOnLoginClick).toHaveBeenCalledTimes(1);
      expect(mockOnRegisterClick).not.toHaveBeenCalled();
    });

    it('should call onRegisterClick when the registration button is clicked', () => {
      render(
        <AuthTabs
          isLogin={true}
          onLoginClick={mockOnLoginClick}
          onRegisterClick={mockOnRegisterClick}
        />
      );

      const registerButton = screen.getByText('Registrarse');
      fireEvent.click(registerButton);

      expect(mockOnRegisterClick).toHaveBeenCalledTimes(1);
      expect(mockOnLoginClick).not.toHaveBeenCalled();
    });

    it('should allow multiple clicks on both buttons', () => {
      render(
        <AuthTabs
          isLogin={true}
          onLoginClick={mockOnLoginClick}
          onRegisterClick={mockOnRegisterClick}
        />
      );

      const loginButton = screen.getByText('Iniciar Sesión');
      const registerButton = screen.getByText('Registrarse');

      fireEvent.click(loginButton);
      fireEvent.click(registerButton);
      fireEvent.click(loginButton);

      expect(mockOnLoginClick).toHaveBeenCalledTimes(2);
      expect(mockOnRegisterClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Classes CSS', () => {
    it('should have the base classes in both buttons', () => {
      render(
        <AuthTabs
          isLogin={true}
          onLoginClick={mockOnLoginClick}
          onRegisterClick={mockOnRegisterClick}
        />
      );

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button.className).toContain('flex-1');
        expect(button.className).toContain('py-2');
        expect(button.className).toContain('px-4');
        expect(button.className).toContain('rounded-full');
        expect(button.className).toContain('font-bold');
        expect(button.className).toContain('transition-all');
      });
    });
  });

  describe('Accessibility', () => {
    it('hould have the role of button in both elements', () => {
      render(
        <AuthTabs
          isLogin={true}
          onLoginClick={mockOnLoginClick}
          onRegisterClick={mockOnRegisterClick}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('should have descriptive text on the buttons', () => {
      render(
        <AuthTabs
          isLogin={true}
          onLoginClick={mockOnLoginClick}
          onRegisterClick={mockOnRegisterClick}
        />
      );

      const loginButton = screen.getByText('Iniciar Sesión');
      const registerButton = screen.getByText('Registrarse');
      
      expect(loginButton).toBeDefined();
      expect(registerButton).toBeDefined();
      expect(loginButton.textContent).toBe('Iniciar Sesión');
      expect(registerButton.textContent).toBe('Registrarse');
    });
  });
});