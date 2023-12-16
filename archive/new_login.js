import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom';
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
import TextField from '@material-ui/core/TextField';
import {useForm} from "react-hook-form";


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
        marginTop: 15,
    },
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

const LoginPage = ({isAuthenticated}) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const {register, handleSubmit, formState: {errors}} = useForm();

    // State for login form
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

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


                            {/* Standard Login Form */}
                            <form onSubmit={handleSubmit(handleStandardLogin)}
                                  className={classes.formContainer}>
                                <TextField
                                    label="Username"
                                    variant="outlined"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    {...register("username", {required: true})} // If using react-hook-form
                                />
                                {errors.username && <span>Username is required</span>}

                                <TextField
                                    label="Password"
                                    type="password"
                                    variant="outlined"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    {...register("password", {required: true})} // If using react-hook-form
                                />
                                {errors.password && <span>Password is required</span>}

                                <Button
                                    type="submit"
                                    variant="contained"
                                    className={classes.commonButton}
                                >
                                    Login
                                </Button>
                            </form>

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
                    </Box>
                </Container>
            </Box>
            <Footer/>
        </ThemeProvider>
    );
};

export default LoginPage;
