import { authService } from "./authService";
import { WebSocketService } from "./webSocketService";
import type { WastePost } from "../types/WastePost";

import { API_BASE_URL as API_BASE } from "../config/api";

type Operator = "Orange_Cameroon" | "MTN_Cameroon";

const getHeaders = async () => {
    const token = await authService.getAccessToken();
    return {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
    };
};

// ---------------------------------------------------------------------------
// Payment Service
// ---------------------------------------------------------------------------
export const PaymentService = {

    initiatePayment: async (postId: number, phoneNumber: string, operator: Operator) => {
        const makeRequest = async () => {
            return fetch(`${API_BASE}/api/v0/payments/initiate/`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify({ post_id: postId, phone_number: phoneNumber, operator }),
            });
        };

        let response = await makeRequest();
        if (response.status === 401) {
            try {
                await authService.refresh();
                response = await makeRequest();
            } catch (err) {
                console.error("Refresh token failed", err);
                authService.logout();
                throw new Error("Session expired. Please login again.");
            }
        }
        if (!response.ok) throw new Error("Failed to initiate payment");
        return response.json();
    }
}