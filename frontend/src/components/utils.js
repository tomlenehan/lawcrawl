import React from 'react';
import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { useDispatch } from 'react-redux';
import { resetAuthError } from '../actions/auth';
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    alertContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    alertAction: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 0,
    },
}));

const AuthErrorAlert = ({ authError }) => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const handleClose = () => {
        dispatch(resetAuthError());
    };

    const renderAlert = (message, key) => (
        <Alert
            key={key}
            variant="filled"
            severity="error"
            action={
                <IconButton
                    aria-label="close"
                    className={classes.alertAction}
                    size="small"
                    onClick={handleClose}
                >
                    <CloseIcon fontSize="inherit" />
                </IconButton>
            }
        >
            <div className={classes.alertContent}>
                {message}
            </div>
        </Alert>
    );

    if (typeof authError === 'string') {
        return renderAlert(authError);
    } else if (Array.isArray(authError)) {
        return authError.map((error, index) => renderAlert(
            `${error.field ? `${error.field}: ` : ''}${error.message}`,
            index
        ));
    }
    return null;
};

export default AuthErrorAlert;
