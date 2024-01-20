import React, {useEffect, useRef, useState} from "react";
import {makeStyles} from '@material-ui/core/styles';
import {Link, useNavigate} from 'react-router-dom';
import {connect, useDispatch, useSelector} from 'react-redux';
import {setCurrentPage} from '../actions/page';
import LinearProgress from '@material-ui/core/LinearProgress';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@material-ui/icons/Close';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import {Button, IconButton, TextField, Tooltip, Menu, MenuItem} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import PrivacyTip from '@mui/icons-material/PrivacyTip';
import axios from "axios";
import {Box} from "@material-ui/core";
import config from "./config";
import ReactMarkdown from 'react-markdown';
import AdComponent from "./AdComponent"
import AdSenseAd from './AdSenseAd';
import TermsOfService from "./TermsOfService";
import UploadModal from "./UploadModal";
import PdfViewer from "./PdfViewer";
import "react-pdf/dist/Page/AnnotationLayer.css";
import useFetchUserCases from './hooks/useFetchUserCases';
import {addUserCases, updateUserCases} from '../actions/user';
import Modal from "@material-ui/core/Modal";
import {logout} from "../actions/auth";
import {InputAdornment} from "@mui/material";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Delete from '@material-ui/icons/Delete';
import Typography from "@material-ui/core/Typography";


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
        padding: "5px 0px 5px 14px",
        border: '1px solid #fdfbee',
        marginTop: 4,
        color: '#fdfbee !important',
        textDecoration: "none",
        cursor: "pointer",
        borderRadius: 4,
        '&:hover': {
            backgroundColor: '#2a2a2a',
            color: '#ffffff'
        },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    sideMenuButtonUpload: {
        padding: "5px 0px 5px 14px",
        marginBottom: 2,
        backgroundColor: '#1E88E5',
        color: '#fdfbee',
        textDecoration: "none",
        cursor: "pointer",
        borderRadius: 4,
        border: '1px solid #fdfbee',
        '&:hover': {
            backgroundColor: '#1976D2',
            color: '#ffffff',
        },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    blinkingBackground: {
        animation: '$blinkingBackground 3.0s infinite',
    },
    '@keyframes blinkingBackground': {
        '0%': {backgroundColor: '#64B5F6'},
        '50%': {backgroundColor: '#1E88E5'},
        '100%': {backgroundColor: '#1976D2'},
    },
    chatLink: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        height: 48,
        alignItems: 'center',
        width: '100%',
    },
    optionLink: {
        // color: '#3a3a3a',
        zIndex: 300,
        '&:hover': {
            color: '#fdfbee',
        },
    },
    deleteItem: {
        color: '#F44336',
    },
    chatMessage: {
        backgroundColor: '#80cbc4',
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 24,
    },
    chatMessageGPT: {
        backgroundColor: '#E0F2F1',
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 24,
    },
    chatMessageCenter: {
        maxWidth: 640,
        marginRight: 'auto',
        display: 'flex',
        padding: 12,
        paddingLeft: 24,
        paddingRight: 24,
    },
    chatMessageBody: {
        position: 'relative',
        padding: '8px',
        width: '100%',
        minHeight: 30,
    },
    chatBox: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        border: '1px solid #3a3a3a',
        backgroundColor: '#B2DFDB',
        height: 'calc(100vh - 46px)',
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
    chatInputHolder: {
        flex: 1,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    chatInputForm: {
        display: 'flex',
        maxWidth: 880,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    disclaimerText: {
        color: 'gray',
        fontSize: '0.8rem',
        textAlign: 'center',
        maxWidth: 880,
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
    avatarGPT: {
        backgroundColor: '#fdfbee',
        borderRadius: '50%',
        minWidth: 40,
        height: 40,
        marginRight: 10,
    },
    avatarME: {
        backgroundColor: '#e0f2f1',
        borderRadius: '50%',
        minWidth: 40,
        height: 40,
        marginRight: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#25A69A',
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
        maxWidth: 520,
        overflowY: 'auto',
        maxHeight: '80vh',
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    sendButton: {
        borderRadius: 10,
        marginRight: -10,
    },
    sendButtonEnabled: {
        backgroundColor: '#B2DFDB',
        color: '#5C6BC0',
        marginRight: -10,
        '&:hover': {
            backgroundColor: '#80cbc4',
            color: '#5C6BC0',
            boxShadow: '0 0 10px #719ECE',
        },
        boxShadow: '0 0 5px #3a3a3a',
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
        padding: theme.spacing(1),
        // marginLeft: 18,
        fontWeight: 700,
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
        color: '#1DA1F2',
    },
    copyButton: {
        color: '#25A69A',
        fontSize: 24,
        zIndex: 300,
        position: 'absolute',
        top: 4,
        right: 4,
    },
    fadeTextActive: {
        position: 'relative',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: 150,
        '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '15%',
            height: '100%',
            background: `linear-gradient(to right, rgba(255, 255, 255, 0), rgb(43 42 42) 100%)`,
            pointerEvents: 'none',
        },
    },
    fadeTextInactive: {
        position: 'relative',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: 150,
        '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '15%',
            height: '100%',
            background: `linear-gradient(to right, rgba(255, 255, 255, 0), rgb(60 59 59) 100%)`,
            pointerEvents: 'none',
        },
    },
    riskBar: (props) => ({
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fdfbee',
        '& .MuiLinearProgress-barColorPrimary': {
            backgroundColor: props.color,
        },
    }),
    riskLabel: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    riskValue: {
        fontWeight: 'bold',
        color: 'black',
        marginBottom:
            10,
    },
    uploadModal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        position: 'relative',
        backgroundColor: '#e0f2f1',
        // backgroundColor: '#e0f2f1',
        borderRadius: 14,
        minWidth: 400,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
    },
}));

