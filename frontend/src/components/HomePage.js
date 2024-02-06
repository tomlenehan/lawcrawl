import React from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import DescriptionIcon from '@material-ui/icons/Description';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import ChatIcon from '@material-ui/icons/Chat';
import Footer from "./Footer";
import theme from './Theme';
import {Box, Button, ThemeProvider} from "@material-ui/core";
import LoginIcon from '@mui/icons-material/Login';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import {Link} from 'react-router-dom';
import config from './config';
import {connect} from "react-redux";
import ParticlesBackground from "./ParticlesBackground";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MailOutlineIcon from '@material-ui/icons/MailOutline';


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: 'scroll',
        justifyContent: 'center',
        minHeight: "100vh",
    },
    chatContainer: {
        paddingTop: 60,
        textAlign: 'center',
        paddingHorizontal: 20,

        position: 'relative',
        zIndex: 500,
    },
    mainLogo: {
        color: '#3a3a3a',
        height: 'auto',
        width: 100,
        margin: '0 auto',
        display: 'block',
    },
    textLogo: {
        height: 'auto',
        width: 240,
        marginTop: 20,
    },
    subTitle: {
        fontSize: 22,
        marginBottom: 14,
    },
    description: {
        fontSize: '1.5vw',
    },
    icon: {
        fontSize: 60,
        color: '#3a3a3a',
    },
    plusIcon: {
        fontSize: 15,
        margin: '0 20px',
        color: '#3a3a3a',
    },
    openAILogo: {
        height: 60,
        color: '#3a3a3a',
    },
    iconContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 68,
    },
    loginButton: {
        backgroundColor: '#B2DFDB',
        color: '#3a3a3a',
        height: 48,
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 12,
        padding: '8px 30px',
        '&:hover': {
            backgroundColor: '#80cbc4',
        },
        borderRadius: '10px',
        border: '1px solid #1DA1F2',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        textTransform: 'none',
        marginBottom: 20,
    },
    signupButton: {
        backgroundColor: '#B2DFDB',
        color: '#3a3a3a',
        height: 48,
        fontWeight: 'bold',
        fontSize: 14,
        padding: '8px 30px',
        '&:hover': {
            backgroundColor: '#80cbc4',
        },
        borderRadius: '10px',
        border: '1px solid #F44336',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        textTransform: 'none',
        marginBottom: 20,
    },
    blogButton: {
        backgroundColor: '#B2DFDB',
        color: '#3a3a3a',
        fontWeight: 'bold',
        height: 48,
        fontSize: 14,
        padding: '8px 30px',
        '&:hover': {
            backgroundColor: '#80cbc4',
        },
        borderRadius: '10px',
        border: '1px solid #F44336',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        textTransform: 'none',
        marginBottom: 4,
        marginLeft: 16,
    },
    contactButton: {
        backgroundColor: '#26a69a', // Adjust color as needed
        color: '#3a3a3a',
        '&:hover': {
            backgroundColor: '#80cbc4',
        },
        padding: '10px 20px',
        textTransform: 'none',
        borderRadius: '5px',
    },
    card: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        margin: 30,
        textAlign: 'center',
        backgroundColor: '#B2DFDB',
        color: '#3a3a3a',
        padding: theme.spacing(2),
        transition: '0.3s',
        maxWidth: 345,
        '&:hover': {
            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
        },
    },
    cardGridItem: {
        display: 'flex',
        justifyContent: 'center'
    },
    cardHeader: {
        paddingBottom: 0,
        fontSize: 18,
        marginBottom: -12,
    },
    cardContent: {
        paddingTop: 0,
    },
    cardIcon: {
        fontSize: '2.6rem',
        color: '#26a69a',
    },
    logoContainer: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 50,
    },
    alphaText: {
        fontSize: 14,
        color: '#F44336',
        fontWeight: 'bold',
        marginLeft: theme.spacing(1),
    },
    gradientBackground: {
        background: 'linear-gradient(270deg, #B2DFDB, #26a69a, #B2DFDB)',
        backgroundSize: '600% 600%',
        animation: '$gradientAnimation 25s ease infinite',
    },
    '@keyframes gradientAnimation': {
        '0%': {backgroundPosition: '0% 50%'},
        '50%': {backgroundPosition: '100% 50%'},
        '100%': {backgroundPosition: '0% 50%'},
    },
    videoContainer: {
        textAlign: 'center',
        marginBottom: theme.spacing(4),
        marginTop: theme.spacing(4),
    },
    videoEmbed: {
        width: '100%',
        maxWidth: 560,
        height: 315,
        margin: 'auto',
    },
}));

