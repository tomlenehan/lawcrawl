import React from 'react';
import {useDispatch} from 'react-redux';
import {Grid} from '@mui/material';
import CallHistoryTable from './CallHistoryTable';
import {makeStyles, ThemeProvider} from "@material-ui/core";
import theme from "./Theme";
import Footer from "./Footer";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        minHeight: '100vh',
        paddingTop: 30,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    itemCenter: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));


const ProfilePage = () => {
    const classes = useStyles();
    const dispatch = useDispatch();

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item xs={10}>
                        <div className={classes.itemCenter}>
                            <CallHistoryTable/>
                        </div>
                    </Grid>
                </Grid>
            </div>
            <Footer/>
        </ThemeProvider>
    );
};

export default ProfilePage;
