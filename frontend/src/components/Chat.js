import React, {useEffect, useRef, useState} from "react";
import {makeStyles} from '@material-ui/core/styles';
import {Link, useNavigate} from 'react-router-dom';
import {connect, useDispatch, useSelector} from 'react-redux';
import LinearProgress from '@material-ui/core/LinearProgress';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import {Button, IconButton, TextField} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import PrivacyTip from '@mui/icons-material/PrivacyTip';
import axios from "axios";
import {Box} from "@material-ui/core";
import config from "./config";
import ReactMarkdown from 'react-markdown';
import AdComponent from "./AdComponent"
import AdSenseAd from './AdSenseAd';
import TermsOfService from "./TermsOfService";
import PdfViewer from "./PdfViewer";
import "react-pdf/dist/Page/AnnotationLayer.css";
import useFetchUserCases from './hooks/useFetchUserCases';
import Modal from "@material-ui/core/Modal";
import {logout} from "../actions/auth";
import {InputAdornment} from "@mui/material";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";

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
        display: 'flex',
        flexDirection: 'column',
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
    chatMessage: {
        backgroundColor: '#e0f2f1',
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 40,
    },
    chatMessageGPT: {
        backgroundColor: '#80cbc4',
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 40,
    },
    chatMessageCenter: {
        maxWidth: 640,
        marginRight: 'auto',
        display: 'flex',
        padding: 12,
        paddingLeft: 24,
        paddingRight: 24,
    },
    chatBox: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        border: '1px solid #3a3a3a',
        backgroundColor: '#B2DFDB',
        height: 'calc(100vh - 46px)', // height minus navbar height
    },
    chatContentContainer: {
        flex: 8,
        display: 'flex',
        overflowY: 'scroll',
    },
    chatLog: {
        width: '50%',
        textAlign: 'left',
        overflowY: 'scroll',
        borderRadius: 15,
        flex: 1,
    },
    pdfViewerContainer: {
        width: '50%',
        flex: 1,
    },
    chatInputTextArea: {
        backgroundColor: '#e0f2f1',
        fontSize: '1.1em',
        width: '90%',
        borderRadius: 5,
        '&:hover': {
            outline: 'none',
            boxShadow: '0 0 10px #719ECE',
        },
        border: "none",
        boxShadow: '0 0 5px #3a3a3a',
        resize: 'none',
    },
    chatInputHolder: {
        flex: 1,
        padding: 12,
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
    termsLink: {
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 5,
        color: '#fdfbee',
        textDecoration: "none",
        fontSize: '1.1vw',
        cursor: "pointer",
        position: 'relative',
        alignSelf: 'flex-end',
        marginRight: 60,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        width: 170,
    },
    modalText: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
        maxWidth: 400,
        overflowY: 'auto',
        maxHeight: '80vh',
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    chatInputForm: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    sendButton: {
        borderRadius: 10,
    },
    sendButtonEnabled: {
        backgroundColor: '#B2DFDB',
        color: '#5C6BC0',
        '&:hover': {
            backgroundColor: '#80cbc4',
            color: '#5C6BC0',
        },
    },
    blinkingEmoji: {
        animation: '$blink 1s linear infinite',
        fontSize: 25,
    },
    '@keyframes blink': {
        '0%, 100%': {opacity: 1},
        '50%': {opacity: 0},
    },
    pageLinkButton: {
        marginLeft: 22,
        padding: theme.spacing(1),
        textTransform: 'none',
        backgroundColor: '#B2DFDB',
        color: '#3a3a3a',
        '&:hover': {
            backgroundColor: '#80cbc4',
        },
        display: 'flex',
        alignItems: 'center',
    },
    rightArrowIcon: {
        marginLeft: theme.spacing(1),
        fontSize: 14,
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
    const [input, setInput] = useState('');
    const [loadingChatLog, setLoadingChatLog] = useState(false);
    const [loadingPDF, setLoadingPDF] = useState(false);
    const userCases = useSelector((state) => state.userCases);
    const token = useSelector((state) => state.auth.access);
    const [currentCase, setCurrentCase] = useState(null);
    const [conversationID, setConversationID] = useState(null);
    const [sessionID, setSessionID] = useState(null);
    const [termsOpen, setTermsOpen] = useState(false);
    const [chatLog, setChatLog] = useState(null);
    const [file, setFile] = useState(null);
    const chatLogRef = useRef(null);
    const fetchUserCases = useFetchUserCases();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(null);
    const ad_interval = 0;
    const [feedback, setFeedback] = useState({});


    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };


    const processPDF = async (currentCase, authToken, query) => {
        setLoadingPDF(true);
        if (currentCase) {
            try {
                const url = new URL(`/api/process_pdf/${currentCase.uid}`, window.location.origin);
                url.searchParams.append('query', query);

                const response = await axios.get(url.toString(), {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                    responseType: 'blob',
                });
                const pdfBlob = new Blob([response.data], {type: 'application/pdf'});
                setFile(pdfBlob);
            } catch (error) {
                console.error('Error processing PDF:', error);
            } finally {
                setLoadingPDF(false);
            }
        }
    };

    useEffect(() => {
        if (token) {
            processPDF(currentCase, token, "");
        }
    }, [token, currentCase]);


    useEffect(() => {
        const setCurrentCaseFromLocation = () => {
            try {
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

        console.log("setting_case");
        if (token != null) {
            if (userCases.length === 0) {
                fetchUserCases(token, dispatch)
                    .then((status) => {
                        if (status !== 401) {
                            setCurrentCaseFromLocation();
                        } else {
                            handleLogout();
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching user cases:', error);
                        handleLogout();
                    });
            } else {
                setCurrentCaseFromLocation();
            }
        }
    }, [token, userCases, location.search]);


    useEffect(() => {
        const fetchCaseConversation = async () => {
            if (currentCase) {
                try {
                    setLoadingChatLog(true);
                    const response = await axios.get(`/api/conversation/${currentCase.uid}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.status === 200) {
                        setSessionID(response.data.session_id);
                        setConversationID(response.data.conversation_id);
                        setChatLog(response.data.conversation);
                    } else {
                        console.error('Error fetching CaseConversation:', response.status, response.data);
                    }
                } catch (error) {
                    console.error('Error fetching CaseConversation:', error);
                } finally {
                    setLoadingChatLog(false);
                }
            }
        };

        fetchCaseConversation();
    }, [token, currentCase]);

    const handleFeedback = (messageIndex, type) => {
        setFeedback(prevFeedback => ({
            ...prevFeedback,
            [messageIndex]: type
        }));
    };

    async function handleSubmit(e) {
        e.preventDefault();

        console.log('submitting_input');

        const userInput = input;
        setChatLog([...chatLog, {role: "user", content: input}]);

        setInput("");

        // Construct the SSE URL with query parameters
        const sseUrl = new URL('/api/chat/message/', window.location.origin);
        sseUrl.searchParams.append('message', userInput);
        sseUrl.searchParams.append('conversation_id', conversationID);
        sseUrl.searchParams.append('session_id', sessionID);

        // set placeholder while agent "thinks"
        setChatLog(prevChatLog => [
            ...prevChatLog,
            {role: "agent", content: <span className={classes.blinkingEmoji}>🤔</span>}
        ]);

        // re-process the PDF
        processPDF(currentCase, token, input);

        try {
            // Establish SSE connection
            const eventSource = new EventSource(sseUrl.toString());
            let firstMessageReceived = false;

            eventSource.onmessage = (event) => {
                // Handle incoming data
                console.log("incoming_message");
                const eventData = JSON.parse(event.data);

                setChatLog(prevChatLog => {
                    const updatedChatLog = [...prevChatLog];
                    const lastMessageIndex = updatedChatLog.length - 1;

                    if (!firstMessageReceived) {
                        // Replace the placeholder with the first part of the message
                        updatedChatLog[lastMessageIndex].content = eventData.token;
                        firstMessageReceived = true;
                    } else {
                        // Append to the existing message
                        updatedChatLog[lastMessageIndex].content += eventData.token;
                    }
                    return updatedChatLog;
                });
            };

            eventSource.onerror = (error) => {
                console.error("EventSource failed:", error);
                eventSource.close();
                setLoadingChatLog(false);
            };

        } catch (error) {
            console.error("An error occurred:", error);
            setLoadingChatLog(false);
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
            handleSubmit(e);
        }
    }

    const handleTermsOpen = () => {
        setTermsOpen(true);
    };

    const handleTermsClose = () => {
        setTermsOpen(false);
    };


    useEffect(() => {
        if (chatLogRef.current) {
            setTimeout(() => {
                chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
            }, 100);
        }
    }, [chatLog]);


    const handleNavigateToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    return (
        <div className={classes.App}>
            <aside className={classes.sideMenu}>
                {userCases.map((userCase, index) => (
                    <div key={index}>
                        <Link
                            to={`/chat?uid=${userCase.uid}`}
                            onClick={() => {
                                setCurrentCase(userCase);
                                // setChatLog(chatLogBaseline);
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

                {/*<Box style={{height: '100vh'}}/>*/}
                <div style={{flexGrow: 1}}></div>
                <Link
                    to="#"
                    className={classes.termsLink}
                    onClick={handleTermsOpen}
                >
                    <PrivacyTip style={{marginRight: 8, fontSize: '1.6vw'}}/>
                    <span>Privacy & Terms</span>
                </Link>

                <Modal
                    open={termsOpen}
                    onClose={handleTermsClose}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    className={classes.modal}
                >
                    <div className={classes.modalText}>
                        <TermsOfService/>
                    </div>
                </Modal>
            </aside>
            {/* CHATBOX */}
            <div className={classes.chatBox}>
                <div className={classes.chatContentContainer}>
                    <div className={classes.chatLog} ref={chatLogRef}>
                        {/* Chat messages */}
                        {Array.isArray(chatLog) && chatLog.map((chat, index) => (
                            index === 0 ? null : (
                                <React.Fragment key={index}>
                                    <ChatMessage className={classes.lineBreak}
                                                 content={chat.content}
                                                 role={chat.role}
                                                 onNavigateToPage={handleNavigateToPage} />
                                    {/*{(index + 1) % ad_interval === 0 && <AdSenseAd/>}*/}
                                </React.Fragment>
                            )
                        ))}
                        {loadingChatLog && (
                            chatLog === null ? (
                                <div className={classes.progressContainer}>
                                    <LinearProgress color="primary" size="lg"
                                                    style={{width: '50%'}}/>
                                </div>
                            ) : (
                                <div style={{justifyContent: 'center', display: 'flex'}}>
                                    <LinearProgress color="primary" size="lg"
                                                    style={{width: '50%'}}/>
                                </div>
                            )
                        )}
                    </div>

                    <div className={classes.pdfViewerContainer}>
                        {loadingPDF ? (
                            <div className={classes.progressContainer}>
                                <LinearProgress color="primary" size="lg" style={{width: '50%'}}/>
                            </div>
                        ) : (
                            file && <PdfViewer file={file} currentPage={currentPage} />
                        )}
                    </div>

                </div>
                <div className={classes.chatInputHolder}>
                    <form onSubmit={handleSubmit} className={classes.chatInputForm}>
                        <TextField
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className={classes.chatInputTextArea}
                            placeholder="Type your question here..."
                            variant="outlined"
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            type="submit"
                                            className={
                                                input.trim() ? `${classes.sendButton} ${classes.sendButtonEnabled}` : classes.sendButton
                                            }
                                            disabled={!input.trim()} // Button disabled when input is empty or just whitespace
                                        >
                                            <SendIcon/>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            multiline
                            rows={1}
                        />
                    </form>
                </div>
            </div>

        </div>
    );
}

const ChatMessage = ({content, role, onNavigateToPage}) => {

    const formatContentWithLinks = (text) => {
        const pageLinkRegex = /\(Page (\d+)\):/g;
        return text.split(pageLinkRegex).map((part, index) => {
            if ((index % 2) === 1) { // This is a page number
                return <PageLinkButton key={index} pageNumber={parseInt(part, 10)} onNavigate={onNavigateToPage} />;
            }
            return part;
        });
    };

    const classes = useStyles();
    const formattedContent = formatContentWithLinks(content);

    if (role === "agent") {
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
                    <div className={classes.message}>
                        {formattedContent.map((part, index) =>
                            (typeof part === 'string') ?
                                <ReactMarkdown key={index}>{part}</ReactMarkdown> : part
                        )}
                    </div>

                    {/*<div className={classes.feedbackButtons}>*/}
                    {/*    <IconButton onClick={() => onFeedback(index, 'up')}>*/}
                    {/*        <ThumbUpIcon/>*/}
                    {/*    </IconButton>*/}
                    {/*    <IconButton onClick={() => onFeedback(index, 'down')}>*/}
                    {/*        <ThumbDownIcon/>*/}
                    {/*    </IconButton>*/}
                    {/*</div>*/}

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
                    <div className={classes.message}>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}

export default Chat;


const PageLinkButton = ({pageNumber, onNavigate}) => {
    const classes = useStyles();

    const handleNavigate = () => {
        console.log("Navigating to page: " + pageNumber);
        onNavigate(pageNumber);
    };

    return (
        <Button variant="contained" className={classes.pageLinkButton} onClick={handleNavigate}>
            Page {pageNumber}
            <ArrowForwardIosIcon className={classes.rightArrowIcon} />
        </Button>
    );
};

