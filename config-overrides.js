const webpack = require("webpack");

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify"),
    url: require.resolve("url"),
    vm: require.resolve("vm-browserify"),
    fs: false,
    child_process: false,
    net: false,
    dns: false,
    tls: false,
    path: require.resolve("path-browserify"),
    querystring: require.resolve("querystring-es3"),
  });
  config.resolve.fallback = fallback;
  config.ignoreWarnings = [/Failed to parse source map/];
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);
  return config;
};
