export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string; // Agora é dinâmico
  salary: number;
  startDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string; // Agora é dinâmico
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
};

export type Document = {
  id: string;
  employeeId: string;
  employeeName: string;
  documentType: string; // Agora é dinâmico
  fileName: string;
  uploadDate: string;
  fileSize: string;
  fileDataUrl?: string; // optional base64/data URL for client-side download
};

export type RecentActivityItem = {
    id: string;
    userName: string;
    userAvatar: string;
    action: string;
    target: string;
    time: string;
}
