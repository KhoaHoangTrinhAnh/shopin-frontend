/**
 * UI Store Unit Tests
 */

import { useUIStore } from '../ui.store';

describe('UIStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useUIStore.getState().reset();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useUIStore.getState();

      expect(state.toasts).toEqual([]);
      expect(state.modals).toEqual({});
      expect(state.isSearchOpen).toBe(false);
      expect(state.isSidebarOpen).toBe(false);
      expect(state.isMobileMenuOpen).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.theme).toBe('system');
    });
  });

  describe('Toast Actions', () => {
    it('should add a toast', () => {
      useUIStore.getState().showToast('Test message', 'success');

      const state = useUIStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].message).toBe('Test message');
      expect(state.toasts[0].type).toBe('success');
    });

    it('should add toast with default type of info', () => {
      useUIStore.getState().showToast('Info message');

      const state = useUIStore.getState();
      expect(state.toasts[0].type).toBe('info');
    });

    it('should remove a toast by id', () => {
      useUIStore.getState().showToast('Toast 1', 'info');
      useUIStore.getState().showToast('Toast 2', 'info');

      const toasts = useUIStore.getState().toasts;
      const toastId = toasts[0].id;

      useUIStore.getState().removeToast(toastId);

      const state = useUIStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].message).toBe('Toast 2');
    });

    it('should clear all toasts', () => {
      useUIStore.getState().showToast('Toast 1', 'info');
      useUIStore.getState().showToast('Toast 2', 'info');

      useUIStore.getState().clearToasts();

      const state = useUIStore.getState();
      expect(state.toasts).toEqual([]);
    });
  });

  describe('Modal Actions', () => {
    it('should open a modal', () => {
      useUIStore.getState().openModal('login');

      const state = useUIStore.getState();
      expect(state.modals['login']).toBeDefined();
      expect(state.modals['login'].isOpen).toBe(true);
    });

    it('should open a modal with data', () => {
      useUIStore.getState().openModal('confirm', { title: 'Delete Item' });

      const state = useUIStore.getState();
      expect(state.modals['confirm'].data).toEqual({ title: 'Delete Item' });
    });

    it('should close a modal', () => {
      useUIStore.getState().openModal('login');
      useUIStore.getState().closeModal('login');

      const state = useUIStore.getState();
      expect(state.modals['login'].isOpen).toBe(false);
    });

    it('should toggle a modal', () => {
      // First toggle - opens
      useUIStore.getState().toggleModal('menu');
      expect(useUIStore.getState().modals['menu']?.isOpen).toBe(true);

      // Second toggle - closes
      useUIStore.getState().toggleModal('menu');
      expect(useUIStore.getState().modals['menu']?.isOpen).toBe(false);
    });
  });

  describe('Search Actions', () => {
    it('should open search', () => {
      useUIStore.getState().openSearch();
      expect(useUIStore.getState().isSearchOpen).toBe(true);
    });

    it('should close search', () => {
      useUIStore.getState().openSearch();
      useUIStore.getState().closeSearch();
      expect(useUIStore.getState().isSearchOpen).toBe(false);
    });

    it('should toggle search', () => {
      useUIStore.getState().toggleSearch();
      expect(useUIStore.getState().isSearchOpen).toBe(true);

      useUIStore.getState().toggleSearch();
      expect(useUIStore.getState().isSearchOpen).toBe(false);
    });
  });

  describe('Sidebar Actions', () => {
    it('should open sidebar', () => {
      useUIStore.getState().openSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });

    it('should close sidebar', () => {
      useUIStore.getState().openSidebar();
      useUIStore.getState().closeSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });

    it('should toggle sidebar', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(true);

      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });
  });

  describe('Mobile Menu Actions', () => {
    it('should open mobile menu', () => {
      useUIStore.getState().openMobileMenu();
      expect(useUIStore.getState().isMobileMenuOpen).toBe(true);
    });

    it('should close mobile menu', () => {
      useUIStore.getState().openMobileMenu();
      useUIStore.getState().closeMobileMenu();
      expect(useUIStore.getState().isMobileMenuOpen).toBe(false);
    });

    it('should toggle mobile menu', () => {
      useUIStore.getState().toggleMobileMenu();
      expect(useUIStore.getState().isMobileMenuOpen).toBe(true);

      useUIStore.getState().toggleMobileMenu();
      expect(useUIStore.getState().isMobileMenuOpen).toBe(false);
    });
  });

  describe('Global Loading', () => {
    it('should set global loading state', () => {
      useUIStore.getState().setGlobalLoading(true);
      expect(useUIStore.getState().isLoading).toBe(true);

      useUIStore.getState().setGlobalLoading(false);
      expect(useUIStore.getState().isLoading).toBe(false);
    });
  });

  describe('Theme', () => {
    it('should set theme', () => {
      useUIStore.getState().setTheme('dark');
      expect(useUIStore.getState().theme).toBe('dark');

      useUIStore.getState().setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');

      useUIStore.getState().setTheme('system');
      expect(useUIStore.getState().theme).toBe('system');
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      // Set some state
      useUIStore.getState().showToast('Test', 'info');
      useUIStore.getState().openSearch();
      useUIStore.getState().openSidebar();
      useUIStore.getState().setTheme('dark');

      useUIStore.getState().reset();

      const state = useUIStore.getState();
      expect(state.toasts).toEqual([]);
      expect(state.isSearchOpen).toBe(false);
      expect(state.isSidebarOpen).toBe(false);
      expect(state.theme).toBe('system');
    });
  });
});
