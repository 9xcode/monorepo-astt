import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',   // TODO: Replace with real reverse-domain ID
  appName: 'Template App',    // TODO: Replace with real app name

  // Relative to this file's directory — safe because `cap` CLI always
  // runs from the directory containing capacitor.config.ts.
  webDir: '../../sites/_template/dist',

  // Required for pnpm monorepos: prevents Capacitor from scanning
  // the hoisted root node_modules for unrelated plugins.
  includePlugins: [
    '@capacitor/core',
    '@capacitor/android',
    '@capacitor/ios',
  ],

  plugins: {
    // Capacitor v8: replaces removed android.adjustMarginsForEdgeToEdge.
    // Injects --safe-area-inset-* CSS vars so web content avoids system bars.
    SystemBars: {
      insetsHandling: 'css',
    },
  },

  android: {
    loggingBehavior: 'debug',
    minWebViewVersion: 60,
  },

  ios: {
    loggingBehavior: 'debug',
    contentInset: 'automatic',
  },
};

export default config;
