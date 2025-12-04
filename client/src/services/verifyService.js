import axios from "axios";
import { api } from "./index";

const API_URL = import.meta.env.VITE_API_URL;

export const getAllVerifyRequests = async (page = 1, limit = 20) => {
    try {
        const response = await api.get(`${API_URL}/verify`, {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch verify requests:", error);
        throw error;
    }
};

export const getVerifyRequestsByUser = async (userId) => {
    try {
        const response = await api.get(
            `${API_URL}/verify/user/${encodeURIComponent(userId)}`
        );
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user verify requests:", error);
        throw error;
    }
};

export const getVerifyRequestById = async (id) => {
    try {
        const response = await api.get(
            `${API_URL}/verify/${encodeURIComponent(id)}`
        );
        return response.data;
    } catch (error) {
        console.error("Failed to fetch verify request by ID:", error);
        throw error;
    }
};

export const createVerifyRequest = async (data) => {
    try {
        const response = await api.post(`${API_URL}/verify`, data);
        return response.data;
    } catch (error) {
        console.error("Failed to create verify request:", error);
        throw error;
    }
};

export const updateVerifyRequestStatus = async (id, data) => {
    try {
        const response = await api.patch(
            `${API_URL}/verify/${encodeURIComponent(id)}/status`,
            data
        );
        return response.data;
    } catch (error) {
        console.error("Failed to update verify request status:", error);
        throw error;
    }
};

export const deleteVerifyRequest = async (id) => {
    try {
        const response = await api.delete(
            `${API_URL}/verify/${encodeURIComponent(id)}`
        );
        return response.data;
    } catch (error) {
        console.error("Failed to delete verify request:", error);
        throw error;
    }
};
