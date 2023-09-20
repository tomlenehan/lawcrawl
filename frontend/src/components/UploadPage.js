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
import {useSelector} from 'react-redux';
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
    loginButton: {
        backgroundColor: '#80cbc4',
        color: '#3a3a3a',
        padding: '10px 30px',
        '&:hover': {
            backgroundColor: '#26a69a',  // Darker color on hover
        },
        borderRadius: '10px',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        textTransform: 'none',
    },
    textField: {
        minWidth: 200,
        width: '100%',
        color: '#3a3a3a',
    },
    fileInput: {
        display: 'none',
    },
    blackLabel: {
        color: '#3a3a3a',
    },
    creamInput: {
        backgroundColor: '#fdfbee',
    },
    error: {
        width: 250,
        fontSize: '1.1vw',
        color: '#d32f2fl',
        marginBottom: 15,
        marginTop: -15,
        fontWeight: "bold",
    },
}));

const UploadPage = ({isAuthenticated}) => {
    const classes = useStyles();
    const [caseName, setCaseName] = React.useState('');
    const [selectedState, setSelectedState] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState(null);
    const token = localStorage.getItem('access');

    const handleUploadClick = (event) => {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
    };

    const handleFileChange = async (event) => {
        console.log('handleFileChange');

        // Clear any existing error messages
        setErrorMessage(null);

        event.preventDefault();  // Prevent Chrome or any other browser from opening the file.

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
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            // If the response is okay, handle the data
            if (response.ok) {
                const data = await response.json();
                console.log(data);
            } else {
                // If the response has a problem, set the error message
                const errorData = await response.json();
                if (errorData && errorData.detail) {
                    setErrorMessage(errorData.detail);
                } else {
                    setErrorMessage("An unexpected error occurred. Please try again.");
                }
            }
        } catch (error) {
            console.error("There was an error uploading the file.", error);
            setErrorMessage("There was a problem communicating with the server. Please try again.");
        }

        // Clear the input value so the same file can be uploaded again if needed.
        event.target.value = null;
    };


    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <div className={classes.homePageContainer}>
                    <Grid container spacing={3} direction="column" alignItems="center">
                        <Grid item xs={12}>
                            <Typography style={{fontSize: '1.7vw'}}>
                                Name your case and <br/>
                                upload your documents
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            {/*Display errors*/}
                            {
                                errorMessage && <div className={classes.error}>{errorMessage}</div>
                            }
                            <TextField
                                label="Case Name"
                                variant="outlined"
                                value={caseName}
                                InputLabelProps={{className: classes.blackLabel}}
                                InputProps={{
                                    className: classes.creamInput
                                }}
                                onChange={e => setCaseName(e.target.value)}
                                className={`${classes.textField}`}
                                helperText="Provide a name for easy reference."
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl variant="outlined" className={classes.textField}>
                                <InputLabel id="state-label"
                                            className={classes.blackLabel}>State</InputLabel>
                                <Select
                                    labelId="state-label"
                                    value={selectedState}
                                    onChange={e => setSelectedState(e.target.value)}
                                    className={`${classes.textField} ${classes.creamInput}`}
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
                                className={classes.loginButton}
                                startIcon={<CloudUploadIcon/>}
                                onClick={handleUploadClick}
                            >
                                Upload PDF
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </div>
            <Footer/>
        </ThemeProvider>
    );
}

export default UploadPage;
