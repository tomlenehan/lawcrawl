import React from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import theme from './Theme';
// import {Section} from "@material-ui/core";
import Footer from "./Footer";

// Chat Component
const useStyles = makeStyles((theme) => ({
    App: {
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        backgroundColor: '#3a3a3a',
    },
    sideMenu: {
        width: 260,
        padding: 10,
        backgroundColor: '#3a3a3a',
    },
    sideMenuButton: {
        padding: 15,
        border: '1px solid #fdfbee',  // using the actual RGB value for white
        borderRadius: 5,
        marginTop: 4,
        color: '#fdfbee',            // set the text color to white
        '&:hover': {
            backgroundColor: '#2a2a2a',
        },
        textAlign: 'left',
    },
    chatBox: {
        flex: 1,
        border: '1px solid #3a3a3a',
        backgroundColor: '#B2DFDB',
        position: 'relative', // Add this
    },
    chatLog: {
        textAlign: 'left',
    },
    chatMessage: {
        backgroundColor: '#e0f2f1',
        display: 'flex',
        justifyContent: 'center',
    },
    chatMessageGPT: {
        backgroundColor: '#80cbc4',
        display: 'flex',
        justifyContent: 'center',
    },
    chatMessageCenter: {
        maxWidth: 640,
        marginRight: 'auto',
        display: 'flex',
        padding: 12,
        paddingLeft: 24,
        paddingRight: 24,
    },
    chatInputHolder: {
        padding: 12,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    chatInputTextArea: {
        backgroundColor: '#fdfbee',
        fontSize: '1.1em',
        width: '90%',
        padding: 12,
        borderRadius: 5,
        '&:hover': {
            outline: 'none',
            boxShadow: '0 0 10px #719ECE',
        },
        border: "none",
        boxShadow: '0 0 5px #3a3a3a',
        resize: 'none',
    },
    avatar: {
        backgroundColor: '#ffffff',
        borderRadius: '50%',
        width: 40,
        height: 40,
        marginRight: 10,
    },
    avatarGPT: {
        backgroundColor: '#AB67FF',
        borderRadius: '50%',
        width: 40,
        height: 40,
        marginRight: 10,
    },
    message: {
        alignSelf: 'center',
    },
}));

const Chat = () => {
    const classes = useStyles();
    const token = localStorage.getItem('access');

    return (
        <div className={classes.App}>
            <aside className={classes.sideMenu}>
                <div className={classes.sideMenuButton}>
                    Test Case #1
                </div>
            </aside>
            {/*<section className={classes.chatBox}>*/}
            <div className={classes.chatBox}>
                <div item className={classes.chatLog}>
                    <div className={classes.chatMessage}>
                        <div className={classes.chatMessageCenter}>
                            <div className={classes.avatar}></div>
                            <div className={classes.message}>this is a user post</div>
                        </div>
                    </div>
                    <div className={classes.chatMessageGPT}>
                        <div className={classes.chatMessageCenter}>
                            <div className={classes.avatarGPT}></div>
                            <div className={classes.message}>this is an AI post</div>
                        </div>
                    </div>
                </div>
                <div className={classes.chatInputHolder}>
                        <textarea className={classes.chatInputTextArea}
                                  placeholder="Type your message here..."
                                  rows="1"
                        />
                </div>
            </div>
            {/*</section>*/}
        </div>
    );
}

export default Chat;
