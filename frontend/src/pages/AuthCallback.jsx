import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

export default function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            authService.setToken(token);
            // Fetch user data and update context
            authService.getCurrentUser()
                .then(userData => {
                    setUser(userData);
                    // Check if there's a redirect destination
                    const redirectTo = sessionStorage.getItem('redirectAfterLogin');
                    if (redirectTo) {
                        sessionStorage.removeItem('redirectAfterLogin');
                        navigate(redirectTo);
                    } else {
                        navigate('/');
                    }
                })
                .catch(err => {
                    console.error('Failed to authenticate:', err);
                    navigate('/');
                });
        } else {
            navigate('/');
        }
    }, [location, navigate, setUser]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-xl font-semibold">Completing sign in...</p>
        </div>
    );
}
