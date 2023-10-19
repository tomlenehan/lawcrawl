import React from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Footer from "./Footer";
import theme from './Theme';
import { Box, ThemeProvider } from "@material-ui/core";
import TermsOfService from "./TermsOfService";
import {connect} from "react-redux";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: "100vh",
        textAlign: 'center',
    },
    content: {
        maxWidth: 800,
        margin: '0 auto',
        padding: theme.spacing(2),
    },
    termsText: {
        padding: 20,
        // overflowY: 'auto',
        // maxHeight: '80vh',
    }
}));

const TermsOfServicePage = () => {
    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <Grid container direction="column" justify="center" alignItems="center" className={classes.root}>
                <Grid item>
                    <div className={classes.termsText}>
                        <div className={classes.content}>
                            <TermsOfService />
                        </div>
                    </div>
                </Grid>
            </Grid>
            <Footer />
        </ThemeProvider>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    userCases: state.userCases,
});

export default connect(mapStateToProps)(TermsOfServicePage);
