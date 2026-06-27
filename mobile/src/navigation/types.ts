export type AuthStackParamList = {
  Splash: undefined;
  PhoneLogin: undefined;
  Register: undefined;
  OTPVerify: { phone: string; devOtp?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  RechargeTab: undefined;
  WalletTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};
