import { makeAutoObservable, runInAction } from 'mobx';
// import axios from "axios"; // Предполагается, что вы используете axios для запросов
import { api } from '../services';
import { createUser, getUser, updateUser, requestPasswordReset } from '../services/userService';
// import { jwtDecode } from 'jwt-decode';

class UserStore {
	user = null; // Хранит информацию о текущем пользователе
	loading = false; // Состояние загрузки
	error = null; // Ошибка, если она возникла
	notification = null;

	constructor() {
		makeAutoObservable(this);
	}

	// Метод для регистрации пользователя
	async register(fullName, email, password, login) {
		this.loading = true; // Устанавливаем состояние загрузки
		this.error = null; // Сбрасываем ошибку

		try {
			// const response = await api.post(`${API_URL}/register/`, {
			//     email,
			//     username,
			//     fullName,
			//     password
			// });
			const response = await createUser(fullName, email, password, login);

			// Если регистрация успешна, сохраняем пользователя
			runInAction(() => {
				// this.user = response.data.user; // Предполагается, что сервер возвращает объект пользователя
			});
			// console.log(response);
			return response.message; // Возвращаем сообщение от сервера
		} catch (error) {
			runInAction(() => {
				this.error = error.response ? error.response.data.error : 'Registration failed'; // Обработка ошибки
			});
			throw error; // Пробрасываем ошибку дальше
		} finally {
			runInAction(() => {
				this.loading = false; // Сбрасываем состояние загрузки
			});
		}
	}

	async login(email, password, login) {
		this.loading = true; // Устанавливаем состояние загрузки
		this.error = null; // Сбрасываем ошибку

		try {
			// const response = await api.post(`${API_URL}/register/`, {
			//     email,
			//     username,
			//     fullName,
			//     password
			// });
			const response = await getUser(email, password, login);

			// Если регистрация успешна, сохраняем пользователя
			runInAction(() => {
				// console.log(response);
				localStorage.setItem('token', response.token);
				// const decoded = jwtDecode(response.token); // Предполагается, что сервер возвращает объект пользователя
				// this.user = decoded;
				// console.log(response.userData);
				this.user = response.userData;
				// console.log(this.user);
			});

			return response.message; // Возвращаем сообщение от сервера
		} catch (error) {
			runInAction(() => {
				this.error = error.response ? error.response.message : 'Login failed'; // Обработка ошибки
			});
			throw error; // Пробрасываем ошибку дальше
		} finally {
			runInAction(() => {
				this.loading = false; // Сбрасываем состояние загрузки
			});
		}
	}

	// Метод для выхода из системы
	async logout() {
		try {
			// await api.post('/api/logout');
			runInAction(() => {
				// console.log(this.user);
				this.user = null; // Сбрасываем пользователя
				localStorage.clear();
				// calendarStore.clearCalendars();
			});
		} catch (error) {
			console.error('Logout failed', error);
		}
	}

	async updateUser(updatedData) {
		if (!this.user) return;

		try {
			const response = await updateUser(this.user.id, updatedData);
			runInAction(() => {
				this.user = response;
			});
		} catch (error) {
			console.error('Failed to update user:', error);
		}
	}

	async requestPasswordReset() {
		if (!this.user?.email) {
			this.setNotification('Email not found. Please try again.', 'error');
			return;
		}

		try {
			console.log(this.user.email);
			const response = await requestPasswordReset(this.user.email);
			this.setNotification(response.message || 'Password reset link sent! Check your email.', 'success');
		} catch (error) {
			this.setNotification(error.response?.data?.message || 'Failed to send reset link.', 'error');
		}
	}

	setNotification(message, type = 'info') {
		this.notification = { message, type };
		setTimeout(() => {
			runInAction(() => {
				this.notification = null; // Очищаем через 5 секунд
			});
		}, 5000);
	}

	// Метод для получения информации о пользователе
	async fetchUser() {
		try {
			const response = await api.get('/api/user');
			runInAction(() => {
				this.user = response.data.user; // Сохраняем информацию о пользователе
			});
		} catch (error) {
			console.error('Fetch user failed', error);
		}
	}
	setUser(userData) {
		this.user = userData;
	}
}

export const userStore = new UserStore();
