
// const getHeaders = () => {
//   const token = localStorage.getItem("token");
//   return {
//     'accept': 'application/json',
//     'Authorization': `Bearer ${token}`,
//     'ngrok-skip-browser-warning': 'true',
//     'Content-Type': 'application/json'
//   };
// };

// export const wasteService = {
  
//   getMyListings: async () => {
//     const response = await fetch('/api/v0/waste-posts/my/', {
//       method: 'GET',
//       headers: getHeaders(),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch listings. Status: ${response.status}`);
//     }

//     const data = await response.json();
//     return Array.isArray(data) ? data : (data.results || []);
//   },

//   getProposals: async (listingId: number | string) => {
//     const response = await fetch(`/api/v0/waste-posts/${listingId}/proposals/`, {
//       method: 'GET',
//       headers: getHeaders(),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch proposals. Status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.proposals || [];
//   }


// };


import { WebSocketService } from "./webSocketService";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  };
};

export const wasteService = {
  
  getProposals: async (listingId: number | string) => {
    const response = await fetch(`/api/v0/waste-posts/${listingId}/proposals/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch proposals");
    const data = await response.json();
    return data.proposals || [];
  },

  createPost: (ws: WebSocketService, payload: any) => {
    ws.sendEvent('post.create', payload);
  },

  reportDeposit: (ws: WebSocketService, payload: any) => {
    ws.sendEvent('deposit.create', payload);
  }
};