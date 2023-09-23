import React, {useState} from "react";
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
        backgroundColor: '#80cbc4',
        display: 'flex',
        justifyContent: 'center',
    },
    chatMessageGPT: {
        backgroundColor: '#e0f2f1',
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
        backgroundColor: '#e0f2f1',
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
    const [input, setInput] = useState('');
    const [chatLog, setChatLog] = useState([{
        user: "gpt",
        message: "Hello, I am your friendly LawCrawl bot. " +
            "I'm not a lawyer, but I read your case and I'm here to " +
            "answer all of your legal questions.",
    }]);

    async function handleSubmit(e) {
        e.preventDefault();

        console.log('submitting_input')

        setChatLog([...chatLog, {user: "me", message: `${input}`}]);
        setInput("");

        const response = await fetch('/api/chat/message/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: chatLog.map((message) => message.message).
                join("")
            })
        });
        const data = await response.json();
        console.log(data);
    }

    return (
        <div className={classes.App}>
            <aside className={classes.sideMenu}>
                <div className={classes.sideMenuButton}>
                    Test Case #1
                </div>
            </aside>
            {/*<section className={classes.chatBox}>*/}
            <div className={classes.chatBox}>
                <div className={classes.chatLog}>
                    {/*add messages*/}
                    {chatLog.map((chat, index) => (
                        <ChatMessage key={index} message={chat.message} user={chat.user}/>
                    ))}
                </div>
                <div className={classes.chatInputHolder}>
                    <form onSubmit={handleSubmit}>
                        <input
                            onChange={(e) => setInput(e.target.value)}
                            className={classes.chatInputTextArea}
                            placeholder="Type your message here..."
                            rows="1"></input>
                    </form>
                </div>
            </div>

        </div>
    );
}

const ChatMessage = ({message, user}) => {
    const classes = useStyles();
    if (user === "gpt") {
        return (
            <div className={classes.chatMessageGPT}>
                <div className={classes.chatMessageCenter}>
                    <div className={classes.avatarGPT}></div>
                    <div className={classes.message}>{message}</div>
                </div>
            </div>
        );
    } else {
        return (
            <div className={classes.chatMessage}>
                <div className={classes.chatMessageCenter}>
                    <div className={classes.avatar}></div>
                    <div className={classes.message}>{message}</div>
                </div>
            </div>
        );
    }
}

export default Chat;
