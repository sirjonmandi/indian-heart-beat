import { store } from '../store';
import { logout } from '../store/slices/authSlice';

export const executeLogout = (): void => {
    store.dispatch(logout());
};