const HomePage = ({isAuthenticated}) => {
    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                {/* Gradient Background Section */}
                <ParticlesBackground/>
                <div className={classes.gradientBackground}>

                    <div className={classes.chatContainer}>

                        {/* Main logo and video container */}
                        <Grid container spacing={4} alignItems="center" justifyContent="center">
                            {/* Logo and Text */}
                            <Grid item xs={0}  md={1}></Grid>
                            <Grid item xs={12} md={3} >
                                <img src={`${config.STATIC_URL}images/logos/LogoLGGreen.png`}
                                     alt="Lawcrawl Logo"
                                     className={classes.mainLogo}/>
                                <img src={`${config.STATIC_URL}images/logos/TextLogoLG.png`}
                                     alt="Lawcrawl Text Logo"
                                     className={classes.textLogo}/>
                                <Typography className={classes.subTitle}>
                                    Contract Review, Simplified
                                </Typography>
                                {!isAuthenticated && (
                                    <Box display="flex" justifyContent="center" mt={3}>
                                        <Button
                                            variant="contained"
                                            className={classes.loginButton}
                                            startIcon={<LoginIcon/>}
                                            component={Link}
                                            to="/login"
                                        >
                                            Login
                                        </Button>
                                        <Button
                                            variant="contained"
                                            className={classes.signupButton}
                                            startIcon={<PersonAddIcon/>}
                                            component={Link}
                                            to="/signup"
                                        >
                                            Signup
                                        </Button>
                                    </Box>
                                )}
                            </Grid>

                            {/* YouTube Video */}
                            <Grid item xs={12} md={8}>
                                <div className={classes.videoContainer}>
                                    <iframe
                                        width="560"
                                        height="315"
                                        src="https://www.youtube.com/embed/79sVS0kHBEY?si=paYIRA13WcwRNPTx"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title="Lawcrawl Video"
                                    ></iframe>
                                </div>
                            </Grid>
                        </Grid>


                        {/* Description Cards */}
                        <Grid container spacing={2} style={{marginTop: 30}}>
                            <Grid item xs={12} md={4} className={classes.cardGridItem}>
                                <Card className={classes.card}>
                                    <Box textAlign="center" paddingTop={2}>
                                        <DescriptionIcon className={classes.cardIcon}/>
                                    </Box>
                                    <CardHeader
                                        title={<Typography className={classes.cardHeader}>Upload
                                            Documents</Typography>}
                                    />
                                    <CardContent>
                                        <Typography variant="body2">
                                            Upload your contracts, invoices, agreements, or any
                                            other document you have questions about.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4} className={classes.cardGridItem}>
                                <Card className={classes.card}>
                                    <Box textAlign="center" paddingTop={2}>
                                        <FindInPageIcon className={classes.cardIcon}/>
                                    </Box>
                                    <CardHeader
                                        title={<Typography className={classes.cardHeader}>See
                                            What's Hidden</Typography>}
                                    />
                                    <CardContent>
                                        <Typography variant="body2">
                                            Our AI is trained to analyze your document and
                                            identify any terms that are non-standard or unusual.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4} className={classes.cardGridItem}>
                                <Card className={classes.card}>
                                    <Box textAlign="center" paddingTop={2}>
                                        <ChatIcon className={classes.cardIcon}/>
                                    </Box>
                                    <CardHeader
                                        title={<Typography className={classes.cardHeader}>Chat with
                                            Your
                                            Assistant</Typography>}
                                    />
                                    <CardContent>
                                        <Typography variant="body2">
                                            Continue asking questions to gain clarity on areas of
                                            concern or confusion.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} style={{marginTop: 80}}>
                                <Box display="flex" alignItems="center" justifyContent="center">
                                    <Typography style={{fontSize: 16, marginRight: 8}}>
                                        Learn More Here
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        className={classes.loginButton}
                                        startIcon={<LibraryBooksIcon/>}
                                        component={Link}
                                        to="/blog_list"
                                    >
                                        Blog
                                    </Button>
                                {/*</Box>*/}
                                {/*<Box display="flex" alignItems="center" justifyContent="center">*/}
                                    <Typography style={{fontSize: 16, marginRight: 8}}>
                                        or
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        className={classes.signupButton}
                                        startIcon={<MailOutlineIcon/>}
                                        href="mailto:tess@lawcrawl.com,tom@lawcrawl.com"
                                    >
                                        Contact Us
                                    </Button>
                                </Box>
                            </Grid>

                            {/*<Grid item xs={12} style={{marginTop: 30}}>*/}
                            {/*    <Box display="flex" alignItems="center" justifyContent="center">*/}
                            {/*        <Typography style={{fontSize: 16, marginRight: 8}}>*/}
                            {/*            Have Questions?*/}
                            {/*        </Typography>*/}
                            {/*        <Button*/}
                            {/*            variant="contained"*/}
                            {/*            color="primary"*/}
                            {/*            className={classes.contactButton}*/}
                            {/*            startIcon={<MailOutlineIcon/>}*/}
                            {/*            href="mailto:tess@lawcrawl.com,tom@lawcrawl.com"*/}
                            {/*        >*/}
                            {/*            Contact Us*/}
                            {/*        </Button>*/}
                            {/*    </Box>*/}
                            {/*</Grid>*/}


                        </Grid>

                    </div>
                    <Footer/>
                </div>
            </div>

        </ThemeProvider>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
});
export default connect(mapStateToProps)(HomePage);
