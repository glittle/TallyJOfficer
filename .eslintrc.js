module.exports = {
    root: true,
    env: {
        node: true
    },
    parserOptions: {
        ecmaVersion: 6,
        parser: 'babel-eslint'
    },
    extends: [
        'plugin:vue/recommended',
        '@vue/standard'
    ],
    rules: {
        'no-console': 'off',
        'no-debugger': 'off',
        'eol-last': 'off',
        'comma-dangle': 'off',
        'vue/require-default-prop': 'off',
        semi: 'off',
        indent: 'off',
        'space-before-function-paren': 'off',
        quotes: 'off',
        'vue/attributes-order': 'warning',
        'vue/multiline-html-element-content-newline': 'off',
        'vue/html-closing-bracket-spacing': 'off'
    },
}