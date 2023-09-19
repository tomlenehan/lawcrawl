import React from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core';
import theme from './Theme';
import { Link } from 'react-router-dom';


const useStyles = makeStyles(() => ({
    footer: {
        color: 'white',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: '14px !important',
        // marginTop: '1.5rem',
        paddingTop: '50px',
    },
    link: {
        marginLeft: '15px',
        color: 'inherit',
        textDecoration: 'none',
    }
}));


const Footer = (props) => {
    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <footer className={classes.footer}>
                Copyright &copy; {new Date().getFullYear()} Lawcrawl:
            </footer>
        </ThemeProvider>
    )
};

export default Footer;
