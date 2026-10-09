import { CaregiverProfileData } from '@/components/caregiver/ProfileEditModal';

let currentUserId: string | null = null;
let currentCaregiverProfile: CaregiverProfileData = {
  name: 'Caregiver',
  age: '32',
  role: 'Primary Caregiver',
  email: 'caregiver@medicare.com',
  phone: '0701982984',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
};

const listeners: Array<(profile: CaregiverProfileData) => void> = [];

export const caregiverProfileStore = {
  getProfile: (): CaregiverProfileData => currentCaregiverProfile,

  syncFromUser: (user: any) => {
    if (!user) return;
    if (currentUserId !== user.id) {
      currentUserId = user.id;
      currentCaregiverProfile = {
        name: user.fullName || 'Primary Caregiver',
        age: user.age ? String(user.age) : '32',
        role: user.role === 'caregiver' ? 'Primary Caregiver' : 'Caregiver',
        email: user.email || 'caregiver@medicare.com',
        phone: user.phone || '0701982984',
        avatarUrl: user.profilePhotoUrl || currentCaregiverProfile.avatarUrl,
      };
      listeners.forEach((listener) => listener(currentCaregiverProfile));
    }
  },

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

