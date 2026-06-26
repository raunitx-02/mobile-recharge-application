import { create } from 'zustand';

interface Operator {
  id: string;
  name: string;
  color: string;
  type: string;
}

interface Plan {
  id: string;
  amount: number;
  validity: string;
  data: string;
  description: string;
  category: string;
  cashback?: number;
}

interface RechargeState {
  selectedOperator: Operator | null;
  selectedPlan: Plan | null;
  operators: Operator[];
  plans: Plan[];
  isLoadingOperators: boolean;
  isLoadingPlans: boolean;
  currentTxnId: string | null;
  currentStatus: 'idle' | 'processing' | 'success' | 'failed' | 'pending';
  setSelectedOperator: (op: Operator | null) => void;
  setSelectedPlan: (plan: Plan | null) => void;
  setOperators: (ops: Operator[]) => void;
  setPlans: (plans: Plan[]) => void;
  setLoadingOperators: (loading: boolean) => void;
  setLoadingPlans: (loading: boolean) => void;
  setCurrentTxn: (txnId: string, status: RechargeState['currentStatus']) => void;
  reset: () => void;
}

export const useRechargeStore = create<RechargeState>()((set) => ({
  selectedOperator: null,
  selectedPlan: null,
  operators: [],
  plans: [],
  isLoadingOperators: false,
  isLoadingPlans: false,
  currentTxnId: null,
  currentStatus: 'idle',

  setSelectedOperator: (op) => set({ selectedOperator: op }),
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setOperators: (ops) => set({ operators: ops }),
  setPlans: (plans) => set({ plans }),
  setLoadingOperators: (loading) => set({ isLoadingOperators: loading }),
  setLoadingPlans: (loading) => set({ isLoadingPlans: loading }),
  setCurrentTxn: (txnId, status) =>
    set({ currentTxnId: txnId, currentStatus: status }),
  reset: () =>
    set({
      selectedOperator: null,
      selectedPlan: null,
      plans: [],
      currentTxnId: null,
      currentStatus: 'idle',
    }),
}));
