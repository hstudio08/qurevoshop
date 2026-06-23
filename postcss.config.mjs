const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      features: {
        "color-function": true,
        "oklab-function": true,
        "lab-function": true,
      },
    },
  },
};

export default config;