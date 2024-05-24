// const env = 'production';
const env = 'development';

const config = {
    development: {
        STATIC_URL: '/frontend/static/'
    },
    production: {
        STATIC_URL: 'https://lawcrawl-assets.s3.amazonaws.com/'
    }
};

export default config[env];
