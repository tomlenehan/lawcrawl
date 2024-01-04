import React, {useEffect, useState} from "react";
import {connect} from 'react-redux';
import Grid from "@material-ui/core/Grid";
import Modal from '@material-ui/core/Modal';
import {Box, Checkbox, Container, FormControlLabel, Link} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {makeStyles} from '@material-ui/core/styles';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import {useNavigate, useLocation} from 'react-router-dom';
import Typography from "@material-ui/core/Typography";
import Footer from "./Footer";
import theme from './Theme';
import {logout} from "../actions/auth";
import {
    Button,
    ThemeProvider,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Tooltip,
} from "@material-ui/core";
import LinearProgress from '@material-ui/core/LinearProgress';
import {useDispatch} from 'react-redux';
import {addUserCase} from '../actions/user';
import TermsOfService from "./TermsOfService";
import useFetchUserCases from './hooks/useFetchUserCases';
import config from "./config";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: 'scroll',
        justifyContent: 'center',
        minHeight: "100vh",
        paddingBottom: 35,
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
    inputButton: {
        color: '#3a3a3a',
        marginTop: 18,
        padding: '8px 30px',
        backgroundColor: '#80cbc4',
        '&:hover': {
            backgroundColor: '#26a69a',  // Darker color on hover
        },
        borderRadius: '10px',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        textTransform: 'none',
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    textField: {
        minWidth: 200,
        marginTop: 12,
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
        maxWidth: 250,
        fontSize: '1.1vw',
        color: '#ff1744',
        marginBottom: 15,
        marginTop: -15,
        fontWeight: "bold",
    },
    termsOfServiceLink: {
        textDecoration: 'none',
        cursor: 'pointer',
        marginLeft: 10,
        color: "#4285F4",
        '&:hover': {
            textDecoration: 'underline',
        },
    },
    customCheckbox: {
        '&$checked': {
            color: '#26a69a',
        },
    },
    checked: {},
    modalText: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
        maxWidth: 400,
        overflowY: 'auto',
        maxHeight: '80vh',
    },
    tooltip: {
        backgroundColor: '#3a3a3a',
        padding: '8px 30px',
        color: '#80cbc4',
    },
    infoProgress: {
        // Set the track color
        backgroundColor: theme.palette.info.light,
        // Set the bar color
        '& .MuiLinearProgress-bar': {
            backgroundColor: theme.palette.info.main,
        },
    },
}));

