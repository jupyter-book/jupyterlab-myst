const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/myst-to-react/dist/**/*.{js,ts,jsx,tsx}',
    'node_modules/@myst-theme/frontmatter/dist/**/*.{js,ts,jsx,tsx}',
    // Occasionally look to these folders as well in development only
    '.yalc/myst-to-react/dist/**/*.{js,ts,jsx,tsx}',
    '.yalc/@myst-theme/frontmatter/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        success: colors.green[500]
      },
      // See https://github.com/tailwindlabs/tailwindcss-typography/blob/master/src/styles.js
      typography: theme => ({
        DEFAULT: {
          css: {
            code: {
              fontWeight: '400'
            },
            'code::before': {
              content: ''
            },
            'code::after': {
              content: ''
            },
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:first-of-type::after': { content: 'none' },
            li: {
              marginTop: '0.25rem',
              marginBottom: '0.25rem'
            },
            a: {
              textDecoration: 'none',
              color: 'var(--jp-content-link-color, #1976d2)', // --md-blue-700
              fontWeight: 400,
              '&:hover': {
                color: 'var(--jp-content-link-color, #1976d2)', // --md-blue-700
                textDecoration: 'underline',
                fontWeight: 400
              }
            },
            'li > p, dd > p, header > p, footer > p': {
              marginTop: '0.25rem',
              marginBottom: '0.25rem'
            }
          }
        },
        invert: {
          css: {
            '--tw-prose-code': theme('colors.pink[500]')
          }
        },
        stone: {
          css: {
            '--tw-prose-code': theme('colors.pink[600]')
          }
        }
      }),
      keyframes: {
        load: {
          '0%': { width: '0%' },
          '100%': { width: '50%' }
        },
        fadeIn: {
          '0%': { opacity: 0.0 },
          '25%': { opacity: 0.25 },
          '50%': { opacity: 0.5 },
          '75%': { opacity: 0.75 },
          '100%': { opacity: 1 }
        }
      },
      animation: {
        load: 'load 2.5s ease-out',
        'fadein-fast': 'fadeIn 1s ease-out'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
