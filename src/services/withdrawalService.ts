import { API_PAYMENTS_URL } from "../config/api";
import { authService } from "./authService";

// Toggle this to true for development/testing when the backend is not ready
const SIMULATE = false;
const SIMULATED_STARTING_BALANCE = 50000;
const simulatedChallenges = new Map<
  string,
  Pick<WithdrawalInitiatePayload, "amount" | "operator">
>();

export interface WithdrawalInitiatePayload {
  amount: string;
  phone_number: string;
  operator: "MTN_Cameroon" | "Orange_Cameroon";
}

export interface WithdrawalInitiateResponse {
  detail: string;
  challenge_id: string;
  withdrawal_id: string;
  amount: string;
  operator: string;
  available_balance?: string; // Returned on 400 Insufficient Balance
}

export interface WithdrawalConfirmPayload {
  challenge_id: string;
  otp_code: string;
}

export interface WithdrawalConfirmResponse {
  detail: string;
  amount: string;
  operator: string;
  reference_id: string;
  new_balance?: string;
  provider_response?: unknown;
  statusCode?: number;
}

export interface SellerPayment {
  id: number;
  post: number;
  customer: number;
  transaction_id: string;
  amount: string;
  commission: string;
  seller_credit: string;
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  created_at: string;
  updated_at: string;
}

const getAuthHeaders = async () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${authService.getAccessToken()}`,
  "ngrok-skip-browser-warning": "69420",
});

const readErrorMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  const errorData = await response.json().catch(() => ({}));
  if (typeof errorData.detail === "string") return errorData.detail;
  if (typeof errorData.message === "string") return errorData.message;
  if (typeof errorData.reason === "string") return errorData.reason;
  if (typeof errorData.available_balance === "string") {
    return `Insufficient balance. Available: ${errorData.available_balance} FCFA`;
  }
  return fallback;
};

export const withdrawalService = {
  /**
   * Request a withdrawal challenge (Step 1)
   */
  initiate: async (
    payload: WithdrawalInitiatePayload,
  ): Promise<WithdrawalInitiateResponse> => {
    if (SIMULATE) {
      console.log("[WithdrawalService] SIMULATING initiate:", payload);
      await new Promise((resolve) => setTimeout(resolve, 900));

      // Simulate Insufficient Balance
      if (parseFloat(payload.amount) > 50000) {
        throw new Error("Insufficient balance. Available: 50000.00 FCFA");
      }

      const challengeId =
        "simulated-challenge-" + Math.random().toString(36).substring(2, 11);

      simulatedChallenges.set(challengeId, {
        amount: payload.amount,
        operator: payload.operator,
      });

      return {
        detail: "OTP sent to your email. Please confirm your withdrawal.",
        challenge_id: challengeId,
        withdrawal_id:
          "simulated-withdrawal-" + Math.random().toString(36).substring(2, 11),
        amount: payload.amount,
        operator: payload.operator,
      };
    }

    const makeRequest = async () => {
      return fetch(`${API_PAYMENTS_URL}/withdrawals/initiate/`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload),
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

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, "Failed to initiate withdrawal"),
      );
    }

    return await response.json();
  },

  /**
   * Confirm the withdrawal with OTP (Step 2)
   */
  confirm: async (
    payload: WithdrawalConfirmPayload,
  ): Promise<WithdrawalConfirmResponse> => {
    if (SIMULATE) {
      console.log("[WithdrawalService] SIMULATING confirm:", payload);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const challenge = simulatedChallenges.get(payload.challenge_id);
      const amount = challenge?.amount || "5000.00";
      const operator = challenge?.operator || "Orange_Cameroon";
      const newBalance = Math.max(
        SIMULATED_STARTING_BALANCE - parseFloat(amount),
        0,
      ).toFixed(2);

      if (payload.otp_code === "123456") {
        return {
          detail: "Withdrawal successful.",
          amount,
          operator,
          reference_id:
            "REF-" + Math.random().toString(36).toUpperCase().substring(2, 10),
          new_balance: newBalance,
          statusCode: 200,
        };
      } else if (payload.otp_code === "654321") {
        // Simulate Accepted but processing
        return {
          detail: "Withdrawal request accepted and is processing.",
          amount,
          operator,
          reference_id:
            "REF-PENDING-" +
            Math.random().toString(36).toUpperCase().substring(2, 10),
          provider_response: {},
          statusCode: 202,
        };
      } else {
        throw new Error("Invalid OTP code. Please check your email.");
      }
    }

    const makeRequest = async () => {
      return fetch(`${API_PAYMENTS_URL}/withdrawals/confirm/`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload),
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

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, "Failed to confirm withdrawal"),
      );
    }

    const data = await response.json();
    return { ...data, statusCode: response.status };
  },

  /**
   * Get seller payment history
   */
  getSellerPayments: async (sellerId: number): Promise<SellerPayment[]> => {
    if (SIMULATE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [
        {
          id: 1,
          post: 101,
          customer: 202,
          transaction_id: "txn_001",
          amount: "15000.00",
          commission: "750.00",
          seller_credit: "14250.00",
          status: "SUCCESSFUL",
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 2,
          post: 102,
          customer: 203,
          transaction_id: "txn_002",
          amount: "8000.00",
          commission: "400.00",
          seller_credit: "7600.00",
          status: "PENDING",
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        }
      ];
    }

    const makeRequest = async () => {
      return fetch(`${API_PAYMENTS_URL}/seller/${sellerId}/payments/`, {
        method: "GET",
        headers: await getAuthHeaders(),
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

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, "Failed to fetch payment history"),
      );
    }

    const data = await response.json();
    return data.results || [];
  },
};
