// vite.config.ts
import Unocss from 'unocss/vite'

export default {
  plugins: [
    Unocss({ /* options */
      shortcuts: {
        'table-header-border': 'border border-gray-600 border-b-2 border-l-0 border-r-0 border-t-0',
        'border-top': 'border border-gray-600 border-t-2 border-l-0 border-r-0 border-b-0',
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
