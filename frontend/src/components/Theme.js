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
            backgroundColor: '#f6f8f6',
            color: '#202124',
            overscrollBehavior: 'none',
        },
        '*': {
            boxSizing: 'border-box',
        },
        'a': {
            color: '#0f766e',
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
        }
      `,
        },
    },
    typography: {
        fontFamily: [
            'DMSans',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontWeight: 800,
            letterSpacing: 0,
        },
        h2: {
            fontWeight: 800,
            letterSpacing: 0,
        },
        h3: {
            fontWeight: 800,
            letterSpacing: 0,
        },
        h4: {
            fontWeight: 800,
            letterSpacing: 0,
        },
        button: {
            fontWeight: 700,
            letterSpacing: 0,
            textTransform: 'none',
        },
    },
    palette: {
        primary: {main: '#0f766e'},
        secondary: {main: '#202124'},
        background: {
            default: '#f6f8f6',
            paper: '#ffffff',
        },
        text: {
            primary: '#202124',
            secondary: '#667085',
        },
    },
});

export default theme;
