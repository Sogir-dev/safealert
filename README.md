# 🆘 SafeAlert

**SafeAlert** is an emergency SOS mobile app built with React Native and Expo. With a single press-and-hold on the SOS button, it captures your live location, automatically sends an emergency SMS to your trusted contacts, and gives you one-tap access to emergency services — all wrapped in a premium, dark-themed UI.

This was my first project built with React Native / Expo, taken from a bare-bones starter template all the way to a fully designed, functioning app with real device testing on both Android and iOS.

---

## 📱 Screenshots

| Home (Safe) | Home (SOS Active) | Profile |
|---|---|---|
| ![Home Safe](docs/screenshots/home-safe.png) | ![Home SOS](docs/screenshots/home-sos.png) | ![Profile](docs/screenshots/profile.png) |

| History | Settings | Login |
|---|---|---|
| ![History](docs/screenshots/history.png) | ![Settings](docs/screenshots/settings.png) | ![Login](docs/screenshots/login.png) |

> Drop your screenshot files into `docs/screenshots/` using the filenames above and they'll render automatically on GitHub.

---

## ✨ Features

### 🚨 Emergency SOS
- **Press-and-hold activation** (600ms) instead of a single tap, to prevent accidental triggers — a quick tap does nothing but give a light haptic tap
- Continuously pulsing SOS button so it's always visually noticeable, with the pulse speeding up once an emergency is actually triggered
- 3-second countdown before the alert fires, with a **Cancel** option
- Captures live GPS location the moment SOS activates
- **Automatically sends an SMS** to your saved emergency contact and all trusted contacts with your name, live location link, and medical info
- **WhatsApp fallback** message with the same information, one tap away
- Guarded against a real bug found during iOS testing: `expo-sms` isn't reentrant, so overlapping calls are now locked out with clear "Sending..." UI feedback
- Quick actions: Call Contact, WhatsApp, Open Maps, Emergency Number
- One-tap dialing for Police / Ambulance / Fire Services

### 👤 Profile
- Hero header with avatar (photo or initials), name, email, and a "Protected" status pill
- **Collapsible sections** (Personal Info, Change Password, Emergency Contact, Medical Info, Trusted Contacts) that show a glanceable summary when collapsed
- Manage emergency contact, medical information (blood group, allergies, condition), and a list of trusted contacts
- Change password securely (see [Security](#-security) below)

### 🕒 History
- Full log of every emergency alert sent, with timestamp, contact, and location
- Tap through to open any past alert's location in Maps
- Clear history with a confirmation prompt (no accidental data loss)

### ⚙️ Settings
- About / version / privacy info
- Grouped "Danger Zone" for destructive actions (clear all app data, logout), each requiring confirmation

### 🔐 Authentication
- Register / Login / Forgot Password flow
- **Real password reset**: verify your email, then answer a security question set at registration — not just "type any matching email"

---

## 🔒 Security

Since this app has no backend and everything is stored locally on-device (via `AsyncStorage`), authentication is designed to be as sound as possible within that constraint:

- Passwords are **never stored in plaintext** — they're hashed with SHA-256 plus a unique per-user random salt (`utils/auth.ts`)
- Password reset requires verifying a security question answer, not just an email match
- A pure-JS hashing library (`js-sha256`) was used deliberately instead of `expo-crypto`, to avoid requiring a native module rebuild

**Known limitation**: this is local-only storage with no server. It's suitable for personal use and demos, not for handling real users' sensitive data at scale — a production version of this app would need a real backend with server-side authentication.

---

## 🛠️ Tech Stack

| Category | Tech |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 54 · [React Native](https://reactnative.dev) 0.81 · React 19 |
| Language | TypeScript |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| Storage | `@react-native-async-storage/async-storage` |
| Location | `expo-location` |
| SMS | `expo-sms` |
| Media | `expo-image-picker`, `expo-image` |
| Feedback | `expo-haptics` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Animation | `react-native-reanimated`, core `Animated` API |
| Gestures | `react-native-gesture-handler` |
| Safe Areas | `react-native-safe-area-context` |
| Hashing | `js-sha256` |

---

## 📂 Project Structure

```
safealert/
├── app/                      # Expo Router screens (file-based routing)
│   ├── index.tsx             # Splash / auth-check redirect
│   ├── welcome.tsx           # Welcome screen
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx   # 3-step reset flow
│   └── (tabs)/
│       ├── _layout.tsx       # Tab bar
│       ├── index.tsx         # Home / SOS
│       ├── profile.tsx
│       ├── history.tsx
│       └── settings.tsx
├── components/                # Shared UI components (haptic tab, icon symbols, etc.)
├── constants/                 # Theme constants
├── hooks/                      # Custom hooks
├── utils/
│   └── auth.ts                # Password hashing + salt generation
└── assets/                    # Images, icons, splash screen
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npx expo start
```

Then either:
- Scan the QR code with **Expo Go** (iOS/Android) for the fastest way to try it, or
- Press `a` to build and run on a connected Android device/emulator, or
- Press `i` to build and run on an iOS simulator (requires macOS)

> **Note:** if you've previously built a custom dev client and later add a new native dependency, you'll need to rebuild it with `npx expo run:android` (or `run:ios`) — a plain JS reload won't pick up new native modules. This tripped me up once during development; see the commit history for the debugging story.

---

## 🧭 Roadmap / Known Limitations

Documented honestly, since this is a portfolio project:

- **No backend** — everything is local to the device. A production version would need real server-side auth and possibly a way for trusted contacts to see live location updates rather than a single static SMS.
- **iOS testing** was done via Expo Go only, not a full native build/TestFlight — I don't own a Mac, so full native iOS builds would need Expo's cloud build service (EAS Build).
- **SMS sending isn't fully silent** — both Android and iOS require the user to confirm/tap send in the native SMS composer; there's no way to send a text with zero user interaction on either platform.
- Package name and app icon are still Expo defaults — not yet branded for a real store listing.

---

## 📄 License

This project is for personal/portfolio use.
