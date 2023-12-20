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
import {reset_password_confirm} from '../actions/auth';
import Grid from "@material-ui/core/Grid";
import config from "./config";
import theme from "./Theme";
import Footer from "./Footer";
import {Link} from "react-router-dom";
import Alert from "@material-ui/lab/Alert";
import {useForm} from "react-hook-form";
import CircularProgress from "@material-ui/core/CircularProgress";

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

const ResetPasswordConfirmPage = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {register, handleSubmit, formState: {errors}} = useForm();
    const authError = useSelector(state => state.auth.authError);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const params = useParams();

    const onSubmit = data => {
        const uid = params.uid;
        const token = params.token;

        dispatch(reset_password_confirm(uid, token, data.password, data.re_password));
        setFormSubmitted(true);
    };

    if (formSubmitted) {
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
                            pw: Confirm
                        </Typography>

                        {/* Display Djoser error */}
                        {authError && (
                            <Alert variant="filled" severity="error">
                                {authError.field ? `${authError.field}: ` : ''}{authError.message}
                            </Alert>
                        )}

                        {formSubmitted ? (
                            <Typography className={classes.loginDescription}>
                                Your password has been reset.
                            </Typography>
                        ) : (
                            <>
                                <Typography className={classes.loginDescription} gutterBottom>
                                    Please provide a new password.
                                </Typography>

                                <form onSubmit={handleSubmit(onSubmit)}>
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

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        className={classes.submitButton}
                                        disabled={formSubmitted}
                                    >
                                        {formSubmitted ? <CircularProgress size={24}/> : 'Confirm'}
                                    </Button>
                                </form>
                            </>
                        )}

                    </Box>
                </Container>
            </Box>
            <Footer/>
        </ThemeProvider>
    );
};

export default ResetPasswordConfirmPage;