import axios from 'axios';
import type { AppNotification } from '../types';

interface Post {
  id: number;
  title: string;
  body: string;
}

const client = axios.create({ baseURL: 'https://jsonplaceholder.typicode.com' });

// Notification polling source. Each poll re-fetches the same 5 posts;
// the store layer is responsible for diffing against known IDs to decide
// what's actually "new".
export const notificationApi = {
  fetchLatestPosts: async (): Promise<AppNotification[]> => {
    const { data } = await client.get<Post[]>('/posts', { params: { _limit: 5 } });
    return data.map((post) => ({
      id: post.id,
      title: post.title.length > 60 ? post.title.slice(0, 60) + '…' : post.title,
      body: post.body,
      read: false,
      createdAt: new Date().toISOString(),
    }));
  },
};
