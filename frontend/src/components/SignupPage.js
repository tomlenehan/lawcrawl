import React, {useState, useEffect} from 'react';
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
import Modal from "@material-ui/core/Modal";
import TermsOfService from "./TermsOfService";

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
        maxWidth: 420,
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
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
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
    termsOfServiceLink: {
        textDecoration: 'none',
        cursor: 'pointer',
        marginLeft: 10,
        color: "#0f766e",
        fontWeight: 700,
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
    modalText: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
        maxWidth: 400,
        overflowY: 'auto',
        maxHeight: '80vh',
        outline: 'none',
    },
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
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [openModal, setOpenModal] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const watchFields = watch();
    const isFormValid = Object.values(watchFields).every(field => field) && termsAccepted;

    const onSubmit = async (data) => {
        await dispatch(signup(data.first_name, data.last_name, data.email, data.password, data.re_password, newsletterOptIn));
        setAccountEmail(data.email);
    };

    useEffect(() => {
        if (signupSuccess && !authError && accountEmail) {
            setAccountCreated(true);
            navigate("/resend_verification?activation_email=" + accountEmail);
        }
    }, [signupSuccess, authError, accountEmail, navigate]);


    const handleNewsletterChange = (event) => {
        setNewsletterOptIn(event.target.checked);
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };


    return (
        <>
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

                                <Grid item xs={12} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    marginLeft: 33
                                }}>

                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Checkbox
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            name="termsAccepted"
                                            classes={{
                                                root: classes.customCheckbox,
                                                checked: classes.checked
                                            }}
                                            style={{marginTop: 8}}
                                            // disabled={loading}
                                        />

                                        {/* TOS modal */}
                                        <Typography variant="body2" component="span">
                                            I agree to the
                                        </Typography>

                                    </div>
                                    <Link className={classes.termsOfServiceLink}
                                          onClick={handleOpenModal}>
                                        Terms of Service.
                                    </Link>
                                </Grid>

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
                                    disabled={!isFormValid}
                                >
                                    Signup
                                </Button>
                            </form>

                            <Link to="/login" className={classes.signupLink}>
                                Back to Login
                            </Link>

                        </Box>
                    </Container>
                    <Footer/>
                </Box>
            </ThemeProvider>

            <Modal
                open={openModal}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                className={classes.modal}
            >
                <div className={classes.modalText}>
                    <TermsOfService onClose={handleCloseModal}/>
                </div>
            </Modal>
        </>
    );
};

export default SignupPage;