const UploadPage = ({token, isAuthenticated, userCases}) => {
    const classes = useStyles();
    const [loading, setLoading] = React.useState(false);
    const [caseName, setCaseName] = React.useState('');
    const [selectedState, setSelectedState] = React.useState('');
    const [selectedDocumentType, setSelectedDocumentType] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [fileLoaded, setFileLoaded] = React.useState(false);
    const [fileName, setFileName] = React.useState("");
    const [openModal, setOpenModal] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const fetchUserCases = useFetchUserCases();

    // const handleUploadClick = (event) => {
    //     console.log("handling_upload_click");
    //     const fileInput = document.getElementById('fileInput');
    //     fileInput.click();
    // };

    const handleUploadClick = () => {
        // Directly access the file input and trigger the click
        console.log("handling_upload_click");
        document.getElementById('fileInput').click();
    };

    const handleLogout = () => {
        console.log("logging_out");
        dispatch(logout());
        navigate('/login');
    };

    useEffect(() => {
        if (isAuthenticated === true && token != null) {
            if (!userCases || userCases.length === 0) {
                fetchUserCases(token, dispatch, navigate).catch(error => {
                    console.error('Error fetching user cases:', error);
                    handleLogout();
                });
            }
        }
    }, [isAuthenticated, token]);


    const handleFileChange = (event) => {
        // Check if the files are selected
        if (event.target.files.length > 0) {
            setFileLoaded(true);
            const selectedFile = event.target.files[0];
            setFileName(selectedFile.name);
        } else {
            setFileLoaded(false);
        }
    };

    const truncateString = (str, num) => {
        if (str.length > num) {
            return str.slice(0, num) + "...";
        } else {
            return str;
        }
    };

    const handleSubmit = async (event) => {

        if (!termsAccepted) {
            setErrorMessage("Please agree to the Terms of Service before proceeding.");
            return;
        } else if (!fileLoaded) {
            setErrorMessage("Please select a file before proceeding.");
            return;
        } else if (!caseName) {
            setErrorMessage("Please provide a document name before proceeding.");
            return;
        } else if (!selectedState) {
            setErrorMessage("Please select a state before proceeding.");
            return;
        } else if (!selectedDocumentType) {
            setErrorMessage("Please select a document type before proceeding.");
            return;
        }
        // Clear any existing error messages
        setErrorMessage(null);
        // Set loading to true
        setLoading(true);

        event.preventDefault();

        const fileInputElement = document.getElementById('fileInput');
        const files = fileInputElement.files;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }
        formData.append('case_name', caseName);
        formData.append('state', selectedState);
        formData.append('document_type', selectedDocumentType);

        try {
            // Start the upload
            const response = await fetch('/api/upload/file/', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                const updatedUserCases = [data.case, ...userCases];
                dispatch(addUserCase(updatedUserCases));
                navigate(`/chat?uid=${data.case.uid}`);
            } else {
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
        } finally {
            // Set loading back to false once upload is complete or if there is an error
            setLoading(false);
        }

        // Clear the input value so the same file can be uploaded again if needed.
        event.target.value = null;
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    return (
        <>
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

                        <Box container className={classes.formContainer}>

                            <Typography className={classes.loginHeadline} variant="h4"
                                        gutterBottom>
                                Upload
                            </Typography>

                            {/* Processing message */}
                            {loading && (
                                <Alert variant="filled" severity="info" style={{marginTop: 20}}>
                                    Processing your document. This will take a few minutes.
                                </Alert>
                            )}

                            <Grid item xs={12}>
                                {/*show progress*/}
                                {loading && <LinearProgress className={classes.infoProgress} size="lg"/>}
                                {/*Display errors*/}
                                {
                                    // errorMessage && <div className={classes.error}>{errorMessage}</div>
                                    errorMessage &&
                                    <Alert variant="filled" severity="error">{errorMessage}</Alert>
                                }

                                <TextField
                                    label="Document Name"
                                    variant="outlined"
                                    value={caseName}
                                    InputLabelProps={{className: classes.blackLabel}}
                                    InputProps={{
                                        className: classes.creamInput
                                    }}
                                    onChange={e => setCaseName(e.target.value)}
                                    className={`${classes.textField}`}
                                    // helperText="Provide a name for easy reference."
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl variant="outlined" className={classes.textField}
                                             disabled={loading}>
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
                                <FormControl variant="outlined" className={classes.textField}
                                             disabled={loading}>
                                    <InputLabel id="document-type-label"
                                                className={classes.blackLabel}>
                                        Document Type
                                    </InputLabel>
                                    <Select
                                        labelId="document-type-label"
                                        value={selectedDocumentType}
                                        onChange={e => setSelectedDocumentType(e.target.value)}
                                        className={`${classes.textField} ${classes.creamInput}`}
                                        label="Document Type"
                                    >
                                        <MenuItem value="contract">Contract</MenuItem>
                                        <MenuItem value="invoice">Invoice</MenuItem>
                                        <MenuItem value="agreement">Agreement</MenuItem>
                                        <MenuItem value="report">Report</MenuItem>
                                        <MenuItem value="letter">Letter</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start'
                            }}>

                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <Checkbox
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        name="termsAccepted"
                                        classes={{
                                            root: classes.customCheckbox,
                                            checked: classes.checked
                                        }}
                                        disabled={loading}
                                    />

                                    {/* TOS modal */}
                                    <Typography variant="body2" component="span">
                                        I agree to the
                                    </Typography>

                                </div>
                                <Link className={classes.termsOfServiceLink}
                                      onClick={handleOpenModal}>
                                    Terms of Service.
                                </Link>
                            </Grid>

                            <Grid item xs={12}>

                                <input
                                    accept="application/pdf"
                                    className={classes.fileInput}
                                    id="fileInput"
                                    multiple
                                    type="file"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />

                                <Button
                                    variant="contained"
                                    component="span"
                                    className={classes.inputButton}
                                    startIcon={fileLoaded ? <CheckBoxIcon/> : <AttachFileIcon/>}
                                    disabled={loading}
                                    onClick={handleUploadClick} // Assign the click handler directly to the button
                                >
                                    {fileLoaded ? truncateString(fileName, 8) : 'Select PDF'}
                                </Button>

                            </Grid>

                            <Grid item xs={12}>
                                {/* Separate Submit button */}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    className={classes.inputButton}
                                    onClick={handleSubmit}
                                    startIcon={<FileUploadIcon/>}
                                    disabled={loading || !termsAccepted || !fileLoaded || !caseName || !selectedState || !selectedDocumentType}
                                >
                                    Upload
                                </Button>
                            </Grid>
                        </Box>
                    </Container>
                </Box>
                <Footer/>
            </ThemeProvider>

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                className={classes.modal}
            >
                <div className={classes.modalText}>
                    <TermsOfService/>
                </div>
            </Modal>
        </>
    )
}

const mapStateToProps = (state) => ({
    token: state.auth.access,
    isAuthenticated: state.auth.isAuthenticated,
    userCases: state.userCases,
});

export default connect(mapStateToProps)(UploadPage);
