# Cursor Configuration for Expo React Native Project

This project includes custom Cursor IDE configuration files to enhance your development experience. These files provide optimized settings, useful commands, and helpful snippets for Expo React Native development.

## Configuration Files

### `.cursorrules`

Contains rules for different file types, custom commands, and code snippets:

- **Rules**: Specific settings for different file types (JS/TS, JSON, Markdown, etc.)
- **Commands**: Quick access to common Expo commands
- **Snippets**: Code templates for React Native components, hooks, and screens

### `.cursorsettings`

Global settings for the Cursor IDE:

- Editor preferences (formatting, tab size, etc.)
- File handling settings
- Terminal configuration
- Language-specific settings for JavaScript and TypeScript
- Prettier and ESLint configuration

### `.cursorignore`

Specifies files and directories that should be ignored by Cursor's indexing and search features.

## Using Commands

Access the commands defined in `.cursorrules` through the Command Palette:

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type the command name (e.g., "Start Expo")
3. Select the command to execute it

## Using Snippets

Type the snippet prefix in a JavaScript or TypeScript file and press Tab to expand:

- `rnfc` - React Native Functional Component
- `rnscreen` - React Native Screen Component
- `usestate` - React useState Hook
- `useeffect` - React useEffect Hook
- `exposcreen` - Expo Router Screen

## Customization

Feel free to modify these configuration files to suit your preferences:

- Add new commands to `.cursorrules`
- Create additional snippets for common patterns
- Adjust editor settings in `.cursorsettings`
- Update ignored files in `.cursorignore`

## Troubleshooting

If you encounter issues with the Cursor configuration:

1. Restart Cursor to apply changes to configuration files
2. Check for syntax errors in the JSON configuration files
3. Ensure file paths in commands are correct for your project structure

For more information about Cursor configuration, visit the [Cursor documentation](https://cursor.sh/docs). 