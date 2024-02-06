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
    textField: {
        minWidth: 200,
        width: '100%',
        color: '#3a3a3a',
    },
    blackLabel: {
        color: '#3a3a3a',
    },
    creamInput: {
        backgroundColor: '#fdfbee',
        '&:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 1000px #fdfbee inset`,
            WebkitTextFillColor: '#3a3a3a',
        },
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

                                <form onSubmit={handleSubmit(onSubmit)}>
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