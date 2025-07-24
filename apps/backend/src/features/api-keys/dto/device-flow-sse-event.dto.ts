export interface DeviceFlowSSEEvent {
  type: 'initiated' | 'pending' | 'success' | 'error' | 'expired';
  message: string;

  // Device flow initiation data (type: 'initiated')
  deviceCode?: string;
  userCode?: string;
  verificationUri?: string;
  expiresAt?: number;

  // Success data (type: 'success')
  accessToken?: string;
}
