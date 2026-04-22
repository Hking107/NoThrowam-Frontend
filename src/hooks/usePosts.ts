import { useEffect, useState } from 'react';
import { useWebSocket } from '../WebSocketProvider';

export const usePosts = () => {
  const webSocketService = useWebSocket();
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si la connexion n'est pas prête, on ne fait rien
    if (!webSocketService) return;

    // On crée une fonction pour écouter tous les messages entrants
    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        
        // Adapte ces conditions selon la forme exacte des données envoyées par ton Django
        if (msg.posts || msg.type === 'posts_list') {
          setPosts(msg.posts || msg.data);
        } else if (msg.post || msg.type === 'post.created') {
          setPosts((prev) => [...prev, msg.post || msg.data]);
        } else if (msg.message && msg.type === 'error') {
          setError(msg.message);
        }
      } catch (err) {
        console.error("Erreur de parsing WebSocket:", err);
      }
    };

    const socketInstance = (webSocketService as any).socket; 
    
    if (socketInstance) {
        socketInstance.addEventListener('message', handleMessage);
    }

    // Nettoyage quand le composant est démonté
    return () => {
      if (socketInstance) {
          socketInstance.removeEventListener('message', handleMessage);
      }
    };
  }, [webSocketService]);

  const getMyListings = () => {
    const myUserId = parseInt(localStorage.getItem('user_id') || "0");
    return posts.filter(post => post.seller === myUserId);
  };

  return { posts, error, getMyListings };
};