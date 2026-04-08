module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./app'],
        alias: {
          '@': './app',
          '@app': './app/app',
          '@components': './app/components',
          '@screens': './app/screens',
          '@navigation': './app/navigation',
          '@services': './app/services',         // Add this line
          '@store': './app/store',
          '@utils': './app/utils',
          '@styles': './app/styles',
          '@assets': './app/assets',
          '@hooks': './app/hooks',
          '@contexts': './app/contexts',
          '@data': './app/data',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};