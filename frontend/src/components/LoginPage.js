import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom';
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
import theme from "./Theme";
import Grid from "@material-ui/core/Grid";
import config from "./config";

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
    mainLogo: {
        width: 100,
        margin: '0 auto',
        display: 'block',
    },
    loginHeadline: {
        fontFamily: "DMSans, sans-serif",
        marginBottom: 0,
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
    loginButton: {
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
    signUpLink: {
        marginTop: theme.spacing(2),
        textDecoration: 'none',
        cursor: 'pointer',
        color: "#4285F4",
        '&:hover': {
            textDecoration: 'underline',
        },
    },
}));

const LoginPage = ({login, isAuthenticated}) => {
    const classes = useStyles();
    const navigate = useNavigate();
    const authError = useSelector(state => state.auth.authError);
    const {register, handleSubmit, formState: {errors}} = useForm();

    const onSubmit = data => {
        console.log("submitting_login", data);
        login(data.email, data.password);
    };

    if (isAuthenticated) {
        console.log("isAuthenticated");
        navigate('/upload');
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

                        {authError &&
                            <Alert variant="filled" severity="error">{authError}</Alert>}

                        <form onSubmit={handleSubmit(onSubmit)}>
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

                        <Link to="/signup" className={classes.signUpLink}>
                            Don't have an account? <br/>
                            Sign up
                        </Link>

                        {/* Social Login Buttons */}
                        <LoginSocial/>

                    </Box>
                </Container>
            </Box>
            <Footer/>
        </ThemeProvider>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});
export default connect(mapStateToProps, {login})(LoginPage);
