// vite.config.ts
import Unocss from 'unocss/vite'
import presetWebFonts from '@unocss/preset-web-fonts'
import presetUno from '@unocss/preset-uno'

export default {
  plugins: [
    Unocss({ /* options */
      presets: [
        presetUno(),
        presetWebFonts({
          inlineImports: true,
          provider: 'google', // default provider
          fonts: {
            // these will extend the default theme
            sans: 'Inter',
          },
        })
      ],
      shortcuts: {
        'table-header-border': 'border border-gray-600 border-b-2 border-l-0 border-r-0 border-t-0',
        'border-top': 'border border-gray-600 border-t-2 border-l-0 border-r-0 border-b-0',
        'input-percentage': 'pl-0.5 pb-0.5 text-lg border-b-2 border-slate-100 leading-5 text-slate-400 focus:text-slate-700 focus:border-slate-500 focus:outline-none',
      },
      theme: {
        container: {
          padding: '4rem',
        },
        extend: {
          gridTemplateColumns: {
            // Simple 16 column grid
            '6': 'repeat(6, minmax(0, 1fr))',
          }
        }
      }
    }),
  ],
}
