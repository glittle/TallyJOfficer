module.exports = {
    css: {
      sourceMap: true
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

    lintOnSave: undefined,
    publicPath: undefined,
    outputDir: undefined,
    assetsDir: undefined,
    runtimeCompiler: undefined,
    productionSourceMap: undefined,
    parallel: undefined
}