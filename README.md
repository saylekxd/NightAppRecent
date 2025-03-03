# Nightzone

<p align="center">
  <img src="./assets/images/icon.png" alt="Nightzone Logo" width="120" height="120" />
</p>

Nightzone is a mobile application designed for nightlife venues and their patrons. The app allows users to scan QR codes at venues, earn rewards, and manage their profiles, while venue administrators can manage their establishments and track customer engagement.

## Features

- **QR Code Scanning**: Scan venue QR codes to check in and earn points
- **Rewards System**: Earn and redeem points for rewards at participating venues
- **User Profiles**: Manage your personal profile and track your rewards
- **Venue Management**: For administrators to manage their venues and promotions
- **Notifications**: Stay updated with the latest offers and events

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: React Context API
- **Navigation**: Expo Router
- **UI Components**: Custom components with React Native
- **Authentication**: Supabase Auth with multiple providers

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nightzone.git
   cd nightzone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Running on a Device

- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run build:web`

## Project Structure

- `/app`: Main application code with Expo Router
  - `/(tabs)`: Main tab navigation screens
  - `/(auth)`: Authentication screens
  - `/(admin)`: Admin-only screens
- `/components`: Reusable UI components
- `/lib`: Utility functions and API clients
- `/assets`: Images, fonts, and other static assets
- `/supabase`: Supabase configuration and migrations

## Authentication

The app uses Supabase Authentication with support for:
- Email/Password
- Google OAuth
- Apple Sign In

For detailed setup instructions for each auth provider, see the [Authentication Setup Guide](docs/authentication.md).

## Database Schema

The app uses a PostgreSQL database managed by Supabase with the following main tables:
- `users`: User profiles and authentication data
- `venues`: Venue information and details
- `check_ins`: Records of user check-ins at venues
- `rewards`: Available rewards and their point values
- `user_rewards`: Rewards claimed by users

## Deployment

### Expo EAS Build

1. Configure your `eas.json` file
2. Run the build command:
   ```bash
   eas build --platform all
   ```

3. Submit to app stores:
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Privacy Policy and Terms of Use

- [Privacy Policy](Privacy_Policy.md)
- [Terms of Use](Terms_of_Use.md)

## Contact

For support or inquiries, please contact DM

Greets,
@saylekxd 