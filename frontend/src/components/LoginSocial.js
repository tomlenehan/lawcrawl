import {Box, Button, makeStyles} from "@material-ui/core";
import axios from "axios";
import GoogleIcon from "@mui/icons-material/Google";
import TwitterIcon from "@mui/icons-material/Twitter";
import React from "react";


const API_URL = process.env.REACT_APP_API_URL || window.location.origin;


const useStyles = makeStyles((theme) => ({
    twitterButton: {
        backgroundColor: "#ffffff",
        borderRadius: 6,
        border: '1px solid rgba(29, 161, 242, 0.28)',
        boxShadow: 'none',
        color: "#145b87",
        minHeight: 42,
        minWidth: 150,
        textTransform: 'none',
        padding: '6px 18px',
        margin: theme.spacing(0.75, 0),
        "&:hover": {
            backgroundColor: "#eef7fd",
            boxShadow: 'none',
        },
    },
    googleButton: {
        backgroundColor: "#ffffff",
        color: "#174ea6",
        border: '1px solid rgba(66, 133, 244, 0.28)',
        textTransform: 'none',
        padding: '6px 18px',
        minHeight: 42,
        minWidth: 150,
        "&:hover": {
            backgroundColor: "#f3f7ff",
            boxShadow: 'none',
        },
        borderRadius: 6,
        boxShadow: 'none',
        margin: theme.spacing(2, 0, 0.75),
    },
    socialWrap: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
    },
}));


const LoginSocial = () => {

    const classes = useStyles();

    const loginWithTwitter = async () => {
        // Logic for logging in with Twitter
        try {
            const res = await axios.get(`/auth/o/twitter/?redirect_uri=${API_URL}/chat`)
            window.location.replace(res.data.authorization_url)

        } catch (err) {
            console.log("Error logging in")
        }
    };

    const loginWithGoogle = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/o/google-oauth2/?redirect_uri=${API_URL}/chat`)
            window.location.replace(res.data.authorization_url)

        } catch (err) {
            console.log("Error logging in")
        }
    };

    return (
        <Box className={classes.socialWrap}>
            <Button
                variant="contained"
                className={`${classes.googleButton} ${classes.commonButton}`}
                onClick={loginWithGoogle}
                startIcon={<GoogleIcon/>}
            >
                <Box style={{padding: 4, textDecoration: 'none'}}>
                    Google
                </Box>
            </Button>

            <Button
                variant="contained"
                className={`${classes.twitterButton} ${classes.commonButton}`}
                onClick={loginWithTwitter}
                startIcon={<TwitterIcon/>}
            >
                <Box style={{padding: 4, textDecoration: 'none'}}>
                    Twitter
                </Box>
            </Button>
        </Box>
    )
}

export default LoginSocial;
