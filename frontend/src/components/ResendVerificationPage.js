import React, {useState} from 'react';
import {useDispatch, useSelector, connect} from 'react-redux';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {
    makeStyles,
    TextField,
    Button,
    Container,
    Typography,
    Box,
    ThemeProvider
} from '@material-ui/core';
import { resend_activation } from '../actions/auth';
import Grid from "@material-ui/core/Grid";
import config from "./config";
import theme from "./Theme";
import Footer from "./Footer";
import {Link} from "react-router-dom";
import Alert from "@material-ui/lab/Alert";
import {useQuery} from "react-query";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: "scroll",
        justifyContent: "center",
        minHeight: "100vh",
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
    verifyButton: {
        backgroundColor: '#fdfbee',
        color: '#3a3a3a',
        fontWeight: 'bold',
        fontSize: 16,
        padding: '8px 30px',
        '&:hover': {
            backgroundColor: '#80cbc4',
        },
        borderRadius: '10px',
        border: '2px solid #1DA1F2',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        textTransform: 'none',
        marginTop: 4,
        marginBottom: 30,
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

const ResendVerificationPage = () => {

    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }

    const classes = useStyles();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [resent, setResent] = useState(false);
    const query = useQuery();
    const activationEmail = query.get("activation_email");
    const authError = useSelector(state => state.auth.authError);
    const params = useParams();

    const resend_verification = (activationEmail) => {
        dispatch(resend_activation(activationEmail));
        setResent(true);
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
                            Check Your Email
                        </Typography>

                        {/* Display Djoser error */}
                        {/*{authError && (*/}
                        {/*    <Alert variant="filled" severity="error">*/}
                        {/*        {authError.field ? `${authError.field}: ` : ''}{authError.message}*/}
                        {/*    </Alert>*/}
                        {/*)}*/}

                        <Typography className={classes.loginDescription} gutterBottom>
                            (and spam) to verify your account.
                            Click below to resend.
                        </Typography>

                        <Button
                            onClick={resend_activation(activationEmail)}
                            style={{marginTop: '20px'}}
                            type='button'
                            className={classes.verifyButton}
                        >
                            Resend
                        </Button>

                        <Link to="/login" className={classes.signupLink}>
                            Back to Login
                        </Link>

                    </Box>
                </Container>

            </Box>
            <Footer/>
        </ThemeProvider>
    );
};

export default ResendVerificationPage;