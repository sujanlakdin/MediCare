# MediCare
IT3060 Human Computer Interaction - Milestone 02 Medication Reminder and Adherence Tracker Group WE_88.

## Run the application

The React Native client is in `mobile/` (Expo SDK 57). The Express/Mongoose API is in `backend/`.

1. Configure `backend/.env` with the existing `MONGO_URI` and a private `JWT_SECRET` of at least 32 characters. Generate a secret locally with:

	```powershell
	node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
	```

	Do not commit `.env` or share the generated secret. See `backend/.env.example` for variable names.

2. Start the backend:

	```powershell
	cd backend
	npm install
	npm run dev
	```

3. Start the mobile app in another terminal:

	```powershell
	cd mobile
	npm install
	npm run android
	```

	Start an Android virtual device in Android Studio's Device Manager first. The Android emulator uses `http://10.0.2.2:5000` to reach the backend. For a physical phone, set `EXPO_PUBLIC_API_URL` in `mobile/.env` to `http://<computer-lan-ip>:5000` and keep both devices on the same network. Web uses `http://localhost:5000` by default.

Create an account from the app's registration screen, then sign in. Native access tokens are stored with Expo SecureStore. Web development stores the token in browser local storage.

## API

All routes except registration and login require `Authorization: Bearer <token>`. Resource ownership is derived from the token, not a client-supplied user ID.

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/users/profile`, `PUT /api/users/profile`
- `GET /api/users/notification-settings`, `PUT /api/users/notification-settings`
- `GET /api/users/accessibility-settings`, `PUT /api/users/accessibility-settings`
- `GET /api/users/emergency-contact`, `PUT /api/users/emergency-contact`
- `GET /api/caregivers`, `POST /api/caregivers`, `PUT /api/caregivers/:id`, `DELETE /api/caregivers/:id`
- `POST /api/support`

The backend models are `User`, `Caregiver`, and `SupportRequest`. Run backend security tests with `cd backend; npm test`. Typecheck the mobile app with `cd mobile; npx tsc --noEmit`.

Medication scheduling and actual local/push notification delivery are not present in the current repository. Notification screens persist user preferences, but reminders will not fire until the medication/reminder module and a notification service are integrated. Profile images are not selectable yet; the profile uses initials until image selection is added.
