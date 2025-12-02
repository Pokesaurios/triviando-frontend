import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthForm } from '../../../features/auth/AuthForm';
import { AuthFormState } from '../../../types/auth.types';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock('lucide-react', () => ({
  Mail: ({ className, size }: any) => (
    <svg data-testid="mail-icon" className={className} width={size} height={size}>
      <circle />
    </svg>
  ),
  Lock: ({ className, size }: any) => (
    <svg data-testid="lock-icon" className={className} width={size} height={size}>
      <circle />
    </svg>
  ),
  User: ({ className, size }: any) => (
    <svg data-testid="user-icon" className={className} width={size} height={size}>
      <circle />
    </svg>
  ),
}));

vi.mock('../../../components/ui/InputField', () => ({
  InputField: ({ label, value, onChange, placeholder, required, type }: any) => (
    <div data-testid={`input-field-${label}`}>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        data-testid={`input-${label}`}
      />
    </div>
  ),
}));

vi.mock('../../../components/ui/Button', () => ({
  Button: ({ children, disabled, type, className, onClick }: any) => (
    <button
      type={type}
      disabled={disabled}
      className={className}
      onClick={onClick}
      data-testid="submit-button"
    >
      {children}
    </button>
  ),
}));

vi.mock('../../../components/ui/Alert', () => ({
  Alert: ({ message }: any) => (
    <div data-testid="alert" data-type={message.type}>
      {message.text}
    </div>
  ),
}));

