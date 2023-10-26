import React, {useEffect, useState} from 'react'
import {Link, Navigate} from 'react-router-dom'
import {connect, useDispatch, useSelector} from 'react-redux'
import {ThemeProvider, makeStyles, Button, Typography, Container, Box} from "@material-ui/core";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleIcon from "@mui/icons-material/Google";
import Footer from "./Footer";
import theme from "./Theme";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import config from "./config";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: "scroll",
        justifyContent: "center",
        height: "100vh",
    },
    contentContainer: {
        paddingTop: 60,
        textAlign: "left",
    },
    formContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    mainLogo: {
        width: 100,
        margin: '0 auto',
        display: 'block',
    },
    loginHeadline: {
        fontFamily: "DMSans, sans-serif",
    },
    loginBody: {
        maxWidth: 400,
        textAlign: "center"
    },
    buttonContainer: {
        textAlign: "center",
        borderRadius: 15,
        marginBottom: 20,
        width: '100%',
        maxWidth: 400,
        marginTop: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    commonButton: {
        borderRadius: 25,
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        margin: theme.spacing(1, 0),
        textTransform: 'none',
        maxWidth: 200,
        width: '200px',
        marginTop: 25,
    },
    twitterButton: {
        backgroundColor: "#1DA1F2",
        paddingTop: 0,
        paddingBottom: 0,
        borderRadius: '50px',
        color: "white",
        textTransform: 'none',
        "&:hover": {
            backgroundColor: "#0C7EBF",
        },
    },
    googleButton: {
        backgroundColor: "#4285F4",
        color: "white",
        paddingTop: 0,
        paddingBottom: 0,
        textTransform: 'none',
        "&:hover": {
            backgroundColor: "#357abd",
        },
        borderRadius: '50px',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        margin: theme.spacing(1, 0),
        maxWidth: 200,
        marginTop: 25,
    },
}));

const LoginPage = ({isAuthenticated}) => {

    const loginWithTwitter = async () => {
        // Logic for logging in with Twitter
        try {
            console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
            const res = await axios.get(`/auth/o/twitter/?redirect_uri=${process.env.REACT_APP_API_URL}/upload`)
            window.location.replace(res.data.authorization_url)

        } catch (err) {
            console.log("Error logging in")
        }
    };

    const loginWithGoogle = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/o/google-oauth2/?redirect_uri=${process.env.REACT_APP_API_URL}/upload`)
            window.location.replace(res.data.authorization_url)

        } catch (err) {
            console.log("Error logging in")
        }
    };

    if (isAuthenticated) {
        return <Navigate to="/chat"/>;
    }

    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <Box className={classes.root}>
                <Container className={classes.contentContainer}>
                    <Grid container>
                        <Grid item xs={12}>
                            <img src={`${config.STATIC_URL}images/logos/LogoLG.png`}
                                 alt="Lawcrawl Logo"
                                 className={classes.mainLogo}/>
                        </Grid>
                    </Grid>
                    <Box className={classes.formContainer}>
                        <Typography className={classes.loginHeadline} variant="h4"
                                    gutterBottom>
                            Log in
                        </Typography>
                        <Typography className={classes.loginBody} variant="subtitle1">
                            to get started.
                        </Typography>
                        <Box className={classes.buttonContainer}>

                            <Button
                                variant="contained"
                                className={`${classes.googleButton} ${classes.commonButton}`}
                                onClick={loginWithGoogle}
                                startIcon={<GoogleIcon/>}
                            >
                                <Box style={{padding: 4, textDecoration: 'None'}}>
                                    Google
                                </Box>
                            </Button>

                            <Button
                                variant="contained"
                                className={`${classes.twitterButton} ${classes.commonButton}`}
                                onClick={loginWithTwitter}
                                startIcon={<TwitterIcon/>}
                            >
                                <Box style={{padding: 4, textDecoration: 'None'}}>
                                    Twitter
                                </Box>
                            </Button>

                        </Box>
                    </Box>
                </Container>
            </Box>
            <Footer/>
        </ThemeProvider>
    );
};

export default LoginPage;
