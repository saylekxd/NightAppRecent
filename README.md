# NightApp - Google OAuth with Supabase

This project uses Google OAuth 2.0 for authentication with Supabase as the backend.

## Setup Instructions

### 1. Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
5. Set the Authorized redirect URI to:
   - For web: `https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
   - Example: `https://rwxzctowvxylopuzpsti.supabase.co/auth/v1/callback`

### 2. Google Cloud OAuth Setup

1. Go to the Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Navigate to APIs & Services > Credentials
4. Create OAuth 2.0 Client IDs for each platform:

#### Web Application
- Authorized JavaScript origins:
  - `https://rwxzctowvxylopuzpsti.supabase.co`
  - `http://localhost:3000` (for local development)
- Authorized redirect URIs:
  - `https://rwxzctowvxylopuzpsti.supabase.co/auth/v1/callback`
  - `http://localhost:3000/auth/callback` (for local development)

#### iOS Application
- Bundle ID: `com.swtlabs.nightapp`

#### Android Application
- Package name: `com.swtlabs.nightapp`
- SHA-1 certificate fingerprint: (Generate this using the keystore used for signing your app)

### 3. Environment Variables

Make sure your `.env` file contains the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=https://rwxzctowvxylopuzpsti.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Deep Linking Configuration

The app is configured to handle deep links for authentication callbacks:

- URL Scheme: `nightapp`
- Deep Link Pattern: `nightapp://auth/callback`

## Testing Authentication

1. Run the app using `npm run dev`
2. Navigate to the sign-in screen
3. Click "Continue with Google"
4. Complete the Google authentication flow
5. You should be redirected back to the app and signed in

## Troubleshooting

If you encounter issues with the authentication flow:

1. Check the console logs for error messages
2. Verify that your Google OAuth credentials are correctly configured in Supabase
3. Ensure the redirect URIs match exactly between Google Cloud and Supabase
4. For iOS/Android, verify that the bundle ID/package name matches your app configuration

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo Authentication Documentation](https://docs.expo.dev/guides/authentication/) 