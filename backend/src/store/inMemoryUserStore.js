const mongoose = require("mongoose");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function createDefaultSettings() {
  return {
    notificationSettings: {
      medicationReminders: true,
      reminderSound: true,
      vibration: true,
      missedMedicationAlerts: true,
      caregiverNotifications: true,
      preferredReminderTime: "09:00",
    },
    accessibilitySettings: {
      fontSize: "standard",
      highContrast: false,
      largerButtons: false,
      reduceMotion: false,
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },
  };
}

// In-memory user collection
const usersMap = new Map();

// Seed a default demo elderly user profile so demo accounts work offline
const demoId = new mongoose.Types.ObjectId("650000000000000000000001");
const demoDefaults = createDefaultSettings();
const demoUser = {
  _id: demoId,
  id: demoId.toString(),
  fullName: "Chathura Rajapakse",
  email: "chathura.rajapakse@medicare.com",
  // "$2a$12$4mU8i8fM3OqZt9a/W1V...": standard hash, or comparison hook
  passwordHash: "$2b$12$Kk3H38dG33wY8aQ0z4.4.OW5.j4XW7r5g7bH1YkR6wLz9lE8.1w.G",
  role: "patient",
  phone: "+94 77 123 4567",
  age: 72,
  dateOfBirth: "1954-05-15",
  gender: "Male",
  address: "No. 45, Temple Road, Colombo 03",
  residentialAddress: "No. 45, Temple Road, Colombo 03",
  medicalId: "MED-72491",
  profilePhotoUrl: "",
  ...demoDefaults,
  resetToken: null,
  resetTokenExpiry: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  toObject() {
    return { ...this };
  },
  toSafeObject() {
    const copy = { ...this };
    delete copy.passwordHash;
    delete copy.resetToken;
    delete copy.resetTokenExpiry;
    return copy;
  },
};
usersMap.set(demoId.toString(), demoUser);

const inMemoryUserStore = {
  isDbConnected,

  async createUser(data) {
    const cleanEmail = (data.email || "").toLowerCase().trim();
    if (cleanEmail) {
      const existing = await this.findByEmail(cleanEmail);
      if (existing) {
        const err = new Error("An account with this email already exists.");
        err.code = 11000;
        throw err;
      }
    }

    const _id = data._id
      ? typeof data._id === "string"
        ? new mongoose.Types.ObjectId(data._id)
        : data._id
      : new mongoose.Types.ObjectId();

    const defaults = createDefaultSettings();
    const newUser = {
      _id,
      id: _id.toString(),
      fullName: (data.fullName || "").trim(),
      email: cleanEmail,
      passwordHash: data.passwordHash || "",
      role: data.role || "patient",
      phone: (data.phone || "").trim(),
      age: data.age ? Number(data.age) : 65,
      dateOfBirth: data.dateOfBirth || "",
      gender: data.gender || "",
      bloodGroup: data.bloodGroup || "O+",
      primaryDiagnosis: data.primaryDiagnosis || "General Monitoring",
      allergies: data.allergies || "None recorded",
      vitals: data.vitals || {
        bloodPressure: "120/80",
        heartRate: 75,
        bloodSugar: 115,
      },
      address: data.address || data.residentialAddress || "",
      residentialAddress: data.residentialAddress || data.address || "",
      medicalId: data.medicalId || `MED-${Math.floor(10000 + Math.random() * 90000)}`,
      profilePhotoUrl: data.profilePhotoUrl || "",
      notificationSettings: {
        ...defaults.notificationSettings,
        ...(data.notificationSettings || {}),
      },
      accessibilitySettings: {
        ...defaults.accessibilitySettings,
        ...(data.accessibilitySettings || {}),
      },
      emergencyContact: {
        ...defaults.emergencyContact,
        ...(data.emergencyContact || {}),
      },
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject() {
        return { ...this };
      },
      toSafeObject() {
        const copy = { ...this };
        delete copy.passwordHash;
        delete copy.resetToken;
        delete copy.resetTokenExpiry;
        return copy;
      },
    };

    usersMap.set(_id.toString(), newUser);
    return newUser;
  },

  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    for (const user of usersMap.values()) {
      if (user.email === cleanEmail) {
        return user;
      }
    }
    return null;
  },

  async findById(id) {
    if (!id) return null;
    const key = id.toString();
    return usersMap.get(key) || null;
  },

  async findByIdentifier({ email, phone }) {
    if (email) {
      const u = await this.findByEmail(email);
      if (u) return u;
    }
    if (phone) {
      const cleanPhone = phone.trim();
      const digits = cleanPhone.replace(/\D/g, "");
      for (const user of usersMap.values()) {
        if (!user.phone) continue;
        const userDigits = user.phone.replace(/\D/g, "");
        if (
          user.phone === cleanPhone ||
          (digits.length >= 7 && userDigits.includes(digits)) ||
          (userDigits.length >= 7 && digits.includes(userDigits))
        ) {
          return user;
        }
      }
    }
    return null;
  },

  async updateUser(id, updates) {
    const user = await this.findById(id);
    if (!user) return null;

    for (const [key, val] of Object.entries(updates)) {
      if (key.includes(".")) {
        const [parent, child] = key.split(".");
        if (user[parent] && typeof user[parent] === "object") {
          user[parent][child] = val;
        }
      } else {
        user[key] = val;
      }
    }
    user.updatedAt = new Date();
    return user;
  },

  getAllUsers() {
    return Array.from(usersMap.values());
  },
};

module.exports = inMemoryUserStore;
