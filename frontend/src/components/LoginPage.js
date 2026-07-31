import React, {useEffect, useState} from 'react'
import {useNavigate, useLocation} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {Link, Navigate} from 'react-router-dom'
import {connect, useDispatch, useSelector} from 'react-redux'
import {login} from '../actions/auth';
import {
    ThemeProvider,
    makeStyles,
    Button,
    Typography,
    Container,
    Box,
    TextField
} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import LoginSocial from "./LoginSocial";
import Footer from "./Footer";
import AuthErrorAlert from "./utils";
import theme from "./Theme";
import Grid from "@material-ui/core/Grid";
import config from "./config";

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
        fontFamily: "DMSans, sans-serif",
        marginBottom: theme.spacing(2),
        color: '#667085',
        lineHeight: 1.6,
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
    loginButton: {
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
    signUpLink: {
        marginTop: theme.spacing(2),
        textDecoration: 'none',
        cursor: 'pointer',
        color: "#0f766e",
        fontWeight: 700,
        '&:hover': {
            textDecoration: 'underline',
        },
    },
    passwordLink: {
        marginTop: theme.spacing(2),
        textDecoration: 'none',
        cursor: 'pointer',
        color: '#c24132',
        fontWeight: 700,
        '&:hover': {
            textDecoration: 'underline',
        },
    },
}));

const LoginPage = ({login, isAuthenticated}) => {

    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }

    const classes = useStyles();
    const navigate = useNavigate();
    const query = useQuery();
    const activationEmail = query.get("activation_email");
    const authError = useSelector(state => state.auth.authError);
    const {register, handleSubmit, formState: {errors}} = useForm();

    const onSubmit = data => {
        login(data.email, data.password);
    };

    if (isAuthenticated) {
        navigate('/chat');
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
                            Login
                        </Typography>

                        {activationEmail && (
                            <Grid item xs={12}>
                                <Alert variant="filled" severity="info">
                                    Account created. Please check your email (and spam folder) to activate your
                                    account.
                                </Alert>
                            </Grid>
                        )}

                        {/* Display Djoser error */}
                        <AuthErrorAlert authError={authError} />

                        <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
                            <TextField
                                label="Email"
                                className={classes.textField}
                                InputLabelProps={{className: classes.blackLabel}}
                                InputProps={{
                                    className: classes.creamInput
                                }}
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
                            />
                            <TextField
                                label="Password"
                                className={classes.textField}
                                InputLabelProps={{className: classes.blackLabel}}
                                InputProps={{
                                    className: classes.creamInput
                                }}
                                variant="outlined"
                                type="password"
                                name="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters long',
                                    },
                                })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                fullWidth
                                margin="normal"
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                className={classes.loginButton}
                            >
                                Login
                            </Button>
                        </form>

                        <Link to="/reset_password" className={classes.passwordLink}>
                            Forgot your password?
                        </Link>

                        <Link to="/signup" className={classes.signUpLink}>
                            Don't have an account? <br/>
                            Sign up
                        </Link>

                        {/* Social Login Buttons */}
                        <LoginSocial/>

                    </Box>
                </Container>
            <Footer/>
            </Box>
        </ThemeProvider>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});
export default connect(mapStateToProps, {login})(LoginPage);
