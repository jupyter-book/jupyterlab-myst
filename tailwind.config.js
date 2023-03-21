const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: ['class', '[data-jp-theme-light="false"]'],
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
            p: {
              color: 'var(--jp-content-font-color1)',
              fontFamily: 'var(--jp-content-font-family)',
              fontSize: 'var(--jp-content-font-size1)',
              lineHeight: 'var(--jp-content-line-height)',
              marginTop: 0,
              marginBottom: '1em'
            },
            'h1,h2,h3,h4,h5,h6': {
              lineHeight: 'var(--jp-content-heading-line-height, 1)',
              fontWeight: 'var(--jp-content-heading-font-weight, 500)',
              fontStyle: 'normal',
              marginTop: 'var(--jp-content-heading-margin-top, 1.2em)',
              marginBottom: 'var(--jp-content-heading-margin-bottom, 0.8em)',
              color: 'var(--jp-content-font-color1)'
            },
            'h1:first-child,h2:first-child,h3:first-child,h4:first-child,h5:first-child,h6:first-child':
              {
                marginTop: 'calc(0.5 * var(--jp-content-heading-margin-top))'
              },
            'h1:last-child,h2:last-child,h3:last-child,h4:last-child,h5:last-child,h6:last-child':
              {
                marginBottom:
                  'calc(0.5 * var(--jp-content-heading-margin-bottom))'
              },
            h1: {
              fontSize: 'var(--jp-content-font-size5)'
            },
            h2: {
              fontSize: 'var(--jp-content-font-size4)'
            },
            h3: {
              fontSize: 'var(--jp-content-font-size3)'
            },
            h4: {
              fontSize: 'var(--jp-content-font-size2)'
            },
            h5: {
              fontSize: 'var(--jp-content-font-size1)'
            },
            h6: {
              fontSize: 'var(--jp-content-font-size0)'
            },
            code: {
              fontWeight: 'inherit',
              color: 'var(--jp-content-font-color1)',
              fontFamily: 'var(--jp-code-font-family)',
              fontSize: 'inherit',
              lineHeight: 'var(--jp-code-line-height)',
              padding: 0,
              whiteSpace: 'pre-wrap',
              backgroundColor: 'var(--jp-layout-color2)',
              padding: '1px 5px'
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
        stone: {
          css: {
            '--tw-prose-bullets': 'var(--jp-content-font-color1)'
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
  corePlugins: {
    preflight: false
  },
  plugins: [require('@tailwindcss/typography')]
};
