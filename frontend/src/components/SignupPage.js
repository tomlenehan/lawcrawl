import React, { useState, useEffect } from 'react';
import {useForm} from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {
    makeStyles,
    TextField,
    Button,
    Container,
    Typography,
    Box,
    ThemeProvider, FormControl, InputLabel, Select, MenuItem
} from '@material-ui/core';
import {Checkbox, FormControlLabel} from '@material-ui/core';
import {signup} from '../actions/auth';
import Grid from "@material-ui/core/Grid";
import config from "./config";
import theme from "./Theme";
import Footer from "./Footer";
import {Link} from "react-router-dom";
import Alert from "@material-ui/lab/Alert";
import AuthErrorAlert from "./utils";

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
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
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
            WebkitBoxShadow: `0 0 0 1000px #fdfbee inset`, // Override the autofill background color
            WebkitTextFillColor: '#3a3a3a', // You can also change the text color if needed
        },
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
    customCheckbox: {
        '&$checked': {
            color: '#26a69a',
        },
    },
    checked: {},
}));

const SignupPage = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [accountCreated, setAccountCreated] = useState(false);
    const [accountEmail, setAccountEmail] = useState(null);
    const signupSuccess = useSelector(state => state.auth.signupSuccess);
    const [newsletterOptIn, setNewsletterOptIn] = useState(false);
    const authError = useSelector(state => state.auth.authError);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const {register, handleSubmit, formState: {errors}} = useForm();

    const onSubmit = async (data) => {
        await dispatch(signup(data.first_name, data.last_name, data.email, data.password, data.re_password, newsletterOptIn));
        setAccountEmail(data.email);
    };

    useEffect(() => {
        if (signupSuccess && !authError && accountEmail) {
            setAccountCreated(true);
            navigate("/login?activation_email=" + accountEmail);
        }
    }, [signupSuccess, authError, accountEmail, navigate]);


    const handleNewsletterChange = (event) => {
        setNewsletterOptIn(event.target.checked);
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
                            Signup
                        </Typography>

                        {/* Display custom error message */}
                        {/*{displayErrorMessage()}*/}

                        {/* Display Djoser error */}
                        <AuthErrorAlert authError={authError}/>

                        <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
                            <TextField
                                variant="outlined"
                                className={classes.textField}
                                InputLabelProps={{className: classes.blackLabel}}
                                InputProps={{
                                    className: classes.creamInput
                                }}
                                margin="normal"
                                required
                                fullWidth
                                label="First Name"
                                name="first_name"
                                autoFocus
                                {...register('first_name', {required: 'First name is required'})}
                                error={!!errors.first_name}
                                helperText={errors.first_name?.message}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                className={classes.textField}
                                InputLabelProps={{className: classes.blackLabel}}
                                InputProps={{
                                    className: classes.creamInput
                                }}
                                required
                                fullWidth
                                label="Last Name"
                                name="last_name"
                                {...register('last_name', {required: 'Last name is required'})}
                                error={!!errors.last_name}
                                helperText={errors.last_name?.message}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                className={classes.textField}
                                InputLabelProps={{className: classes.blackLabel}}
                                InputProps={{
                                    className: classes.creamInput
                                }}
                                required
                                fullWidth
                                label="Email Address"
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
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                className={classes.textField}
                                InputLabelProps={{className: classes.blackLabel}}
                                InputProps={{
                                    className: classes.creamInput
                                }}
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                {...register('password', {required: 'Password is required'})}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                className={classes.textField}
                                InputLabelProps={{className: classes.blackLabel}}
                                InputProps={{
                                    className: classes.creamInput
                                }}
                                required
                                fullWidth
                                name="re_password"
                                label="Confirm Password"
                                type="password"
                                {...register('re_password', {required: 'Confirm password is required'})}
                                error={!!errors.re_password}
                                helperText={errors.re_password?.message}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={newsletterOptIn}
                                        onChange={handleNewsletterChange}
                                        name="newsletterOptIn"
                                        classes={{
                                            root: classes.customCheckbox,
                                            checked: classes.checked
                                        }}
                                    />
                                }
                                style={{textAlign: "left", marginLeft: 33, marginTop: 8}}
                                label="Subscribe to our newsletter"
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                className={classes.submitButton}
                            >
                                Signup
                            </Button>
                        </form>

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

export default SignupPage;
