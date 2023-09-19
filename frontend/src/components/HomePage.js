import React from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Footer from "./Footer";
import theme from './Theme';
import {Box, ThemeProvider} from "@material-ui/core";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import AddIcon from '@mui/icons-material/Add';
import config from './config';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: 'scroll',
        justifyContent: 'center',
        minHeight: "100vh",
        paddingBottom: 50,
    },
    chatContainer: {
        paddingTop: 60,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    mainLogo: {
        width: '15%',
        margin: '0 auto',
        display: 'block',
    },
    textLogo: {
        fontSize: '4.5vw',
    },
    subTitle: {
        fontSize: '2vw',
        marginBottom: 20,
    },
    description: {
        fontSize: '1.2vw',
    },
    icon: {
        fontSize: 80,
        color: 'black',
    },
    plusIcon: {
        fontSize: 40,
        margin: '0 30px',
    },
    openAILogo: {
        height: 80,
        width: 80,
    },
    iconContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    }
}));

const HomePage = () => {
    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <div className={classes.chatContainer}>
                    <Grid container>
                        <Grid item xs={12}>
                            <img src={`${config.STATIC_URL}images/logos/LawcrawlLogo.png`}
                                 alt="Lawcrawl Logo"
                                 className={classes.mainLogo}/>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography className={classes.textLogo}>Law Crawl</Typography>
                            <Typography className={classes.subTitle}>Your personal AI legal
                                advisor</Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography className={classes.description}>
                                Upload your legal documents, then chat <br/>
                                with a version of GPT that knows the law and knows your case.
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <div className={classes.iconContainer}>
                                <LibraryBooksIcon className={classes.icon}/>
                                <AddIcon className={classes.plusIcon}/>
                                <img className={classes.openAILogo}
                                     src={`${config.STATIC_URL}images/logos/OpenAILogo.png`}
                                     alt="OpenAI Logo"/>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </div>
            <Footer/>
        </ThemeProvider>
    );
}

export default HomePage;