vi.mock('../../../components/ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('AuthForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnFieldChange = vi.fn();

  const defaultFormState: AuthFormState = {
    email: '',
    password: '',
    username: '',
    isLoading: false,
    message: null,
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnFieldChange.mockClear();
  });

  describe('Rendered in Login mode', () => {
    it('should render the email and password fields', () => {
      render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.getByText('Email')).toBeDefined();
      expect(screen.getByText('Contraseña')).toBeDefined();
    });

    it('should NOT render the username field in login mode', () => {
      render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.queryByText('Nombre de Usuario')).toBeNull();
    });

    it('should display the button text "¡Jugar Ahora!"', () => {
      render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.getByText('¡Jugar Ahora!')).toBeDefined();
    });
  });

  describe('should display the button text', () => {
    it('should render all fields, including username', () => {
      render(
        <AuthForm
          isLogin={false}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.getByText('Nombre de Usuario')).toBeDefined();
      expect(screen.getByText('Email')).toBeDefined();
      expect(screen.getByText('Contraseña')).toBeDefined();
    });

    it('should display the button text "¡Crear Cuenta!"', () => {
      render(
        <AuthForm
          isLogin={false}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.getByText('¡Crear Cuenta!')).toBeDefined();
    });
  });

  describe('Field values', () => {
    it('should display the formState values ​​in the inputs', () => {
      const formStateWithValues: AuthFormState = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        isLoading: false,
        message: null,
      };

      render(
        <AuthForm
          isLogin={false}
          formState={formStateWithValues}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const emailInput = screen.getByTestId('input-Email') as HTMLInputElement;
      const passwordInput = screen.getByTestId('input-Contraseña') as HTMLInputElement;
      const usernameInput = screen.getByTestId('input-Nombre de Usuario') as HTMLInputElement;

      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
      expect(usernameInput.value).toBe('testuser');
    });
  });

  describe('onFieldChange events', () => {
    it('should call onFieldChange with "email" when the email changes', () => {
      render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const emailInput = screen.getByTestId('input-Email');
      fireEvent.change(emailInput, { target: { value: 'new@email.com' } });

      expect(mockOnFieldChange).toHaveBeenCalledWith('email', 'new@email.com');
    });

    it('should call onFieldChange with "password" when the password changes', () => {
      render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const passwordInput = screen.getByTestId('input-Contraseña');
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

      expect(mockOnFieldChange).toHaveBeenCalledWith('password', 'newpassword');
    });

    it('should call onFieldChange with "username" when the username changes', () => {
      render(
        <AuthForm
          isLogin={false}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const usernameInput = screen.getByTestId('input-Nombre de Usuario');
      fireEvent.change(usernameInput, { target: { value: 'newusername' } });

      expect(mockOnFieldChange).toHaveBeenCalledWith('username', 'newusername');
    });
  });

  describe('onSubmit event', () => {
    it('should call onSubmit when the form is submitted', () => {
      render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const form = screen.getByTestId('submit-button').closest('form');
      fireEvent.submit(form!);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should prevent the forms default behavior.', () => {
      render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const form = screen.getByTestId('submit-button').closest('form');
      const event = new Event('submit', { bubbles: true, cancelable: true });
      form!.dispatchEvent(event);

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Loading status (isLoading)', () => {
    it('should display the LoadingSpinner when isLoading is true', () => {
      const loadingState: AuthFormState = {
        ...defaultFormState,
        isLoading: true,
      };

      render(
        <AuthForm
          isLogin={true}
          formState={loadingState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeDefined();
      expect(screen.queryByText('¡Jugar Ahora!')).toBeNull();
    });

    it('should disable the button when isLoading is true', () => {
      const loadingState: AuthFormState = {
        ...defaultFormState,
        isLoading: true,
      };

      render(
        <AuthForm
          isLogin={true}
          formState={loadingState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const button = screen.getByTestId('submit-button') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('should NOT show the LoadingSpinner when isLoading is false', () => {
      render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.queryByTestId('loading-spinner')).toBeNull();
      expect(screen.getByText('¡Jugar Ahora!')).toBeDefined();
    });
  });

  describe('Messages (Alert)', () => {
    it('should display "Alert" when there is an error message', () => {
      const stateWithError: AuthFormState = {
        ...defaultFormState,
        message: {
          type: 'error',
          text: 'Credenciales inválidas',
        },
      };

      render(
        <AuthForm
          isLogin={true}
          formState={stateWithError}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toBeDefined();
      expect(alert.getAttribute('data-type')).toBe('error');
      expect(screen.getByText('Credenciales inválidas')).toBeDefined();
    });

    it('should display "Alert" when there is a success message', () => {
      const stateWithSuccess: AuthFormState = {
        ...defaultFormState,
        message: {
          type: 'success',
          text: 'Inicio de sesión exitoso',
        },
      };

      render(
        <AuthForm
          isLogin={true}
          formState={stateWithSuccess}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toBeDefined();
      expect(alert.getAttribute('data-type')).toBe('success');
      expect(screen.getByText('Inicio de sesión exitoso')).toBeDefined();
    });

    it('should NOT display Alert when message is null', () => {
      render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.queryByTestId('alert')).toBeNull();
    });
  });

  describe('Required attributes', () => {
    it('Email and password should be required in login mode', () => {
      render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const emailInput = screen.getByTestId('input-Email') as HTMLInputElement;
      const passwordInput = screen.getByTestId('input-Contraseña') as HTMLInputElement;

      expect(emailInput.required).toBe(true);
      expect(passwordInput.required).toBe(true);
    });

    it('All fields should be required in registration mode', () => {
      render(
        <AuthForm
          isLogin={false}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const usernameInput = screen.getByTestId('input-Nombre de Usuario') as HTMLInputElement;
      const emailInput = screen.getByTestId('input-Email') as HTMLInputElement;
      const passwordInput = screen.getByTestId('input-Contraseña') as HTMLInputElement;

      expect(usernameInput.required).toBe(true);
      expect(emailInput.required).toBe(true);
      expect(passwordInput.required).toBe(true);
    });
  });

  describe('Form structure', () => {
    it('should have a form element', () => {
      const { container } = render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const form = container.querySelector('form');
      expect(form).toBeDefined();
    });

    it('should have the class space-y-4 in the form', () => {
      const { container } = render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const form = container.querySelector('form');
      expect(form?.className).toContain('space-y-4');
    });

    it('should have the w-full class button', () => {
      render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      const button = screen.getByTestId('submit-button');
      expect(button.className).toContain('w-full');
    });
  });

  describe('Transition between modes', () => {
    it('should add the username field when changing from login to registration', () => {
      const { rerender } = render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.queryByText('Nombre de Usuario')).toBeNull();

      rerender(
        <AuthForm
          isLogin={false}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.getByText('Nombre de Usuario')).toBeDefined();
    });

    it('should change the button text when changing modes', () => {
      const { rerender } = render(
        <AuthForm
          isLogin={true}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.getByText('¡Jugar Ahora!')).toBeDefined();

      rerender(
        <AuthForm
          isLogin={false}
          formState={defaultFormState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      expect(screen.getByText('¡Crear Cuenta!')).toBeDefined();
    });
  });

  describe('Full integration', () => {
    it('should work completely in login mode', () => {
      const formState: AuthFormState = {
        email: 'user@test.com',
        password: 'pass123',
        username: '',
        isLoading: false,
        message: null,
      };

      render(
        <AuthForm
          isLogin={true}
          formState={formState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      // Verificar campos
      expect(screen.getByText('Email')).toBeDefined();
      expect(screen.getByText('Contraseña')).toBeDefined();
      expect(screen.queryByText('Nombre de Usuario')).toBeNull();

      // Verificar valores
      const emailInput = screen.getByTestId('input-Email') as HTMLInputElement;
      expect(emailInput.value).toBe('user@test.com');

      // Verificar botón
      expect(screen.getByText('¡Jugar Ahora!')).toBeDefined();
    });

    it('should work completely in log mode with an error message', () => {
      const formState: AuthFormState = {
        email: 'new@test.com',
        password: 'newpass',
        username: 'newuser',
        isLoading: false,
        message: {
          type: 'error',
          text: 'El email ya existe',
        },
      };

      render(
        <AuthForm
          isLogin={false}
          formState={formState}
          onSubmit={mockOnSubmit}
          onFieldChange={mockOnFieldChange}
        />
      );

      // Verificar todos los campos
      expect(screen.getByText('Nombre de Usuario')).toBeDefined();
      expect(screen.getByText('Email')).toBeDefined();
      expect(screen.getByText('Contraseña')).toBeDefined();

      // Verificar mensaje de error
      expect(screen.getByText('El email ya existe')).toBeDefined();

      // Verificar botón
      expect(screen.getByText('¡Crear Cuenta!')).toBeDefined();
    });
  });
});