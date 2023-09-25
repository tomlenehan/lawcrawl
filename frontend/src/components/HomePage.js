import React from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Footer from "./Footer";
import theme from './Theme';
import {Box, Button, ThemeProvider} from "@material-ui/core";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import AddIcon from '@mui/icons-material/Add';
import {Link} from 'react-router-dom';
import config from './config';
import {connect} from "react-redux";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: 'scroll',
        justifyContent: 'center',
        minHeight: "100vh",
        paddingBottom: 50,
    },
    chatContainer: {
        paddingTop: 60,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    mainLogo: {
        color: '#3a3a3a',
        height: 'auto',
        width: 100,
        margin: '0 auto',
        display: 'block',
    },
    // textLogo: {
    //     fontSize: '4.5vw',
    //     marginTop: -10,
    // },
    textLogo: {
        height: 'auto',
        width: 240,
        marginTop: 20,
    },
    subTitle: {
        fontSize: '2.2vw',
        marginBottom: 25,
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
        marginTop: 50,
    },
    loginButton: {
        backgroundColor: '#80cbc4',
        color: '#3a3a3a',
        fontSize: '1.6vw',
        padding: '10px 30px',
        '&:hover': {
            backgroundColor: '#26a69a',  // Darker color on hover   bv
        },
        borderRadius: '10px',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        textTransform: 'none',
        marginTop: 40,
    },
}));

const HomePage = ({ isAuthenticated }) => {
    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <div className={classes.chatContainer}>
                    <Grid container>
                        <Grid item xs={12}>
                            <img src={`${config.STATIC_URL}images/logos/LogoLG.png`}
                                 alt="Lawcrawl Logo"
                                 className={classes.mainLogo}/>
                        </Grid>

                        <Grid item xs={12}>
                            <img src={`${config.STATIC_URL}images/logos/TextLogoLG.png`}
                                 alt="Lawcrawl Logo"
                                 className={classes.textLogo}/>
                            {/*<Typography className={classes.textLogo}>Law Crawl</Typography>*/}
                            <Typography className={classes.subTitle}>Your personal AI legal
                                advisor</Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography className={classes.description}>
                                Simply upload your documents. <br/>
                                Our AI model has been trained on the law<br/>
                                and knows your case.
                            </Typography>
                        </Grid>

                        <Grid item xs={12} style={{marginTop: -45}}>
                            <div className={classes.iconContainer}>
                                <LibraryBooksIcon className={classes.icon}/>
                                <AddIcon className={classes.plusIcon}/>
                                <img className={classes.openAILogo}
                                     src={`${config.STATIC_URL}images/logos/OpenAILogoGrey.png`}
                                     alt="OpenAI Logo"/>
                            </div>
                        </Grid>

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
                </div>
            </div>
            <Footer/>
        </ThemeProvider>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
});
export default connect(mapStateToProps)(HomePage);
