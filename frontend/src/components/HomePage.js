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
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import {Link} from 'react-router-dom';
import config from './config';
import {connect} from "react-redux";
import ParticlesBackground from "./ParticlesBackground";

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
        backgroundColor: '#80cbc4',
        color: '#3a3a3a',
        fontSize: 16,
        padding: '8px 30px',
        '&:hover': {
            backgroundColor: '#26a69a',
        },
        borderRadius: '10px',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        textTransform: 'none',
        marginTop: 4,
        marginBottom: 30,
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
        marginLeft: theme.spacing(1), // Add some space between the image and the text
    },
    gradientBackground: {
        background: 'linear-gradient(270deg, #26a69a, #80cbc4, #B2DFDB)',
        backgroundSize: '600% 600%',
        animation: '$gradientAnimation 20s ease infinite',
    },
    '@keyframes gradientAnimation': {
        '0%': {backgroundPosition: '0% 50%'},
        '50%': {backgroundPosition: '100% 50%'},
        '100%': {backgroundPosition: '0% 50%'},
    },
    // cardSection: {
    //     backgroundColor: '#B2DFDB',
    // },
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

                        <Grid container>
                            <Grid item xs={12}>
                                <img src={`${config.STATIC_URL}images/logos/LogoLG.png`}
                                     alt="Lawcrawl Logo"
                                     className={classes.mainLogo}/>
                            </Grid>

                            <Grid item xs={12} className={classes.logoContainer}>
                                <img src={`${config.STATIC_URL}images/logos/TextLogoLG.png`}
                                     alt="Lawcrawl Logo"
                                     className={classes.textLogo}/>
                                <Typography className={classes.alphaText}>Alpha</Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography className={classes.subTitle}>The AI legal
                                    assistant</Typography>
                                <Typography style={{fontSize: 16, marginBottom: 14}}>See
                                    what's hidden
                                    <br/>in your legal documents</Typography>
                            </Grid>

                            {/*<Grid item xs={12}>*/}
                            {/*    {!isAuthenticated && (*/}
                            {/*        <Typography style={{fontSize: '1.2vw'}}>*/}
                            {/*            Simply login, then upload your <br/> documents and chat.*/}
                            {/*        </Typography>*/}
                            {/*    )}*/}
                            {/*</Grid>*/}

                            <Grid item xs={12}>
                                {!isAuthenticated && (
                                    <Box display="flex" justifyContent="center" mt={3}>
                                        <Button
                                            variant="contained"
                                            className={classes.loginButton}
                                            component={Link}
                                            to="/login"
                                        >
                                            Login
                                        </Button>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>


                        {/*</div>*/}
                        {/*<div className={classes.cardSection}>*/}

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
                                            Our AI analyzes your documents and
                                            identifies any non-standard or unusual terms.
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
                                            Ask questions to gain clarity on areas of
                                            concern or confusion.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
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
