/*App.js*/

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Main from './pages/Main';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './components/PasswordReset';
import EmailConfirmation from './components/EmailConfirmation';
import EmailSentPasswordReset from './components/EmailSentPasswordReset';
import Error from './pages/Error';
import { AxiosInterceptor } from './services/index';
function AppContent() {
    // const [user, setUser] = useState(null); // Храним пользователя
    const [loading, setLoading] = useState(true); // Флаг загрузки

    // useEffect(() => {
    //   const loadUser = async () => {
    //     try {
    //       const currentUser = await fetchCurrentUser();
    //       if (!currentUser) {
    //         userStore.logout(); // Ensure userStore handles logout properly
    //         return;
    //       }
    //       userStore.setUser(currentUser);
    //       // userStore.user = currentUser;
    //       // setUser(currentUser); // Устанавливаем пользователя
    //     } catch (error) {
    //       console.error('Failed to fetch user:', error);
    //       userStore.logout();
    //     } finally {
    //       setLoading(false); // Завершаем загрузку
    //     }
    //   };
    //   // if (localStorage.getItem('token')) loadUser();
    //   loadUser();
    // }, []);

    // if (loading) {
    //   return <LoadingSpinner />;
    // }

    return (
        <div className='flex flex-col h-screen'>
            <Header /> {/* Передаем пользователя в Header */}
            <main className='flex flex-col flex-grow'>
                <Routes>
                    <Route path='/' element={<Main />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/auth/github/callback' element={<Login />}/>
                    <Route path='/auth/discord/callback' element={<Login />}/>
                    <Route path='/register' element={<Register />} />
                    <Route path='/password-reset' element={<EmailSentPasswordReset />} />
                    <Route path='/password-reset/:token' element={<ResetPassword />} />
                    <Route path='/confirm-email/:token' element={<EmailConfirmation />} />
                    <Route path='*' element={<Error />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <Router>
            <AxiosInterceptor />
            <AppContent />
        </Router>
    );
}
export default App;
