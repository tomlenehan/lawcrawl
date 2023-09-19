import React from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Footer from "./Footer";
import theme from './Theme';
import {
    Button,
    ThemeProvider,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from "@material-ui/core";
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
        paddingTop: 80,
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
        minWidth: 200,
        width: '100%',
    },
    fileInput: {
        display: 'none',
    }
}));

const ChatPage = () => {
    const classes = useStyles();
    const [caseName, setCaseName] = React.useState('');
    const [selectedState, setSelectedState] = React.useState('');


    const handleUploadClick = (event) => {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
    };

    const handleFileChange = async (event) => {
        print('handleFileChange');

        const files = event.target.files;
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        formData.append('case_name', caseName);
        formData.append('state', selectedState);

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
                                First, give a name for your case <br/>
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
                            <FormControl variant="outlined" className={classes.textField}>
                                <InputLabel id="state-label">State</InputLabel>
                                <Select
                                    labelId="state-label"
                                    value={selectedState}
                                    onChange={e => setSelectedState(e.target.value)}
                                    label="State"
                                >
                                    <MenuItem value="AL">Alabama</MenuItem>
                                    <MenuItem value="AK">Alaska</MenuItem>
                                    <MenuItem value="AZ">Arizona</MenuItem>
                                    <MenuItem value="AR">Arkansas</MenuItem>
                                    <MenuItem value="CA">California</MenuItem>
                                    <MenuItem value="CO">Colorado</MenuItem>
                                    <MenuItem value="CT">Connecticut</MenuItem>
                                    <MenuItem value="DE">Delaware</MenuItem>
                                    <MenuItem value="FL">Florida</MenuItem>
                                    <MenuItem value="GA">Georgia</MenuItem>
                                    <MenuItem value="HI">Hawaii</MenuItem>
                                    <MenuItem value="ID">Idaho</MenuItem>
                                    <MenuItem value="IL">Illinois</MenuItem>
                                    <MenuItem value="IN">Indiana</MenuItem>
                                    <MenuItem value="IA">Iowa</MenuItem>
                                    <MenuItem value="KS">Kansas</MenuItem>
                                    <MenuItem value="KY">Kentucky</MenuItem>
                                    <MenuItem value="LA">Louisiana</MenuItem>
                                    <MenuItem value="ME">Maine</MenuItem>
                                    <MenuItem value="MD">Maryland</MenuItem>
                                    <MenuItem value="MA">Massachusetts</MenuItem>
                                    <MenuItem value="MI">Michigan</MenuItem>
                                    <MenuItem value="MN">Minnesota</MenuItem>
                                    <MenuItem value="MS">Mississippi</MenuItem>
                                    <MenuItem value="MO">Missouri</MenuItem>
                                    <MenuItem value="MT">Montana</MenuItem>
                                    <MenuItem value="NE">Nebraska</MenuItem>
                                    <MenuItem value="NV">Nevada</MenuItem>
                                    <MenuItem value="NH">New Hampshire</MenuItem>
                                    <MenuItem value="NJ">New Jersey</MenuItem>
                                    <MenuItem value="NM">New Mexico</MenuItem>
                                    <MenuItem value="NY">New York</MenuItem>
                                    <MenuItem value="NC">North Carolina</MenuItem>
                                    <MenuItem value="ND">North Dakota</MenuItem>
                                    <MenuItem value="OH">Ohio</MenuItem>
                                    <MenuItem value="OK">Oklahoma</MenuItem>
                                    <MenuItem value="OR">Oregon</MenuItem>
                                    <MenuItem value="PA">Pennsylvania</MenuItem>
                                    <MenuItem value="RI">Rhode Island</MenuItem>
                                    <MenuItem value="SC">South Carolina</MenuItem>
                                    <MenuItem value="SD">South Dakota</MenuItem>
                                    <MenuItem value="TN">Tennessee</MenuItem>
                                    <MenuItem value="TX">Texas</MenuItem>
                                    <MenuItem value="UT">Utah</MenuItem>
                                    <MenuItem value="VT">Vermont</MenuItem>
                                    <MenuItem value="VA">Virginia</MenuItem>
                                    <MenuItem value="WA">Washington</MenuItem>
                                    <MenuItem value="WV">West Virginia</MenuItem>
                                    <MenuItem value="WI">Wisconsin</MenuItem>
                                    <MenuItem value="WY">Wyoming</MenuItem>
                                </Select>
                            </FormControl>
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