const Chat = () => {
    const classes = useStyles();
    const [input, setInput] = useState('');
    const [loadingChatLog, setLoadingChatLog] = useState(false);
    const [loadingPDF, setLoadingPDF] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    // const userCases = useSelector((state) => state.userCases);
    const [userCases, setUserCases] = useState([]);
    const token = useSelector((state) => state.auth.access);
    const [currentCase, setCurrentCase] = useState(null);
    const [conversationID, setConversationID] = useState(null);
    const [sessionID, setSessionID] = useState(null);
    const [termsOpen, setTermsOpen] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [chatLog, setChatLog] = useState([]);
    const [file, setFile] = useState(null);
    const chatLogRef = useRef(null);
    // const fetchUserCases = useFetchUserCases();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentPage = useSelector(state => state.page.currentPage);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedCase, setSelectedCase] = useState(null);
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

    // Process PDF on initial load
    useEffect(() => {
        if (token && currentCase) {
            processPDF(currentCase, token, "");
        }
    }, [token, currentCase]);


    // Fetch the chats
    useEffect(() => {
        const fetchUserCases = async () => {
            try {
                const response = await axios.get('/api/user/cases/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (response.status) {
                    if (response.status === 401) {
                        console.log("Unauthorized, logging out");
                        dispatch(logout());
                        navigate('/login');
                    }
                    setUserCases(response.data.cases)
                }

            } catch (error) {
                console.error('Error fetching user cases:', error);
            }
        }
        fetchUserCases();
    }, [token]);


    // Set current case from URL
    useEffect(() => {
        const setCurrentCaseFromURL = () => {
            const queryParams = new URLSearchParams(window.location.search);
            const urlCaseUid = queryParams.get('uid');

            if (urlCaseUid) {
                const urlCase = userCases.find(userCase => userCase.uid === urlCaseUid);
                if (urlCase) {
                    setCurrentCase(urlCase);
                } else {
                    // Handle case where URL parameter does not match any user case
                    clearChat();
                }
            } else if (userCases.length > 0) {
                // Fallback to the first case in the list if no URL parameter is present
                setCurrentCase(userCases[userCases.length - 1]);
            } else {
                // Handle case where there are no user cases
                clearChat();
            }
        };

        setCurrentCaseFromURL();
    }, [userCases, location.search]);


    // reset the chat pdf components
    const clearChat = () => {
        setCurrentCase(null);
        setChatLog([{}, {role: "agent", content: 'Begin a chat by using the "Upload File" to the left.'}]);
        setFile(null);
    }


    // Fetch chat log for current case
    useEffect(() => {
        const fetchChatLog = async () => {
            if (currentCase) {
                try {
                    setLoadingChatLog(true);
                    const response = await axios.get(`/api/conversation/${currentCase.uid}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.status === 200 && response.data.conversation.length > 0) {
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
        }
        fetchChatLog();
    }, [currentCase]);


    // const handleFeedback = (messageIndex, type) => {
    //     setFeedback(prevFeedback => ({
    //         ...prevFeedback,
    //         [messageIndex]: type
    //     }));
    // };


    async function handleSubmit(e) {
        e.preventDefault();
        const userInput = input;
        setChatLog([...chatLog, {role: "user", content: input}]);
        setInput("");

        // Construct the SSE URL with query parameters
        const sseUrl = new URL('/api/chat/message/', window.location.origin);
        sseUrl.searchParams.append('message', userInput);
        sseUrl.searchParams.append('conversation_id', conversationID);
        sseUrl.searchParams.append('session_id', sessionID);

        // set placeholder while we run the query
        setChatLog(prevChatLog => [
            ...prevChatLog,
            {role: "agent", content: ""}
        ]);
        scrollChat();

        // re-process the PDF
        // processPDF(currentCase, token, input);

        // Reset streaming completion state on new submission
        // setIsStreamingComplete(false);

        try {
            // Establish SSE connection
            const eventSource = new EventSource(sseUrl.toString());
            let firstMessageReceived = false;
            let messageCounter = 0;
            const SCROLL_THRESHOLD = 5;

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

                    // Increment message counter
                    messageCounter++;

                    // Scroll to bottom of chat if threshold is reached
                    if (messageCounter >= SCROLL_THRESHOLD) {
                        scrollChat();
                        messageCounter = 0;
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

    // TOS Modal
    const handleTermsOpen = () => {
        setTermsOpen(true);
    };
    const handleTermsClose = () => {
        setTermsOpen(false);
    };

    // Upload Modal
    const handleUploadOpen = () => {
        setUploadOpen(true);
    };
    const handleUploadClose = () => {
        setUploadOpen(false);
    };


    const scrollChat = () => {
        if (chatLogRef.current) {
            setTimeout(() => {
                chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
            }, 100);
        }
    }


    const handleNavigateToPage = (pageNumber) => {
        dispatch(setCurrentPage(pageNumber));
    };

    // Reset currentPage to 1 when the case changes
    useEffect(() => {
        if (currentCase) {
            dispatch(setCurrentPage(1));
        }
    }, [currentCase, dispatch]);

    const handleMenuClick = (event, userCase) => {
        setAnchorEl(event.currentTarget);
        setSelectedCase(userCase);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDeleteChat = async () => {
        console.log("Deleting chat for case:", selectedCase.name);
        handleClose();

        try {
            const response = await axios.post(`/api/user/cases/delete/${selectedCase.uid}/`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.data.status === 'success') {
                // Remove the deleted case from the Redux state
                const updatedCases = userCases.filter(c => c.uid !== selectedCase.uid);
                setUserCases(updatedCases);

                console.log('naving_to_chat');
                // If deleting the current or last chat, refresh,
                // else set current chat to the latest
                if (selectedCase.uid === currentCase?.uid) {
                    // Redirect to a default route if no cases are left
                    navigate('/chat');
                }
            } else {
                console.error('Deletion was not successful');
            }
        } catch (error) {
            console.error('Error deleting case:', error);
            // TODO: display some kind of error message
        }
    };


    return (
        <div className={classes.App}>
            <aside className={classes.sideMenu}>

                <div
                    className={`${classes.sideMenuButtonUpload} ${!userCases || userCases.length === 0 ? classes.blinkingBackground : ''}`}>
                    <Link
                        to={'#'}
                        onClick={() => setUploadOpen(true)}
                        className={classes.chatLink}
                    >
                        <Box textAlign="center" flexGrow={1}>
                            <CloudUploadIcon
                                style={{marginRight: 8, marginBottom: -4, fontSize: '1.2rem'}}/>
                            Upload File
                        </Box>

                    </Link>
                </div>

                {userCases.map((userCase, index) => (
                    <div key={index}
                         className={classes.sideMenuButton}
                         style={{
                             backgroundColor: currentCase && userCase.uid === currentCase.uid ? '#2a2a2a' : 'transparent',
                         }}
                    >
                        <Link
                            to={`/chat?uid=${userCase.uid}`}
                            onClick={() => setCurrentCase(userCase)}
                            className={classes.chatLink}
                        >
                            <ChatBubbleOutlineIcon
                                style={{marginRight: '8px', fontSize: '1.2rem'}}/>
                            <Box textAlign="center" flexGrow={1}
                                 className={currentCase && userCase.uid === currentCase.uid ? classes.fadeTextActive : classes.fadeTextInactive}>
                                {userCase.name}
                            </Box>
                        </Link>

                        <IconButton onClick={(e) => handleMenuClick(e, userCase)}
                                    style={{paddingLeft: 0}}>
                            <MoreHorizIcon className={classes.optionLink}/>
                        </IconButton>
                    </div>
                ))}

                <Menu
                    id="options-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem
                        onClick={handleDeleteChat}
                        className={classes.deleteItem}
                    >
                        <Delete style={{marginRight: 8, fontSize: '1.6vw'}}/>
                        Delete Chat
                    </MenuItem>
                </Menu>

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
                    open={uploadOpen}
                    onClose={handleUploadClose}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    className={classes.uploadModal}
                >
                    <div className={classes.modalContent}>
                        <IconButton
                            aria-label="close"
                            className={classes.closeButton}
                            onClick={handleUploadClose}
                        >
                            <CloseIcon/>
                        </IconButton>
                        <UploadModal
                            onClose={handleUploadClose}
                            userCases={userCases}
                            setUserCases={setUserCases}
                            // setCurrentCase={setCurrentCase}
                        />
                    </div>
                </Modal>

                <Modal
                    open={termsOpen}
                    onClose={handleTermsClose}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    className={classes.modal}
                >
                    <div className={classes.modalText}>
                        <TermsOfService onClose={handleTermsClose}/>
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
                                                 onNavigateToPage={handleNavigateToPage}/>
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
                            file && <PdfViewer file={file} currentPage={currentPage}/>
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
                                            className={input.trim() ? `${classes.sendButton} ${classes.sendButtonEnabled}` : classes.sendButton}
                                            disabled={!input.trim()}
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

                    <Typography className={classes.disclaimerText}>
                        LawCrawl can make mistakes. Consult with a legal professional in
                        important matters.
                    </Typography>
                </div>

            </div>
        </div>
    );
}

const ChatMessage = ({content, role, onNavigateToPage}) => {

    const riskRegex = /\{\{(\d+)%\}\}/;

    const formatContentWithLinks = (text) => {
        const pageLinkRegex = /\[\[Page (\d+)\]\][.,]?/g;
        const riskRegex = /\{\{(\d+)%\}\}/;

        // Split the text into parts based on the pageLinkRegex
        let parts = text.split(pageLinkRegex);

        // Iterate over the parts and process each part
        return parts.map((part, index) => {
            // Check if the part is a page number
            if ((index % 2) === 1) {
                // This is a page number
                let pageNumber = parseInt(part, 10);
                let nextPart = parts[index + 1] || ""; // The part after the page number

                // Extract the risk level from the next part
                const riskMatch = riskRegex.exec(nextPart);
                let riskLevel = riskMatch ? parseInt(riskMatch[1], 10) : null;

                // Remove the risk level info from the next part and update it in the array
                parts[index + 1] = nextPart.replace(riskRegex, '');

                // Return the PageLinkButton component
                return (<>
                    {riskLevel &&
                        <RiskGauge riskLevel={riskLevel}/>
                    }
                    <PageLinkButton key={index} pageNumber={pageNumber}
                                    onNavigate={onNavigateToPage}/>
                </>);
            } else {
                // If not a page number, return the part as is
                return part;
            }
        });
    };

    const classes = useStyles();
    // const formattedContent = formatContentWithLinks(content);

    const formattedContent = formatContentWithLinks(content).map((part, index) => {
        if (typeof part === 'string') {
            const cleanedPart = part.replace(riskRegex, '');

            return (
                <div key={index}>
                    <ReactMarkdown>{cleanedPart}</ReactMarkdown>
                </div>
            );
        }
        return part;
    });

    // Function to copy text to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            // Optional: Display a message or change the icon to indicate success.
        });
    };

    // Updated rendering code for agent and user messages
    const messageContent = formattedContent.map((part, index) =>
        (typeof part === 'string') ? <ReactMarkdown key={index}>{part}</ReactMarkdown> : part
    );

    const chatMessage = (role === "agent") ? classes.chatMessageGPT : classes.chatMessage;
    const chatMessageCenter = classes.chatMessageCenter;
    const avatarClass = (role === "agent") ? classes.avatarGPT : classes.avatarME;
    const avatarContent = (role === "agent") ? (
        <img src={`${config.STATIC_URL}images/logos/BotChatLogo.png`} alt="Bot Avatar"
             style={{width: 35, borderRadius: '50%', marginTop: 7, marginLeft: 2}}/>
    ) : "ME";

    return (
        <div className={chatMessage}>
            <div className={chatMessageCenter}>
                <div className={avatarClass}>
                    {avatarContent}
                </div>
                <div className={classes.chatMessageBody}>

                    {role === "agent" && content && content.length > 60 && (
                        <Tooltip title="Copy to clipboard">
                            <IconButton
                                onClick={() => copyToClipboard(content)}
                                className={classes.copyButton}
                                size="small"
                            >
                                <ContentCopyIcon/>
                            </IconButton>
                        </Tooltip>
                    )}
                    {messageContent}
                </div>
            </div>
        </div>
    );
};

export default Chat;


// PageLinkButton component now also accepts riskLevel as a prop
const PageLinkButton = ({pageNumber, onNavigate}) => {
    const classes = useStyles();

    const handleNavigate = () => {
        console.log("Navigating to page: " + pageNumber);
        onNavigate(pageNumber);
    };

    return (
        <div>
            <Button variant="contained" className={classes.pageLinkButton}
                    onClick={handleNavigate}>
                pg {pageNumber}
                <ArrowForwardIosIcon className={classes.rightArrowIcon}/>
            </Button>
        </div>
    );
};


const getRiskInfo = (riskLevel) => {
    let label = "unknown"
    let color = '#BDBDBD';

    if (riskLevel <= 20) {
        label = "Very low risk";
        color = '#039BE5';
    } else if (riskLevel <= 40) {
        label = "Low risk";
        color = '#43A047';
    } else if (riskLevel <= 60) {
        label = "Moderate risk";
        color = '#FDD835';
    } else if (riskLevel <= 80) {
        label = "High risk";
        color = '#FB8C00';
    } else if (riskLevel <= 100) {
        label = "Very high risk";
        color = '#E64A19';
    }
    return {'label': label, 'color': color}
};


const RiskGauge = ({riskLevel}) => {
    const riskInfo = getRiskInfo(riskLevel);
    const classes = useStyles(riskInfo);

    return (
        <div style={{width: '60%', marginTop: 10, marginBottom: 10}}>
            {/*<Typography className={classes.riskLabel}>Risk Level:</Typography>*/}
            <Typography className={classes.riskValue} style={{color: riskInfo.color}}>
                {riskInfo.label}
            </Typography>
            <LinearProgress
                variant="determinate"
                value={riskLevel}
                className={classes.riskBar}
            />
        </div>
    );
};