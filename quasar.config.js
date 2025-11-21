import { defineConfig } from '#q-app/wrappers'

export default defineConfig(() => {
  return {
boot: ['pinia', 'axios', 'auth-guard'],



    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      vueRouterMode: 'hash',

      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    devServer: {
      open: true,
    },

    framework: {
      config: {},
      plugins: [ 'Dialog','Notify'], // ✅ thêm plugin Notify
    },

    animations: [],

    capacitor: {
      hideSplashscreen: true,
    },

    // ... các phần còn lại giữ nguyên
  }
})
