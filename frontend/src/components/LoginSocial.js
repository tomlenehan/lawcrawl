import {Box, Button, makeStyles} from "@material-ui/core";
import axios from "axios";
import GoogleIcon from "@mui/icons-material/Google";
import TwitterIcon from "@mui/icons-material/Twitter";
import React from "react";


const useStyles = makeStyles((theme) => ({
    twitterButton: {
        backgroundColor: "#1DA1F2",
        borderRadius: '50px',
        color: "white",
        textTransform: 'none',
        padding: '4px 25px',
        maxWidth: 150,
        "&:hover": {
            backgroundColor: "#0C7EBF",
        },
    },
    googleButton: {
        backgroundColor: "#4285F4",
        color: "white",
        textTransform: 'none',
        padding: '4px 25px',
        "&:hover": {
            backgroundColor: "#357abd",
        },
        borderRadius: '50px',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        margin: theme.spacing(1, 0),
        maxWidth: 150,
        marginTop: 20,
    },
}));


const LoginSocial = () => {

    const classes = useStyles();

    const loginWithTwitter = async () => {
        // Logic for logging in with Twitter
        try {
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

    return (
        <Box>
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
                <Box style={{padding: 4, textDecoration: 'none !important'}}>
                    Twitter
                </Box>
            </Button>
        </Box>
    )
}

export default LoginSocial;