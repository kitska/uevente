import { makeAutoObservable, runInAction } from 'mobx';
// import axios from "axios"; // Предполагается, что вы используете axios для запросов
import { api } from '../services';
import { createUser, getUser, updateUser, requestPasswordReset, createFullUser } from '../services/userService';
// import { useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

class UserStore {
	user = null; // Хранит информацию о текущем пользователе
	loading = false; // Состояние загрузки
	error = null; // Ошибка, если она возникла
	notification = null;
	
	subscriptions = [];
	// navigate = useNavigate();

	constructor() {
		makeAutoObservable(this);
	}

	// Метод для регистрации пользователя
	async register(fullName, email, password, login) {
		this.loading = true; // Устанавливаем состояние загрузки
		this.error = null; // Сбрасываем ошибку

		try {
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
	async createOauthUser(fullName, email, password, login, profilePicture, isAdmin, isShowName, rating, isEmailConfirmed) {
		this.loading = true; // Устанавливаем состояние загрузки
		this.error = null; // Сбрасываем ошибку

		try {
			const response = await createFullUser(fullName, email, password, login, profilePicture, isAdmin, isShowName, rating, isEmailConfirmed);

			// Если регистрация успешна, сохраняем пользователя
			runInAction(() => {
				// this.user = response.data.user; // Предполагается, что сервер возвращает объект пользователя
			});
			const response2 = await getUser(email, password, login);
			runInAction(() => {
				// console.log(response);
				localStorage.setItem('token', response2.token);
				// const decoded = jwtDecode(response.token); // Предполагается, что сервер возвращает объект пользователя
				// this.user = decoded;
				// console.log(response.userData);
				this.user = response2.userData;
				// console.log(this.user);
			});
			// console.log(response);
			return response2.message; // Возвращаем сообщение от сервера
		} catch (error) {
			runInAction(() => {
				this.error = error.response ? error.response.data.error : 'Oauth failed'; // Обработка ошибки
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
				localStorage.clear();
				this.user = null; // Сбрасываем пользователя
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
				this.user = response.user;
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
			// console.log(this.user.email);
			const response = await requestPasswordReset(this.user.email);
			this.setNotification(response.message || 'Password reset link sent! Check your email.', 'success');
		} catch (error) {
			this.setNotification(error.response?.data?.message || 'Failed to send reset link.', 'error');
		}
	}

	async oauth(type, data) {
		let status = null;
		// console.log(data);
		try {
			switch (type) {
				case "google":
					await this.login(data.email, this.#passwordPrikol(data.id), data.email);
					break;
				case 'github':
					await this.login(data.login, this.#passwordPrikol(data.id), data.login);
					break;
				case 'discord':
					await this.login(data.email, this.#passwordPrikol(data.id), data.username);
					break;
				default:
					break;
			}
			status = "OK";
		} catch (error) {
			// console.log(error);
			if (error.response.status === 401) {
				toast("Account already exists");
				status = "NEOK";
			}
			else if(error.response.status === 400) {
				switch (type) {
					case "google":
						await this.createOauthUser(data.name, data.email, this.#passwordPrikol(data.id), data.email, data.picture, false, true, 0, data.verified_email);
						break;
					case 'github':
						await this.createOauthUser(data.name, data.email ? data.email : data.login, this.#passwordPrikol(data.id), data.login, data.avatar_url, false, true, 0, true);
						break;
					case 'discord':
						// await this.createOauthUser(data.name, data.email ? data.email : data.login, this.#passwordPrikol(data.id), data.login, data.avatar_url, false, true, 0, true);
						await this.createOauthUser(data.global_name, data.email, this.#passwordPrikol(data.id), data.username, `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}`, false, true, 0, data.verified);
						break;
					default:
						break;
				}
				status = "OK";
			} else {
				toast("An error occured");
				status = "NEOK";
			}
		}
		return status;
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
	setSubscriptions(subs) {
        this.subscriptions = subs;
    }

	isEventSubscribed(id) {
		for(let sub of this.subscriptions) {
			if(sub.event.id === id) return true;
		}
		return false;
	}
	removeSub(event) {
		this.subscriptions = this.subscriptions.filter(function(item) {
			return item.event.id !== event.id
		})
	}

	addSub(event) {
		this.subscriptions.push({'id': null, event})
	}

	#passwordPrikol(password) {
		return String(Number(password) * 3).split("").reverse().join("");
	}
}

export const userStore = new UserStore();
