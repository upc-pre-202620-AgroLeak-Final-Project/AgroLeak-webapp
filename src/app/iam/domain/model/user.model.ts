export type Role = 'ADMIN' | 'FARMER' | 'TECHNICIAN';
export interface User { id: string; firstName: string; lastName: string; email: string; role: Role; }
