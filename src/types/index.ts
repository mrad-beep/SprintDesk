export type Priority = 'low' | 'medium' | 'high';
export type ColumnId = 'backlog' | 'in_progress' | 'review' | 'done';

export interface User {
  id: number;
  name: string;
  avatar: string;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: ColumnId;
  priority: Priority;
  assigneeId: number;
  dueDate: string;
  sprint: string;
  createdAt: string;
  comments: Comment[];
}

export interface SprintDataset {
  users: User[];
  tasks: Task[];
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

export interface LoginResponse extends AuthUser {
  accessToken: string;
  refreshToken: string;
}

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  message: string;
}
