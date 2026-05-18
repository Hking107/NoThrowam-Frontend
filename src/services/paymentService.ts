import { authService } from "./authService";
import { API_BASE_URL as API_BASE } from "../config/api";

type Operator = "Orange_Cameroon" | "MTN_Cameroon";

export interface PaymentRecord {
    id: number;
    status: "PENDING" | "SUCCESSFUL" | "FAILED";
    transaction_id?: string;
    post_id?: number;
    [key: string]: any;
}

export interface InitiatePaymentResult {
    payment: PaymentRecord;
    alreadyExists: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const getHeaders = async () => {
    const token = await authService.getAccessToken();
    return {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
    };
};

/** Read the JSON body and surface the real error message from the backend. */
async function extractError(res: Response): Promise<string> {
    try {
        const body = await res.json();
        return (
            body?.detail ||
            body?.message ||
            body?.error ||
            `Erreur ${res.status}`
        );
    } catch {
        return `Erreur ${res.status}`;
    }
}

// ---------------------------------------------------------------------------
// Payment Service
// ---------------------------------------------------------------------------
export const PaymentService = {
    /**
     * Initiate a payment for a post.
     *
     * - 201 → new payment, alreadyExists = false
     * - 200 → duplicate payment for this post/customer, alreadyExists = true
     * - 400/502 → throws with the real backend message
     */
    initiatePayment: async (
        postId: number,
        phoneNumber: string,
        operator: Operator
    ): Promise<InitiatePaymentResult> => {
        const makeRequest = async () =>
            fetch(`${API_BASE}/api/v0/payments/initiate/`, {
                method: "POST",
                headers: await getHeaders(),
                body: JSON.stringify({
                    post_id: postId,
                    phone_number: phoneNumber,
                    operator,
                }),
            });

        let response = await makeRequest();

        // Token expired → refresh once
        if (response.status === 401) {
            try {
                await authService.refresh();
                response = await makeRequest();
            } catch {
                authService.logout();
                throw new Error("Session expirée. Veuillez vous reconnecter.");
            }
        }

        if (response.status === 201) {
            const data = await response.json();
            return { payment: data.payment ?? data, alreadyExists: false };
        }

        if (response.status === 200) {
            // Backend signals: "Payment already exists for this post"
            const data = await response.json();
            return { payment: data.payment ?? data, alreadyExists: true };
        }

        // Any other non-OK status → surface the real backend message
        const msg = await extractError(response);
        throw new Error(msg);
    },

    /**
     * Manually verify the current status of a payment.
     *
     * - SUCCESSFUL → payment is confirmed
     * - PENDING    → still waiting for mobile confirmation
     * - FAILED     → payment failed, allow retry
     */
    verifyPayment: async (paymentId: number): Promise<PaymentRecord> => {
        const makeRequest = async () =>
            fetch(`${API_BASE}/api/v0/payments/verify/`, {
                method: "POST",
                headers: await getHeaders(),
                body: JSON.stringify({ payment_id: paymentId }),
            });

        let response = await makeRequest();

        if (response.status === 401) {
            try {
                await authService.refresh();
                response = await makeRequest();
            } catch {
                authService.logout();
                throw new Error("Session expirée. Veuillez vous reconnecter.");
            }
        }

        if (!response.ok) {
            const msg = await extractError(response);
            throw new Error(msg);
        }

        const data = await response.json();
        // Backend returns the payment object directly or nested under `.payment`
        return data.payment ?? data;
    },
};