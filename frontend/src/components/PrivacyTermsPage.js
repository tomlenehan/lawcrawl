import React from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Footer from "./Footer";
import theme from './Theme';
import { Box, ThemeProvider } from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: 'scroll',
        justifyContent: 'center',
        minHeight: "100vh",
        paddingBottom: 35,
        paddingTop: 35,
        textAlign: 'center',
    },
    content: {
        maxWidth: 800,
        margin: '0 auto',
        padding: theme.spacing(2),
    },
}));


const PrivacyTermsPage = () => {
    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <Grid container>
                    <Grid item xs={12}>
                        <Box className={classes.content}>
                            <Typography variant="h5" component="h1" align="center">Privacy Policy & Terms of Service</Typography>
                            <Typography variant="body1" component="p" align="center" style={{marginBottom: '20px'}}>Last Updated: 5/11/2023</Typography>

                            <Typography variant="body1" component="p" align="left">
                                Welcome to Question Politics. By using our website and services, you are agreeing to the following terms and conditions.
                                <br/><br/>
                                1. Acceptance of Terms
                                <br/>
                                By accessing or using the Question Politics website, you agree to be bound by these Terms of Service and Privacy Policy. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                                <br/><br/>
                                2. Personal Information
                                <br/>
                                We collect personal information that you provide to us such as name, address, and email address. We use this information to communicate with you and to provide services you have requested.
                                <br/><br/>
                                3. Cookies
                                <br/>
                                We use cookies and similar technologies to enhance your experience on our website. By using our website, you agree to our use of cookies in accordance with our Cookie Policy.
                                <br/><br/>
                                4. Use of Communication Services
                                <br/>
                                If you participate in any phone calls, forums, or other communication services on Question Politics, you agree that any content you provide may be used by Question Politics for any purpose, including but not limited to reproduction, disclosure, transmission, and publication.
                                <br/><br/>
                                5. Call Recording and Transcription
                                <br/>
                                By participating in any calls on or through Question Politics, you expressly consent to the recording of such calls. You further agree and grant permission to Question Politics to transcribe these call recordings and to use both the recordings and transcriptions for any purpose, including, but not limited to, training, analysis, and publication.
                                <br/><br/>
                                6. Intellectual Property
                                <br/>
                                The content on this website, including but not limited to text, graphics, and logos, is the property of Question Politics and is protected by copyright and other intellectual property laws.
                                <br/><br/>
                                7. Limitation of Liability
                                <br/>
                                Question Politics shall not be liable for any indirect, incidental, or consequential damages arising out of the use or inability to use our services or website.
                                <br/><br/>
                                8. Indemnification
                                <br/>
                                You agree to indemnify and hold harmless Question Politics and its affiliates, officers, directors, and employees from any claim or demand made by any third party arising out of your use of the website or violation of these Terms of Service.
                                <br/><br/>
                                9. Changes to Privacy Policy & Terms of Service
                                <br/>
                                We may update our Privacy Policy and Terms of Service from time to time. We will notify you of any changes by posting the new Privacy Policy and Terms of Service on this page.
                                <br/><br/>
                                10. Governing Law
                                <br/>
                                These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                                <br/><br/>
                                11. Contact Information
                                <br/>
                                If you have any questions or concerns regarding our Privacy Policy or Terms of Service, please contact us at <a href="https://twitter.com/question_pol" target="_blank" rel="noopener noreferrer">@question_pol</a>
                                <br/><br/>
                                By using Question Politics, you acknowledge that you have read and understood these Terms of Service and Privacy Policy and agree to be bound by them.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </div>
            <Footer />
        </ThemeProvider>
    );
}

export default PrivacyTermsPage;
