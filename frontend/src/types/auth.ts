export interface UserData {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  companyId?: string;
  companyName?: string;
  [key: string]: string | undefined; // for any additional properties
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userType: string | null;
  userData: UserData | null;
  login: (email: string, password: string, role: string) => Promise<{ success: boolean; data?: UserData; error?: string }>;
  register: (userData: Omit<UserData, '_id'>, type: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isTokenValid: (token: string | null) => boolean;
}
