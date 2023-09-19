import React, {useEffect, useState} from 'react'
import {Link, Navigate} from 'react-router-dom'
import {connect, useDispatch, useSelector} from 'react-redux'
import {ThemeProvider, makeStyles, Button, Typography, Container, Box} from "@material-ui/core";
import TwitterIcon from "@mui/icons-material/Twitter";
import Footer from "./Footer";
import theme from "./Theme";
import axios from "axios";

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
    loginHeadline: {
        fontFamily: "DMSans, sans-serif",
    },
    loginBody: {
        maxWidth: 400,
        textAlign: "center"
    },
    twitterButton: {
        backgroundColor: "#1DA1F2",
        fontFamily: "DMSans, sans-serif",
        color: "white",
        "&:hover": {
            backgroundColor: "#0C7EBF",
        },
    },
}));

const Login = ({isAuthenticated}) => {
    const loginWithTwitter = async () => {
        // Logic for logging in with Twitter
        try {
            console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
            const res = await axios.get(`/auth/o/twitter/?redirect_uri=${process.env.REACT_APP_API_URL}/home`)
            window.location.replace(res.data.authorization_url)

        } catch (err) {
            console.log("Error logging in")
        }
    };

    if (isAuthenticated) {
        return <Navigate to="/home"/>;
    }

    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <Container className={classes.contentContainer}>
                    <Box className={classes.formContainer}>
                        <Typography className={classes.loginHeadline} variant="h4" gutterBottom>
                            Log in
                        </Typography>
                        <Typography className={classes.loginBody} variant="subtitle1">
                            Log in, then contact your congressperson and
                            post to Twitter to make your voice heard
                        </Typography>
                        <Box mt={2}>
                            <Button
                                variant="contained"
                                className={classes.twitterButton}
                                onClick={loginWithTwitter}
                                startIcon={<TwitterIcon/>}
                            >
                                Log in with Twitter
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </div>
            <Footer/>
        </ThemeProvider>
    );
};

export default Login;
