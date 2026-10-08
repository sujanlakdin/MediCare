import { CaregiverProfileData } from '@/components/caregiver/ProfileEditModal';

let currentCaregiverProfile: CaregiverProfileData = {
  name: 'Kasun Perera',
  age: '32',
  role: 'Primary Caregiver',
  email: 'kasun1234@gmail.com',
  phone: '0701982984',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
};

const listeners: Array<(profile: CaregiverProfileData) => void> = [];

export const caregiverProfileStore = {
  getProfile: (): CaregiverProfileData => currentCaregiverProfile,
  
  updateProfile: (newProfile: CaregiverProfileData) => {
    currentCaregiverProfile = { ...newProfile };
    listeners.forEach((listener) => listener(currentCaregiverProfile));
  },

  subscribe: (listener: (profile: CaregiverProfileData) => void) => {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  },
};
