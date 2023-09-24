import React, {useEffect, useState} from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import {Link} from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import theme from './Theme';
// import {Section} from "@material-ui/core";
import LinearProgress from '@material-ui/core/LinearProgress';
import Footer from "./Footer";
import axios from "axios";

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
        overflowY: "scroll",
        backgroundColor: '#3a3a3a',
    },
    sideMenuButton: {
        padding: 15,
        border: '1px solid #fdfbee',
        marginTop: 4,
        width: "90%",
        color: '#fdfbee !important',
        textAlign: "center",
        textDecoration: "none",
        cursor: "pointer",
        borderRadius: 4,
        '&:hover': {
            backgroundColor: '#2a2a2a',
        },
    },
    chatBox: {
        display: 'flex',
        flexDirection: 'column', // Stack the chatLog and chatInputHolder vertically
        flex: 1,
        border: '1px solid #3a3a3a',
        backgroundColor: '#B2DFDB',
        position: 'relative',
    },
    chatLog: {
        textAlign: 'left',
        overflowY: 'auto',
        flex: 1,
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
        // Remove absolute positioning styles
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
        minWidth: 40,
        height: 40,
        marginRight: 10,
    },
    avatarGPT: {
        backgroundColor: '#AB67FF',
        borderRadius: '50%',
        minWidth: 40,
        height: 40,
        marginRight: 10,
    },
    message: {
        alignSelf: 'center',
    },
}));

const Chat = () => {
    const chatLogBaseline = [{
        user: "gpt",
        message: "Hello, I am your friendly LawCrawl bot. " +
            "I'm not a lawyer, but I read your case and I'm here to " +
            "answer all of your legal questions.",
    }];
    const classes = useStyles();
    const token = localStorage.getItem('access');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [userCases, setUserCases] = useState([]);
    const [currentCase, setCurrentCase] = useState(null);
    const [chatLog, setChatLog] = useState(chatLogBaseline);


    useEffect(() => {
        const fetchUserCases = async () => {
            try {
                const response = await fetch(`/api/user/cases/`, {
                    method: 'GET',
                    headers: {
                        // 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Assuming you are using token-based authentication
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('fetching_user_cases');

                const data = await response.json();
                setUserCases(data);

                // Check for 'caseuid' in the URL
                const queryParams = new URLSearchParams(location.search);
                const urlCaseUid = queryParams.get('uid');

                if (urlCaseUid) {
                    // Set the case with the matching 'caseuid' from the URL as the current case
                    const urlCase = data.find(data => data.uid === urlCaseUid);
                    if (urlCase) setCurrentCase(urlCase);
                } else if (data.length > 0) {
                    // If 'caseuid' does not exist in the URL, set the most recent case as the current case
                    setCurrentCase(data[0]); // Assuming the most recent case is the first in the array
                }
            } catch (error) {
                console.error('Error fetching user cases:', error);
            }
        };
        fetchUserCases();

    }, [token, location]);
    // });


    //     useEffect(() => {
    //         // Check the url for a caseuid, if it does not exist, set the first one
    //         .catch(error => {
    //             console.error('Error fetching bill actions:', error);
    //         });
    //
    // }, [bill_id]);

    async function handleSubmit(e) {
        e.preventDefault();

        console.log('submitting_input')

        const userInput = input;
        setChatLog([...chatLog, {user: "me", message: input}]);

        setInput("");
        setLoading(true);

        try {
            const response = await fetch('/api/chat/message/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // message: chatLog.map((message) => message.message).
                    // message: `${input}`
                    message: input
                })
            });
            const data = await response.json();
            console.log('fetching_output');
            setChatLog(prevChatLog => [
                ...prevChatLog,
                // {user: "me", message: userInput},
                {user: "gpt", message: data.message}
            ]);
        } finally {
            setLoading(false);
        }
        // setChatLog([...chatLog, {user: "gpt", message: `${data.message}`}]);
    }

    return (
        <div className={classes.App}>
            <aside className={classes.sideMenu}>
                {userCases.map((userCase, index) => (
                    <div key={index}>
                        <Link
                            to={`/chat?uid=${userCase.uid}`}
                            className={classes.sideMenuButton}
                            onClick={() => {
                                setCurrentCase(userCase); // Update currentCase on click
                                setChatLog(chatLogBaseline);
                            }}
                            style={{
                                backgroundColor: currentCase && userCase.uid === currentCase.uid ? '#2a2a2a' : 'transparent', // Change the background color if it is the current case
                                textDecoration: 'none',
                                display: 'inline-block',
                                color: 'inherit'
                            }}
                        >
                            {userCase.name}
                        </Link>
                    </div>
                ))}
            </aside>
            {/*<section className={classes.chatBox}>*/}
            <div className={classes.chatBox}>
                <div className={classes.chatLog}>
                    {/*add messages*/}
                    {chatLog.map((chat, index) => (
                        <ChatMessage key={index} message={chat.message} user={chat.user}/>
                    ))}
                    {loading && <LinearProgress/>}
                </div>
                <div className={classes.chatInputHolder}>
                    <form onSubmit={handleSubmit}>
                        <input
                            value={input}
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
