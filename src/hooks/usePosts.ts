
import { useEffect, useState } from 'react';
import { useWebSockets } from '../contexts/WebSocketContext';

export const usePosts = () => {
  const { postsWs } = useWebSockets();
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleList = (msg: any) => {
      if (msg.posts) setPosts(msg.posts);
    };

    const handleCreated = (msg: any) => {
      if (msg.post) {
        setPosts((prev) => [...prev, msg.post]);
      }
    };

    const handleError = (msg: any) => {
      if (msg.message) setError(msg.message);
    };

    postsWs.on('posts_list', handleList);
    postsWs.on('post.created', handleCreated);
    postsWs.on('error', handleError);

    return () => {
      postsWs.off('posts_list', handleList);
      postsWs.off('post.created', handleCreated);
      postsWs.off('error', handleError);
    };
  }, [postsWs]);

  const getMyListings = () => {
    const myUserId = parseInt(localStorage.getItem('user_id') || "0");
    return posts.filter(post => post.seller === myUserId);
  };

  return { posts, error, getMyListings };
};