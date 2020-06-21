module.exports = {
    root: true,

    env: {
        node: true
    },

    parserOptions: {
        parser: 'babel-eslint',
        esversion: 6
    },

    rules: {
      'no-console': 'off',
        'no-debugger': 'warn',
      'vue/require-default-prop': 'off',
      semi: 'off',
      indent: 'off',
      'space-before-function-paren': 'off',
      quotes: 'off',
      'vue/attributes-order': 1,
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/v-on-style': 'off',
      'vue/html-self-closing': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'vue/no-v-html': 'warn'
    },

    'extends': [
        'plugin:vue/recommended',
    ]
}