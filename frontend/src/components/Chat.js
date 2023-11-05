import React, {useEffect, useRef, useState} from "react";
import {makeStyles} from '@material-ui/core/styles';
import {Link, useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import LinearProgress from '@material-ui/core/LinearProgress';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import PrivacyTip from '@mui/icons-material/PrivacyTip';
import axios from "axios";
import {Box} from "@material-ui/core";
import config from "./config";
import {addUserCase} from "../actions/user";
import AdComponent from "./AdComponent"
import AdSenseAd from './AdSenseAd';
import TermsOfService from "./TermsOfService";
import PdfViewer from "./PdfViewer";
import "react-pdf/dist/Page/AnnotationLayer.css";
import useFetchUserCases from './hooks/useFetchUserCases';
import Modal from "@material-ui/core/Modal";
import {logout} from "../actions/auth";
import {Grid} from "@mui/material";

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
        marginTop: 4,
        marginBottom: 10,
        marginLeft: 5,
        color: '#fdfbee',
        textDecoration: "none",
        fontSize: '1.1vw',
        cursor: "pointer",
        position: 'fixed',
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
        height: '100%', // Take up all the available height
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
    const [loadingChatLog, setLoadingChatLog] = useState(false);
    const [loadingPDF, setLoadingPDF] = useState(false);
    const userCases = useSelector((state) => state.userCases);
    const [currentCase, setCurrentCase] = useState(null);
    const [termsOpen, setTermsOpen] = useState(false);
    const [chatLog, setChatLog] = useState(chatLogBaseline);
    const [file, setFile] = useState(null);
    const chatLogRef = useRef(null);
    const fetchUserCases = useFetchUserCases();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const ad_interval = 0;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };


    const processPDF = async (currentCase, authToken) => {
        setLoadingPDF(true);
        if (currentCase) {
            try {
                const response = await axios.get(`/api/process_pdf/${currentCase.uid}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                    responseType: 'blob',
                });
                console.log('processing_pdf');
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
        processPDF(currentCase, token);
    }, [token, currentCase]);

    // useEffect(() => {
    //     const processPDF = async () => {
    //         setLoadingPDF(true);
    //         if (currentCase) {
    //             try {
    //                 const response = await axios.get(`/api/process_pdf/${currentCase.uid}`, {
    //                     headers: {
    //                         'Authorization': `Bearer ${token}`,
    //                     },
    //                     responseType: 'blob',
    //                 });
    //                 // const data = await response;
    //                 console.log('processing_pdf');
    //                 const pdfBlob = new Blob([response.data], {type: 'application/pdf'});
    //                 setFile(pdfBlob);
    //             } finally {
    //                 setLoadingPDF(false);
    //             }
    //         }
    //     };
    //     processPDF();
    // }, [token, currentCase]);

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
            fetchUserCases(token, dispatch)
                .then(() => {
                    setCurrentCaseFromLocation();
                })
                .catch(error => {
                    console.error('Error fetching user cases:', error);
                    handleLogout();
                });
        } else {
            setCurrentCaseFromLocation();
        }
    }, [userCases, location.search]);


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


    async function handleSubmit(e) {
        e.preventDefault();

        console.log('submitting_input')

        const userInput = input;
        setChatLog([...chatLog, {user: "me", message: input}]);

        setInput("");
        setLoadingChatLog(true);
        setLoadingPDF(true);

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
            setChatLog(prevChatLog => [
                ...prevChatLog,
                // {user: "gpt", message: data.message}
                data.message
            ]);
        } finally {
            setLoadingChatLog(false);
        }
        processPDF(currentCase, token);
    }

    const handleTermsOpen = () => {
        setTermsOpen(true);
    };

    const handleTermsClose = () => {
        setTermsOpen(false);
    };

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
                <Link
                    to="#"
                    className={classes.termsLink}
                    onClick={handleTermsOpen}
                >
                    <PrivacyTip style={{marginRight: 8, fontSize: '1.6vw'}}/>
                    <span>Privacy & Terms</span>
                </Link>
                <Box style={{height: '100vh'}}/>

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
                        {/*<div style={{ height: '100%', overflowY: 'scroll', borderRadius: 15 }} >*/}
                            {/* Chat messages */}
                            {chatLog.map((chat, index) => (
                                index === 0 ? null : ( // Return null for the first element
                                    <React.Fragment key={index}>
                                        <ChatMessage className={classes.lineBreak}
                                                     message={chat.message}
                                                     user={chat.user}/>
                                        {(index + 1) % ad_interval === 0 && <AdSenseAd/>}
                                    </React.Fragment>
                                )
                            ))}
                            {loadingChatLog && <LinearProgress/>}
                        </div>
                    {/*</div>*/}

                    <div className={classes.pdfViewerContainer}>
                        {loadingPDF ? (
                            <div className={classes.progressContainer}>
                                <LinearProgress style={{width: '50%'}}/>
                            </div>
                        ) : (
                            file && <PdfViewer file={file}/>
                        )}
                    </div>

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
