import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const hapticImpact = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style });
    } catch (e) {
      console.warn('Haptics not available', e);
    }
  }
};

export const hapticVibrate = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.vibrate();
    } catch (e) {
      console.warn('Haptics not available', e);
    }
  }
};

export const hapticSuccess = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.notification({ type: 'SUCCESS' as any });
    } catch (e) {
      console.warn('Haptics not available', e);
    }
  }
};

export const hapticError = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.notification({ type: 'ERROR' as any });
    } catch (e) {
      console.warn('Haptics not available', e);
    }
  }
};
