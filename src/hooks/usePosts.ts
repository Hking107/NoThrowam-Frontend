import { useEffect, useState } from 'react';
import { useWebSocket } from '../WebSocketProvider';

export const usePosts = () => {
  const { postsWs } = useWebSocket();
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postsWs) return;

    const handleInitialList = (msg: any) => {
      setPosts(msg.posts || msg.data);
    };

    const handleNewPost = (msg: any) => {
      const post = msg.post || msg.data || msg;
      setPosts((prev) => [post, ...prev]);
    };

    const handleError = (msg: any) => {
      setError(msg.message || "Unknown error");
    };

    postsWs.on('post_list', handleInitialList);
    postsWs.on('posts_list', handleInitialList);
    postsWs.on('post.created', handleNewPost);
    postsWs.on('post_created', handleNewPost);
    postsWs.on('error', handleError);

    return () => {
      postsWs.off('post_list', handleInitialList);
      postsWs.off('posts_list', handleInitialList);
      postsWs.off('post.created', handleNewPost);
      postsWs.off('post_created', handleNewPost);
      postsWs.off('error', handleError);
    };
  }, [postsWs]);

  const getMyListings = () => {
    const myUserId = parseInt(localStorage.getItem('user_id') || "0");
    return posts.filter(post => post.seller === myUserId);
  };

  return { posts, error, getMyListings };
};