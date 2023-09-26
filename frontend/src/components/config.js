// const env = process.env.NODE_ENV || 'development';
// const env = 'production';
// const env = 'development';
const env = 'production';

const config = {
    development: {
        STATIC_URL: '/frontend/static/'
    },
    production: {
        STATIC_URL: 'https://lawcrawl-assets.s3.amazonaws.com/'
    }
};

console.log('Current Environment:', env)
export default config[env];
