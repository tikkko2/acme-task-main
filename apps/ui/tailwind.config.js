const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

const responsiveContainerPadding = {
  DEFAULT: '1rem',
  sm: '1rem',
  md: '1.5rem',
  xl: '2rem',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
    container: {
      center: true,
      padding: responsiveContainerPadding,
    },
  },
  plugins: [],
};
