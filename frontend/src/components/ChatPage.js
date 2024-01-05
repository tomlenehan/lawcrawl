import React from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import theme from './Theme';
import {ThemeProvider} from "@material-ui/core";
import Footer from "./Footer";
import Chat from "./Chat";
import Hotjar from '@hotjar/browser';

const useStyles = makeStyles((theme) => ({
    root: {
    width: '100%',
    height: 'calc(100vh - 45px)',  // Subtract the navbar height from viewport height
    display: 'flex',
    },
}));


const ChatPage = ({isAuthenticated}) => {

    // Hotjar
    const siteId = 3808648;
    const hotjarVersion = 6;
    Hotjar.init(siteId, hotjarVersion);

    const classes = useStyles();
    const token = localStorage.getItem('access');

    return (
        <div className={classes.root}>
            <Chat/>
        </div>
    );
}

export default ChatPage;
