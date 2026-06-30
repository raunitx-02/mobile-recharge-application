export type AuthStackParamList = {
  Splash: undefined;
  PhoneLogin: undefined;
  Register: undefined;
  OTPVerify: { phone: string; devOtp?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  RechargeTab: { serviceType?: string; phone?: string } | undefined;
  WalletTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  AddMoney: undefined;
  Withdraw: undefined;
  TransactionHistory: undefined;
  Checkout: {
    plan: {
      id: string | number;
      amount: number;
      validity: string;
      data?: string;
      description?: string;
      calls?: string;
      sms?: string;
      category?: string;
      kwikApiPlanId?: string | number;
    };
    phone: string;
    operator: string;
    circle: string;
    operatorKwikId?: number;
    type: 'prepaid' | 'postpaid' | 'dth';
  };
};
