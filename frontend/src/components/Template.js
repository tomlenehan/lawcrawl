import React from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import theme from './Theme';
import {ThemeProvider} from "@material-ui/core";
import Footer from "./Footer";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: 'scroll',
        minHeight: "100vh",
        paddingBottom: 35,
    },
    homePageContainer: {
        paddingTop: 80,
    },
    chatLog: {
        textAlign: 'center',
        margin: '0 auto', // this will center the chat log horizontally
    },
    chatMessage: {
        backgroundColor: '#3a3a3a',
        display: 'flex',
        justifyContent: 'center', // centers the inner content horizontally
    },
    chatMessageCenter: {
        display: 'flex',
        paddingLeft: 40,
        paddingRight: 40,
    },
    avatar: {
        backgroundColor: '#B2DFDB',
        borderRadius: '50%',
        width: 40,
        height: 40,
        marginRight: 15, // added a margin to give space between the avatar and the message
    },
    message: {
        alignSelf: 'center', // centers the message vertically relative to the avatar
    },
}));

const Upload = ({isAuthenticated}) => {
    const classes = useStyles();
    const token = localStorage.getItem('access');

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <Grid container className={classes.homePageContainer} direction="column" justifyContent="center" alignItems="center" style={{ minHeight: '80vh' }}>
                    <Grid item className={classes.chatLog} xs={8} sm={10}>
                        <div className={classes.chatMessage} >
                            <div className={classes.chatMessageCenter}>
                                <div className={classes.avatar}></div>
                                <div className={classes.message}>this is an AI</div>
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </div>
            <Footer/>
        </ThemeProvider>
    );
}

export default Upload;
