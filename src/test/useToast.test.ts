import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../hooks/useToast';
import { useToastStore } from '../store/toastStore';

describe('useToast', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('adds a toast with showToast', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Saved successfully', 'success');
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Saved successfully');
    expect(result.current.toasts[0].variant).toBe('success');
  });

  it('defaults variant to info when not provided', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Just info');
    });
    expect(result.current.toasts[0].variant).toBe('info');
  });

  it('dismisses a toast by id', () => {
    const { result } = renderHook(() => useToast());
    let id = '';
    act(() => {
      id = result.current.showToast('Bye soon');
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      result.current.dismiss(id);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('supports multiple concurrent toasts', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('One');
      result.current.showToast('Two');
    });
    expect(result.current.toasts).toHaveLength(2);
  });
});
