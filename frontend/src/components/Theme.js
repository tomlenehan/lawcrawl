import {createTheme} from '@mui/material/styles';
import MontserratTtf from '../../static/fonts/MontserratRegular.ttf';
import LatoTtf from '../../static/fonts/Lato-Black.ttf';
import BarlowTtf from '../../static/fonts/BarlowCondensed-ExtraBold.ttf';
import DMSansTtf from '../../static/fonts/DMSans-Bold.ttf';

import {makeStyles} from "@material-ui/core";


export const globalStyles = makeStyles(() => ({
    '@global': {
        'html, body': {
            height: '100%',
            width: '100%',
            margin: 0,
            padding: 0,
            backgroundColor: '#B2DFDB',
            color: '#3a3a3a',
            overscrollBehavior: 'none', // prevent overscrolling
        },
        '*': {
            boxSizing: 'border-box',
        },
        '#root': {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        '#main': {
            height: '100%',
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            left: 0,
            top: 0,
        },
        '#app': {
            overflowY: 'scroll',
            justifyContent: 'center',
        },
        '.full-width': {
            width: '100%',
        },
    },
}));


const theme = createTheme({
    fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
    ].join(','),
    components: {
        MuiCssBaseline: {
            styleOverrides: `
        @font-face {
          font-family: 'Montserrat';
          src: local('Montserrat'), local('MontserratRegular'), url(${MontserratTtf}) format('truetype');
        }
        @font-face {
          font-family: 'Lato';
          src: local('Lato'), local('Lato-Black'), url(${LatoTtf}) format('truetype');
        }
        @font-face {
          font-family: 'Barlow';
          src: local('Barlow'), local('BarlowCondensed-ExtraBold'), url(${BarlowTtf}) format('truetype');
        }
        @font-face {
            font-family: 'DMSans';
            src: local('DMSans'), local('DMSans-Bold'), url(${DMSansTtf}) format('truetype');
      `,
        },
    },
    palette: {
        primary: {main: '#B2DFDB'},
        secondary: {main: '#3a3a3a'},
    },
});

export default theme;
