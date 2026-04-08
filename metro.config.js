const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    alias: {
      '@': './app',
      '@app': './app/app',
      '@components': './app/components',
      '@screens': './app/screens',
      '@navigation': './app/navigation',
      '@services': './app/services',           // Add this line
      '@store': './app/store',
      '@utils': './app/utils',
      '@styles': './app/styles',
      '@assets': './app/assets',
      '@hooks': './app/hooks',
      '@contexts': './app/contexts',
      '@data': './app/data',
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
