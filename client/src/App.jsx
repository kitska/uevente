import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Main from './pages/Main';
import Event from './pages/Event';
import Account from './pages/Account'
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './components/PasswordReset';
import EmailConfirmation from './components/EmailConfirmation';
import EmailSentPasswordReset from './components/EmailSentPasswordReset';
import Error from './pages/Error';
import ScrollToTop from './components/ScrollToTop';
import { AxiosInterceptor } from './services/index';

// Smooth appearing on scroll
import AOS from 'aos';
import 'aos/dist/aos.css'; // 🔥 required!
// fade-up
// fade-right
// zoom-in
// flip-left
// slide-up
// fade-down

function AppContent() {
    const location = useLocation(); // Get the current route
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        AOS.init({
            duration: 500,
            once: true,
            easing: 'ease-out-cubic'
        });

        // Optional: refresh on route change
        AOS.refresh();
    }, [location.pathname]);

    // You can uncomment and adjust this section to load the user as needed
    // useEffect(() => {
    //   const loadUser = async () => {
    //     try {
    //       const currentUser = await fetchCurrentUser();
    //       if (!currentUser) {
    //         userStore.logout(); // Ensure userStore handles logout properly
    //         return;
    //       }
    //       userStore.setUser(currentUser);
    //     } catch (error) {
    //       console.error('Failed to fetch user:', error);
    //       userStore.logout();
    //     } finally {
    //       setLoading(false); // End loading
    //     }
    //   };
    //   loadUser();
    // }, []);

    // If still loading, you can show a loading spinner
    // if (loading) {
    //   return <LoadingSpinner />;
    // }

    return (
        <div className='flex flex-col h-screen'>
            {/* Conditionally render Header only if the page is not login, register, password-reset, or error */}
            {location.pathname !== '/account' && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/password-reset' && location.pathname !== '/password-reset/:token' && location.pathname !== '/error' && <Header />}

            <main className='flex flex-col flex-grow'>
                <Routes>
                    <Route path='/' element={<Main />} />
                    <Route path="/event/:id" element={<Event />} />
                    <Route path='/account' element={<Account />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/password-reset' element={<EmailSentPasswordReset />} />
                    <Route path='/password-reset/:token' element={<ResetPassword />} />
                    <Route path='/confirm-email/:token' element={<EmailConfirmation />} />
                    <Route path='*' element={<Error />} />
                </Routes>
            </main>

            {/* Conditionally render Footer only if the page is not login, register, password-reset, or error */}
            {location.pathname !== '/account' && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/password-reset' && location.pathname !== '/password-reset/:token' && location.pathname !== '/error' && <Footer />}
        </div>
    );
}

function App() {
    return (
        <Router>
            <AxiosInterceptor />
            <ScrollToTop />
            <AppContent />
        </Router>
    );
}

export default App;
