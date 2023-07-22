/** @type {import('next').NextConfig} */

const config = {
  reactStrictMode: true,
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'handlebars': 'handlebars/dist/handlebars.js'
    };

    return config;
  },
};

export default config;