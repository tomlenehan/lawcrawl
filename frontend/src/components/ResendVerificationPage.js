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
        overflowY: "auto",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: '#f6f8f6',
    },
    contentContainer: {
        display: "flex",
        flexDirection: "column",
        paddingTop: theme.spacing(7),
        paddingBottom: theme.spacing(7),
        alignItems: "center",
        textAlign: "center",
    },
    formContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        width: '100%',
        maxWidth: 380,
        marginBottom: theme.spacing(3),
        padding: theme.spacing(4),
        backgroundColor: '#ffffff',
        border: '1px solid rgba(15, 118, 110, 0.12)',
        borderRadius: 8,
        boxShadow: '0 20px 50px rgba(32, 33, 36, 0.08)',
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(3),
        },
    },
    mainLogo: {
        width: 76,
        margin: '0 auto',
        display: 'block',
        marginBottom: theme.spacing(2),
    },
    loginHeadline: {
        fontFamily: "DMSans, sans-serif",
        marginBottom: theme.spacing(1),
        color: '#202124',
        fontWeight: 900,
    },
    loginDescription: {
        color: '#667085',
        lineHeight: 1.6,
    },
    verifyButton: {
        backgroundColor: '#0f766e',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
        padding: '8px 30px',
        '&:hover': {
            backgroundColor: '#0b5f59',
            boxShadow: 'none',
        },
        borderRadius: 6,
        border: 'none',
        boxShadow: 'none',
        textTransform: 'none',
        marginTop: 4,
        marginBottom: 30,
        width: '100%',
        minHeight: 44,
    },
    signupLink: {
        marginTop: theme.spacing(2),
        textDecoration: 'none',
        cursor: 'pointer',
        color: "#0f766e",
        fontWeight: 700,
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
                            onClick={() => resend_verification(activationEmail)}
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
