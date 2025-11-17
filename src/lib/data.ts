import type { Employee, LeaveRequest, Document, RecentActivityItem } from './types';
import { subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const employees: Employee[] = [
  {
    id: 'emp-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    salary: 100000,
    startDate: '2023-01-15',
    status: 'Active',
  },
  {
    id: 'emp-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    jobTitle: 'Product Manager',
    department: 'Product',
    salary: 120000,
    startDate: '2022-11-20',
    status: 'Active',
  },
  {
    id: 'emp-3',
    firstName: 'Peter',
    lastName: 'Jones',
    email: 'peter.jones@example.com',
    jobTitle: 'Designer',
    department: 'Design',
    salary: 90000,
    startDate: '2023-03-10',
    status: 'On Leave',
  },
];

export const leaveRequests: LeaveRequest[] = [];

export const documents: Document[] = [];

export const recentActivities: RecentActivityItem[] = [];


// Data aggregation functions
export const getEmployeeStats = () => {
    const oneMonthAgo = subMonths(new Date(), 1);
    const totalEmployees = employees.filter(e => e.status !== 'Terminated').length;
    const newHires = employees.filter(e => new Date(e.startDate) > oneMonthAgo).length;
    const terminatedLastYear = employees.filter(e => e.status === 'Terminated' && new Date(e.startDate) > subMonths(new Date(), 12)).length;
    const avgEmployees = totalEmployees; // Simplified for mock data
    const turnoverRate = avgEmployees > 0 ? parseFloat(((terminatedLastYear / avgEmployees) * 100).toFixed(1)) : 0;

    return { totalEmployees, newHires, turnoverRate };
}

export const getLeaveStats = () => {
    const today = new Date();
    const onLeave = leaveRequests.filter(l => l.status === 'Approved' && new Date(l.startDate) <= today && new Date(l.endDate) >= today).length;
    const pendingRequests = leaveRequests.filter(l => l.status === 'Pending').length;
    return { onLeave, pendingRequests };
}

export const getHeadcountData = () => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
        const month = subMonths(new Date(), i);
        const monthKey = format(month, 'MMM', { locale: ptBR });
        const activeThisMonth = employees.filter(e => new Date(e.startDate) <= month && (e.status !== 'Terminated')).length;
        data.push({ name: monthKey, total: activeThisMonth });
    }
    return data;
}
