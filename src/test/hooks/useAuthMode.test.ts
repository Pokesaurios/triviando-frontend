import { renderHook, act } from '@testing-library/react';
import { useAuthMode } from '../../hooks/useAuthMode';

describe('useAuthMode', () => {
  it('should initialize with isLogin set to true', () => {
    const { result } = renderHook(() => useAuthMode());
    
    expect(result.current.isLogin).toBe(true);
  });

  it('should toggle between login and registration with toggleMode', () => {
    const { result } = renderHook(() => useAuthMode());
    
    expect(result.current.isLogin).toBe(true);
    
    act(() => {
      result.current.toggleMode();
    });
    
    expect(result.current.isLogin).toBe(false);
    
    act(() => {
      result.current.toggleMode();
    });
    
    expect(result.current.isLogin).toBe(true);
  });

  it('should switch to login mode with switchToLogin', () => {
    const { result } = renderHook(() => useAuthMode());
    
    // Primero cambiar a registro
    act(() => {
      result.current.switchToRegister();
    });
    
    expect(result.current.isLogin).toBe(false);
    
    // Luego cambiar a login
    act(() => {
      result.current.switchToLogin();
    });
    
    expect(result.current.isLogin).toBe(true);
  });

  it('should switch to registration mode with switchToRegister', () => {
    const { result } = renderHook(() => useAuthMode());
    
    expect(result.current.isLogin).toBe(true);
    
    act(() => {
      result.current.switchToRegister();
    });
    
    expect(result.current.isLogin).toBe(false);
  });

  it('should keep isLogin true when calling switchToLogin when already in login mode', () => {
    const { result } = renderHook(() => useAuthMode());
    
    expect(result.current.isLogin).toBe(true);
    
    act(() => {
      result.current.switchToLogin();
    });
    
    expect(result.current.isLogin).toBe(true);
  });

  it('should keep isLogin set to false when calling switchToRegister when you are already in registration mode', () => {
    const { result } = renderHook(() => useAuthMode());
    
    act(() => {
      result.current.switchToRegister();
    });
    
    expect(result.current.isLogin).toBe(false);
    
    act(() => {
      result.current.switchToRegister();
    });
    
    expect(result.current.isLogin).toBe(false);
  });

  it('should return all the expected functions and properties', () => {
    const { result } = renderHook(() => useAuthMode());
    
    expect(result.current).toHaveProperty('isLogin');
    expect(result.current).toHaveProperty('toggleMode');
    expect(result.current).toHaveProperty('switchToLogin');
    expect(result.current).toHaveProperty('switchToRegister');
    expect(typeof result.current.toggleMode).toBe('function');
    expect(typeof result.current.switchToLogin).toBe('function');
    expect(typeof result.current.switchToRegister).toBe('function');
  });
});