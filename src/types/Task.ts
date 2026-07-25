import { Timestamp } from 'firebase/firestore';

export interface EmployeeInfo {
  employeeId: string;
  name: string;
  role: string;
  email?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  completedBy?: EmployeeInfo; // "Done By Whom" attribution
  lastEditedBy?: EmployeeInfo; // Last edited attribution
  lastUpdatedAt?: Timestamp;
}
