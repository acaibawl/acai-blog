// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['modern-css-reset'],
  app: {
    head: {
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&family=Philosopher&display=swap",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&family=Noto+Sans+JP:wght@100..900&family=Philosopher&display=swap",
        },
      ],
      meta: [
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "浅井ブログ" },
        { property: "og:locale", content: "ja_JP" },
      ]
    }
  },
  runtimeConfig: {
    public: {
      baseUrl: ""
    }
  }
})
