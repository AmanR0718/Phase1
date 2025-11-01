module.exports = ({ env } = {}) => ({
  plugins: [
    require('@tailwindcss/postcss'),
    require('postcss-preset-env')({
      stage: 1,
      autoprefixer: { grid: true },
    }),
    env === 'production' ? require('cssnano')({ preset: 'default' }) : false,
  ].filter(Boolean),
});
