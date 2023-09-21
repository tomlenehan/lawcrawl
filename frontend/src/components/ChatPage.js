import React from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import theme from './Theme';
import {ThemeProvider} from "@material-ui/core";
import Footer from "./Footer";
import Chat from "./Chat";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        minHeight: "100vh",
        display: 'flex',
    },
}));


const ChatPage = ({isAuthenticated}) => {
    const classes = useStyles();
    const token = localStorage.getItem('access');

    return (
        <div className={classes.root}>
        {/*<div>*/}
            <Chat/>
        </div>
    );
}

export default ChatPage;
