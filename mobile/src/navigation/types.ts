export type AuthStackParamList = {
  Splash: undefined;
  PhoneLogin: undefined;
  Register: undefined;
  OTPVerify: { phone: string; devOtp?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  RechargeTab: { serviceType?: string } | undefined;
  WalletTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  AddMoney: undefined;
  Withdraw: undefined;
  TransactionHistory: undefined;
};
