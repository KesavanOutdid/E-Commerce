module.exports = {
  devServer: (devServerConfig) => {
    delete devServerConfig.onBeforeSetupMiddleware;
    delete devServerConfig.onAfterSetupMiddleware;

    devServerConfig.setupMiddlewares = (middlewares) => {
      return middlewares;
    };

    return devServerConfig;
  },
  webpack: {
    configure: (webpackConfig, { env }) => {
      if (env === 'development') {
        webpackConfig.snapshot = {
          managedPaths: [/(node_modules)/]
        };
      }

      const sassRule = webpackConfig.module.rules.find(
        rule => rule.oneOf
      );

      if (sassRule) {
        sassRule.oneOf.forEach(rule => {
          if (rule.use) {
            rule.use.forEach(loader => {
              if (loader.loader && loader.loader.includes('sass-loader')) {
                loader.options = {
                  ...loader.options,
                  sassOptions: {
                    ...loader.options?.sassOptions,
                    api: 'modern-compiler',
                    silenceDeprecations: ['legacy-js-api'],
                  },
                };
              }
            });
          }
        });
      }

      return webpackConfig;
    },
  },
};
