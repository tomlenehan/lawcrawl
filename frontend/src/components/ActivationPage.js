import React, {useState} from 'react';
import {useDispatch, useSelector, connect} from 'react-redux';
import {useNavigate, useParams} from 'react-router-dom';
import {
    makeStyles,
    TextField,
    Button,
    Container,
    Typography,
    Box,
    ThemeProvider
} from '@material-ui/core';
import { verify } from '../actions/auth';
import Grid from "@material-ui/core/Grid";
import config from "./config";
import theme from "./Theme";
import Footer from "./Footer";
import {Link} from "react-router-dom";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: "scroll",
        justifyContent: "center",
        height: "100vh",
    },
    contentContainer: {
        display: "flex",
        flexDirection: "column",
        paddingTop: 60,
        alignItems: "center",
        textAlign: "center",
    },
    formContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        marginBottom: 20,
        maxWidth: 220,
    },
    mainLogo: {
        width: 100,
        margin: '0 auto',
        display: 'block',
    },
    loginHeadline: {
        fontFamily: "DMSans, sans-serif",
        marginBottom: 0,
        color: '#3a3a3a',
    },
    submitButton: {
        backgroundColor: '#80cbc4',
        borderRadius: '50px',
        color: '#3a3a3a',
        textTransform: 'none',
        padding: '4px 25px',
        width: 140,
        height: 40,
        marginTop: 22,
        "&:hover": {
            backgroundColor: '#26a69a',
        },
    },
    signupLink: {
        marginTop: theme.spacing(2),
        textDecoration: 'none',
        cursor: 'pointer',
        color: "#4285F4",
        '&:hover': {
            textDecoration: 'underline',
        },
    },
}));

const ActivationPage = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [verified, setVerified] = useState(false);
    const authError = useSelector(state => state.auth.authError);
    const params = useParams();

    const verify_account = e => {
        const uid = params.uid;
        const token = params.token;

        dispatch(verify(uid, token));
        setVerified(true);
    };

    const renderAuthError = () => {
        if (typeof authError === 'string') {
            return <Alert variant="filled" severity="error">{authError}</Alert>;
        } else if (authError && authError.field && authError.message) {
            return (
                <Alert variant="filled" severity="error">
                    {`${authError.field}: ${authError.message}`}
                </Alert>
            );
        }
    };

    if (verified) {
        navigate('/login')
    }

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
                            Verify
                        </Typography>

                        {/* Display Djoser error */}
                        {authError && (
                            <Alert variant="filled" severity="error">
                                {authError.field ? `${authError.field}: ` : ''}{authError.message}
                            </Alert>
                        )}

                        <Typography className={classes.loginDescription} gutterBottom>
                            Click Verify to activate your account.
                        </Typography>

                        <Button
                            onClick={verify_account}
                            style={{marginTop: '20px'}}
                            type='button'
                            className={classes.verifyButton}
                        >
                            Verify
                        </Button>

                        {/*<Link to="/login" className={classes.signupLink}>*/}
                        {/*    Back to Login*/}
                        {/*</Link>*/}

                    </Box>
                </Container>
            </Box>
            <Footer/>
        </ThemeProvider>
    );
};

export default ActivationPage;