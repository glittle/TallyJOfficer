module.exports = {
    transpileDependencies: [],
    
    css: {
        sourceMap: true
    },

    configureWebpack: {
        devtool: 'source-map'
    },
    
    chainWebpack: config => {
        // Remove the progress plugin to avoid webpack 5 compatibility issues
        config.plugins.delete('progress')
    },

    pwa: {
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            // swSrc is required in InjectManifest mode.
            swSrc: './service-worker.js',
        },
        name: 'TallyJ for Officers',
        iconPaths: {
            favicon32: 'img/icons/favicon-32x32.png?2',
            favicon16: 'img/icons/favicon-16x16.png?2',
            appleTouchIcon: 'img/icons/apple-touch-icon.png?2',
            maskIcon: 'img/icons/safari-pinned-tab.svg?2',
            msTileImage: 'img/icons/mstile-150x150.png?2'
        },
        themeColor: '#ffffff',
        assetsVersion: '2'
    },

    pluginOptions: {
        i18n: {
            locale: 'en',
            fallbackLocale: 'en',
            localeDir: 'locales',
            silentFallbackWarn: true,
            enableInSFC: false
        }
    }
}