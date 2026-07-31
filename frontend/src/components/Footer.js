import React from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core';
import theme from './Theme';
import { Link } from 'react-router-dom';


const useStyles = makeStyles(() => ({
    footer: {
        color: '#667085',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: '14px !important',
        position: 'relative',
        zIndex: 5,
        padding: '28px 16px',
        borderTop: '1px solid rgba(15, 118, 110, 0.12)',
        backgroundColor: '#ffffff',
    },
    link: {
        marginLeft: 8,
        color: '#0f766e',
        textDecoration: 'none',
        fontWeight: 700,
        '&:hover': {
            textDecoration: 'underline',
        },
    }
}));


const Footer = (props) => {
    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <footer className={classes.footer}>
                Copyright &copy; {new Date().getFullYear()} Lawcrawl
                <Link to="/terms" className={classes.link}>Privacy Policy & Terms of Service</Link>
            </footer>
        </ThemeProvider>
    )
};

export default Footer;
