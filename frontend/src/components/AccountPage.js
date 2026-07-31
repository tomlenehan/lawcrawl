import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
    makeStyles,
    Container,
    Typography,
    Box,
    Button,
    Checkbox,
    FormControlLabel
} from '@material-ui/core';
import {updateNewsletterOptIn} from '../actions/auth';
import theme from './Theme';
import {ThemeProvider} from '@material-ui/core/styles';
import Footer from './Footer';
import Grid from "@material-ui/core/Grid";
import config from "./config";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: 'auto',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f6f8f6',
    },
    contentContainer: {
        display: 'flex',
        flexDirection: 'column',
        paddingTop: theme.spacing(7),
        paddingBottom: theme.spacing(7),
        alignItems: 'center',
        textAlign: 'center',
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: 20,
    },
    subTitle: {
        color: '#667085',
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
    headlineContainer: {
        display: "flex",
        color: '#202124',
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
    customCheckbox: {
        // marginLeft: 26,
        // marginTop: 18,
        '&$checked': {
            color: '#26a69a',
        },
    },
    checked: {},
}));

const AccountPage = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [newsletterOptIn, setNewsletterOptIn] = useState(false);
    const user = useSelector(state => state.auth.user);
    const token = useSelector((state) => state.auth.access);
    const [loading, setLoading] = useState(true);
    // const [newsletterOptIn, setNewsletterOptIn] = useState(user?.newsletter_opt_in ?? false);


    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get('/api/user/details', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data) {
                setNewsletterOptIn(response.data.newsletter_opt_in);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleNewsletterChange = (event) => {
        setNewsletterOptIn(event.target.checked);
    };

    const handleSubmit = async () => {
        try {
            // Send the updated newsletter preference to your API
            await axios.patch('/api/user/update_newsletter_opt_in/', { newsletterOptIn }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Error updating newsletter preference:", error);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box className={classes.root}>
                <Container className={classes.contentContainer}>
                    <Grid container className={classes.headlineContainer}>

                        <Grid item xs={12}>
                            <img src={`${config.STATIC_URL}images/logos/LogoLG.png`}
                                 alt="Lawcrawl Logo"
                                 className={classes.mainLogo}/>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography className={classes.loginHeadline} variant="h4"
                                        gutterBottom>
                                Account
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography style={{fontSize: 24}} gutterBottom>
                                Preferences:
                            </Typography>
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
                            style={{textAlign: "left", marginLeft: 26, marginTop: 18}}
                            label="Subscribe to our newsletter"
                        />

                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            className={classes.submitButton}
                        >
                            Update
                        </Button>
                    </Grid>
                </Container>
            </Box>
            <Footer/>
        </ThemeProvider>
    );
};

export default AccountPage;
