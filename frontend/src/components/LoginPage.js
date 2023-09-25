import React, {useEffect, useState} from 'react'
import {Link, Navigate} from 'react-router-dom'
import {connect, useDispatch, useSelector} from 'react-redux'
import {ThemeProvider, makeStyles, Button, Typography, Container, Box} from "@material-ui/core";
import TwitterIcon from "@mui/icons-material/Twitter";
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
    twitterButton: {
        backgroundColor: "#1DA1F2",
        // padding: 1,
        fontFamily: "DMSans, sans-serif",
        color: "white",
        "&:hover": {
            backgroundColor: "#0C7EBF",
        },
        borderRadius: '10px',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        textTransform: 'none',
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

    if (isAuthenticated) {
        return <Navigate to="/chat" />;
    }

    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <Container className={classes.contentContainer}>
                    <Grid container>
                        <Grid item xs={12}>
                            <img src={`${config.STATIC_URL}images/logos/LogoLG.png`}
                                 alt="Lawcrawl Logo"
                                 className={classes.mainLogo}/>
                        </Grid>
                    </Grid>
                    <Box className={classes.formContainer}>
                        <Typography className={classes.loginHeadline} variant="h4" gutterBottom>
                            Log in
                        </Typography>
                        <Typography className={classes.loginBody} variant="subtitle1">
                            to get started.
                        </Typography>
                        <Box mt={2}>
                            <Button
                                variant="contained"
                                className={classes.twitterButton}
                                onClick={loginWithTwitter}
                                startIcon={<TwitterIcon/>}
                            >
                                Twitter
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </div>
            <Footer/>
        </ThemeProvider>
    );
};

export default LoginPage;
