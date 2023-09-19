import React from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Footer from "./Footer";
import theme from './Theme';
import {Button, ThemeProvider, TextField} from "@material-ui/core";
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
        paddingTop: 55,
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
    },
    textField: {
        marginTop: 20,
        width: '100%',
    },
    fileInput: {
        display: 'none',
    }
}));

const ChatPage = () => {
    const classes = useStyles();
    const [caseName, setCaseName] = React.useState('');

    const handleUploadClick = (event) => {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
    };

    const handleFileChange = async (event) => {
        const files = event.target.files;
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        formData.append('case_name', caseName);

        try {
            const response = await fetch('/api/upload/', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log(data);  // Handle the response from the server as needed
        } catch (error) {
            console.error("There was an error uploading the file.", error);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <div className={classes.homePageContainer}>
                    <Grid container spacing={3} direction="column" alignItems="center">
                        <Grid item xs={12}>
                            <Typography variant="h5">
                                First, give a name for your case <br />
                                and upload the document(s)
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Case Name"
                                variant="outlined"
                                value={caseName}
                                onChange={e => setCaseName(e.target.value)}
                                className={classes.textField}
                                helperText="Provide a name for easy reference."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <input
                                accept="application/pdf"
                                className={classes.fileInput}
                                id="fileInput"
                                multiple
                                type="file"
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                className={classes.button}
                                startIcon={<CloudUploadIcon/>}
                                onClick={handleUploadClick}
                            >
                                Upload PDFs
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </div>
            <Footer/>
        </ThemeProvider>
    );
}

export default ChatPage;
