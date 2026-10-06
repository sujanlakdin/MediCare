import { authService } from "./authService";
import { API_BASE_URL } from "./api-config";

/**
 * Member 1: Profile & Accessibility Service
 * Communicates with /api/profile endpoints on the MediCare backend.
 * Provides the 2 Mandatory CRUD Operations:
 * 1. Profile CRUD: Read profile, Update personal & medical contact details
 * 2. Accessibility CRUD: Read settings, Update elderly accessibility preferences
 */

export const API_PROFILE_URL = `${API_BASE_URL}/api/profile`;

// Listeners for dynamic theme/accessibility changes across screens
const listeners = new Set();

export const profileService = {
  /**
   * Subscribe to accessibility / profile changes
   */
  subscribe: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  notify: (data) => {
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.warn("Listener error:", err);
      }
    });
  },

  /**
   * CRUD Operation 1 (Read):
   * Fetch profile details and accessibility settings from MongoDB backend
   */
  getProfile: async (userId = "current") => {
    try {
      const response = await fetch(`${API_PROFILE_URL}/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile.");
      }

      if (data.user) {
        authService.setCurrentUser(data.user);
        profileService.notify(data.user);
        return data.user;
      }
      return data;
    } catch (error) {
      console.warn("profileService.getProfile backend fallback:", error.message);
      // Fallback to active local session (Chathura Rajapakse, 72 yrs)
      return authService.getCurrentUser();
    }
  },

  /**
   * CRUD Operation 1 (Update):
   * Update personal & medical contact details (FullName, Age, Phone, Address, Medical ID)
   */
  updateProfile: async (userId, updatedFields) => {
    try {
      const targetId = userId || authService.getCurrentUser()._id || "current";
      const response = await fetch(`${API_PROFILE_URL}/${targetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile details.");
      }

      if (data.user) {
        authService.setCurrentUser(data.user);
        profileService.notify(data.user);
        return data.user;
      }
      return data;
    } catch (error) {
      console.warn("profileService.updateProfile backend fallback:", error.message);
      // Offline fallback: Update local state
      const current = authService.getCurrentUser();
      const merged = {
        ...current,
        ...updatedFields,
        age: updatedFields.age !== undefined ? Number(updatedFields.age) : current.age,
      };
      authService.setCurrentUser(merged);
      profileService.notify(merged);
      return merged;
    }
  },

  /**
   * CRUD Operation 2 (Update):
   * Update elderly accessibility toggle preferences:
   * (highContrast, largerTouchTargets, voiceAssistance, reduceMotion, simpleLanguage, textSize)
   */
  updateAccessibility: async (userId, accessibilityPreferences) => {
    try {
      const targetId = userId || authService.getCurrentUser()._id || "current";
      const response = await fetch(`${API_PROFILE_URL}/${targetId}/accessibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accessibilityPreferences),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update accessibility preferences.");
      }

      if (data.user) {
        authService.setCurrentUser(data.user);
        profileService.notify(data.user);
        return data.user.accessibilitySettings;
      }
      return data.accessibilitySettings;
    } catch (error) {
      console.warn("profileService.updateAccessibility backend fallback:", error.message);
      // Offline fallback
      const current = authService.getCurrentUser();
      const updatedSettings = {
        ...(current.accessibilitySettings || {}),
        ...accessibilityPreferences,
      };
      const merged = {
        ...current,
        accessibilitySettings: updatedSettings,
      };
      authService.setCurrentUser(merged);
      profileService.notify(merged);
      return updatedSettings;
    }
  },
};

export default profileService;
