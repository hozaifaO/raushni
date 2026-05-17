module.exports = (config) => {
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    punycode: require.resolve('punycode/'),
  };

  return config;
};
