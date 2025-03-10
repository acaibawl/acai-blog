// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import stylistic from '@stylistic/eslint-plugin';

export default withNuxt(
  {
    files: ['**/*.vue', '**/*.ts'],
    rules: {
      // '@typescript-eslint/explicit-function-return-type': 'error',
      'no-console': ['error', { allow: ['error', 'warn'] }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/no-multiple-template-root': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/require-v-for-key': 'error',
      'vue/no-use-v-if-with-v-for': 'error',
      'vue/attributes-order': [
        'error',
        {
          order: [
            'DEFINITION', // v-if, v-for, v-slot などの定義系ディレクティブ
            'LIST_RENDERING', // v-for などリストレンダリング系
            'CONDITIONALS', // v-if, v-else-if, v-else などの条件分岐
            'RENDER_MODIFIERS', // v-once, v-pre などレンダーモディファイア
            'GLOBAL', // id, class などグローバル属性
            'UNIQUE', // ref, key などユニーク属性
            'TWO_WAY_BINDING', // v-model など双方向バインディング
            'OTHER_DIRECTIVES', // その他のディレクティブ
            'OTHER_ATTR', // その他の属性
            'EVENTS', // v-on イベント系
            'CONTENT', // v-text, v-html などコンテンツ
          ],
          alphabetical: false,
        },
      ],
    },
  },
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
    braceStyle: '1tbs',
  }),
);
