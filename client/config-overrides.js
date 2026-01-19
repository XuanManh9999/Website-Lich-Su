module.exports = function override(config, env) {
  // Override webpack dev server config
  return config;
};

module.exports.devServer = function(configFunction) {
  return function(proxy, allowedHost) {
    const config = configFunction(proxy, allowedHost);
    
    // Fix the allowedHosts issue
    if (config.allowedHosts && Array.isArray(config.allowedHosts) && config.allowedHosts.length > 0 && config.allowedHosts[0] === '') {
      config.allowedHosts = 'all';
    }
    
    return config;
  };
};
