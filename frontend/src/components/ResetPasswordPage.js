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
import {reset_password} from '../actions/auth';
import Grid from "@material-ui/core/Grid";
import config from "./config";
import theme from "./Theme";
import Footer from "./Footer";
import {Link} from "react-router-dom";
import Alert from "@material-ui/lab/Alert";
import AuthErrorAlert from "./utils";
import {useForm} from "react-hook-form";
import CircularProgress from "@material-ui/core/CircularProgress";

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
    form: {
        width: '100%',
    },
    textField: {
        minWidth: 0,
        width: '100%',
        color: '#202124',
    },
    blackLabel: {
        color: '#667085',
    },
    creamInput: {
        backgroundColor: '#ffffff',
        '&:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 1000px #ffffff inset`,
            WebkitTextFillColor: '#202124',
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
    submitButton: {
        backgroundColor: '#0f766e',
        borderRadius: 6,
        color: '#ffffff',
        textTransform: 'none',
        padding: '8px 25px',
        width: '100%',
        height: 44,
        marginTop: 22,
        boxShadow: 'none',
        fontWeight: 800,
        "&:hover": {
            backgroundColor: '#0b5f59',
            boxShadow: 'none',
        },
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

const ResetPasswordPage = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {register, handleSubmit, formState: {errors}} = useForm();
    const authError = useSelector(state => state.auth.authError);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const onSubmit = data => {
        dispatch(reset_password(data.email));
        setFormSubmitted(true);
    };

    // if (verified) {
    //     navigate('/login')
    // }

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
                            Password Reset
                        </Typography>

                        {/* Display Djoser error */}
                        <AuthErrorAlert authError={authError} />

                        {formSubmitted ? (
                            <Typography className={classes.loginDescription}>
                                Please check your email for password reset instructions.
                            </Typography>
                        ) : (
                            <>
                                <Typography className={classes.loginDescription} gutterBottom>
                                    Please provide your email address and we will send you a link
                                    to reset your password.
                                </Typography>

                                <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
                                    <TextField
                                        label="Email"
                                        className={classes.textField}
                                        InputLabelProps={{className: classes.blackLabel}}
                                        InputProps={{className: classes.creamInput}}
                                        variant="outlined"
                                        type="email"
                                        name="email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: 'Invalid email address',
                                            },
                                        })}
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        fullWidth
                                        margin="normal"
                                        disabled={formSubmitted}
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        className={classes.submitButton}
                                        disabled={formSubmitted}
                                    >
                                        {formSubmitted ? <CircularProgress size={24}/> : 'Send'}
                                    </Button>
                                </form>
                            </>
                        )}

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

export default ResetPasswordPage;
