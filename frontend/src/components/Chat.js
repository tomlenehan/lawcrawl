import React, {useEffect, useRef, useState} from "react";
import {makeStyles} from '@material-ui/core/styles';
import {Link} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
// import {Section} from "@material-ui/core";
import LinearProgress from '@material-ui/core/LinearProgress';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import axios from "axios";
import {Box} from "@material-ui/core";
import config from "./config";
import {addUserCase} from "../actions/user";
import AdComponent from "./AdComponent"
import AdSenseAd from './AdSenseAd';

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
        color: '#fdfbee !important',
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
    chatIcon: {
        marginRight: '8px',
        fontSize: '1.2rem',
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
    avatarGPT: {
        backgroundColor: '#B2DFDB',
        borderRadius: '50%',
        minWidth: 40,
        height: 40,
        marginRight: 10,
    },
    avatarME: {
        backgroundColor: '#ffffff',
        borderRadius: '50%',
        minWidth: 40,
        height: 40,
        marginRight: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#80cbc4',
        fontWeight: 'bold',
    },
    message: {
        alignSelf: 'center',
    },
    lineBreak: {
        whiteSpace: "pre-line",
    },
}));

const Chat = () => {
    const chatLogBaseline = [{
        user: "gpt",
        message: "Hello, I am your friendly Lawbot. " +
            "I'm not a lawyer, but I read your documents and I'm here to " +
            "answer all of your legal questions.",
    }];
    const classes = useStyles();
    const token = localStorage.getItem('access');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const userCases = useSelector((state) => state.userCases);
    const [currentCase, setCurrentCase] = useState(null);
    const [chatLog, setChatLog] = useState(chatLogBaseline);
    const chatLogRef = useRef(null);
    const dispatch = useDispatch();
    const ad_interval = 6;


    const fetchUserCases = async () => {
        try {
            const response = await fetch('/api/user/cases/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("API Response:", data);
            if (data) {
                dispatch(addUserCase(data));
            }
        } catch (error) {
            console.error('Error fetching user cases:', error);
        }
    };

    useEffect(() => {
        const setCurrentCaseFromLocation = () => {
            try {
                console.log('getting_current_case');
                const queryParams = new URLSearchParams(window.location.search);
                const urlCaseUid = queryParams.get('uid');

                if (urlCaseUid) {
                    const urlCase = userCases.find(userCase => userCase.uid === urlCaseUid);
                    if (urlCase && (!currentCase || currentCase.uid !== urlCase.uid)) {
                        setCurrentCase(urlCase);
                    }
                } else if (userCases.length > 0 && !currentCase) {
                    setCurrentCase(userCases[0]);
                }
            } catch (error) {
                console.error('Error setting current case:', error);
            }
        };

        if (userCases.length === 0) {
            fetchUserCases().then(() => {
                setCurrentCaseFromLocation();
            });
        } else {
            setCurrentCaseFromLocation();
        }
    }, [userCases, location.search]);


    useEffect(() => {
        const fetchCaseConversation = async () => {
            if (currentCase) {
                try {
                    setLoading(true);
                    const response = await axios.get(`/api/conversation/${currentCase.uid}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.status === 200) {
                        setChatLog(response.data.conversation);
                    } else {
                        console.error('Error fetching CaseConversation:', response.status, response.data);
                    }
                } catch (error) {
                    console.error('Error fetching CaseConversation:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCaseConversation();
    }, [token, currentCase]);


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
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userInput,
                    chat_log: chatLog,
                    case_uid: currentCase.uid
                })
            });
            const data = await response.json();
            console.log('fetching_output');
            setChatLog(prevChatLog => [
                ...prevChatLog,
                {user: "gpt", message: data.message}
            ]);
        } finally {
            setLoading(false);
        }
        // setChatLog([...chatLog, {user: "gpt", message: `${data.message}`}]);
    }

    // Scroll the chat log to the bottom whenever the chatLog state changes
    useEffect(() => {
        if (chatLogRef.current) {
            console.log('scrolling_to_bottom');
            console.log('Before:', chatLogRef.current.scrollTop, chatLogRef.current.scrollHeight);
            setTimeout(() => {
                chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
            }, 100);
            console.log('After:', chatLogRef.current.scrollTop);
        }
    }, [chatLog]);

    return (
        <div className={classes.App}>
            <aside className={classes.sideMenu}>
                {userCases.map((userCase, index) => (
                    <div key={index}>
                        <Link
                            to={`/chat?uid=${userCase.uid}`}
                            onClick={() => {
                                setCurrentCase(userCase);
                                setChatLog(chatLogBaseline);
                            }}
                            style={{
                                backgroundColor: currentCase && userCase.uid === currentCase.uid ? '#2a2a2a' : 'transparent',
                                textDecoration: 'none',
                                color: 'inherit',
                                display: 'block',
                            }}
                            className={classes.sideMenuButton}
                        >
                            <Box display="flex" alignItems="center" justifyContent="space-between"
                                 width="100%">
                                <ChatBubbleOutlineIcon
                                    style={{marginRight: '8px', fontSize: '1.2rem'}}/>
                                <Box textAlign="center" flexGrow={1}>
                                    {userCase.name}
                                </Box>
                            </Box>
                        </Link>
                    </div>
                ))}
            </aside>
            {/*<section className={classes.chatBox}>*/}
            <div className={classes.chatBox}>
                <div className={classes.chatLog} ref={chatLogRef}>
                    {/*add messages*/}
                    {chatLog.map((chat, index) => (
                        <React.Fragment key={index}>
                            <ChatMessage className={classes.lineBreak} message={chat.message}
                                         user={chat.user}/>
                            {/*Display an ad every x messages */}
                            {/*{(index + 1) % ad_interval === 0 && <AdComponent/>}*/}
                            {(index + 1) % ad_interval === 0 && <AdSenseAd />}
                        </React.Fragment>
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
                    <div className={classes.avatarGPT}>
                        <img src={`${config.STATIC_URL}images/logos/BotChatLogo.png`}
                             alt="Bot Avatar"
                             style={{
                                 width: 35,
                                 borderRadius: '50%',
                                 marginTop: 7,
                                 marginLeft: 2
                             }}/>
                    </div>
                    <div className={classes.message}>{message}</div>
                </div>
            </div>
        );
    } else {
        return (
            <div className={classes.chatMessage}>
                <div className={classes.chatMessageCenter}>
                    <div className={classes.avatarME}>
                        YOU
                    </div>
                    <div className={classes.message}>{message}</div>
                </div>
            </div>
        );
    }
}

export default Chat;
