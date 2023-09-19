import React from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Footer from "./Footer";
import theme from './Theme';
import {Box, Card, CardActionArea, CardContent, ThemeProvider} from "@material-ui/core";
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import config from './config';


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: 'scroll',
        justifyContent: 'center',
        minHeight: "100vh",
        paddingBottom: 35,
    },
    homePageContainer: {
        paddingTop: 35,
        textAlign: 'center',
    },
    mainLogo: {
        width: '25%',
        margin: '0 auto',
        display: 'block',
    },
    textLogo: {
        width: '30%',
        marginLeft: 10,
        marginTop: 12,
        marginBottom: 16,
        display: 'block',
    },
    icon: {
        fontSize: 60,
        height: 50,
        width: 50,
    },
    plusIcon: {
        margin: '15px',
    },
    iconContainer: {
        display: 'flex',
        justifyContent: 'space-around',
    },
    cardTile: {
        fontFamily: 'DMSans, sans-serif',
    },
    button: {
        marginTop: 20,
        marginBottom: 30,
    }
}));


const HomePage = () => {
    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <div className={classes.homePageContainer}>
                    <Grid container>
                        <Grid item xs={12}>
                            <img src={`${config.STATIC_URL}images/logos/lawcrawl2.png`}
                                 alt="Lawcrawl Logo"
                                 className={classes.mainLogo}/>
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography style={{fontSize: '5.0vw', marginTop: -30}}>
                                    Law Crawl
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography style={{fontSize: '1.8vw'}}>
                                    Upload your case documents and chat
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography>
                                <h3></h3>
                            </Typography>
                        </Grid>
                    </Grid>

                </div>
            </div>
            <Footer/>
        </ThemeProvider>
    );
}

export default HomePage;
