import React from 'react';
import Alert from '@material-ui/lab/Alert';

const AuthErrorAlert = ({ authError }) => {
    console.log('show_error');
    if (typeof authError === 'string') {
        return <Alert variant="filled" severity="error">{authError}</Alert>;
    } else if (Array.isArray(authError)) {
        return authError.map((error, index) => (
            <Alert key={index} variant="filled" severity="error">
                {error.field ? `${error.field}: ` : ''}{error.message}
            </Alert>
        ));
    }
    return null;
};

export default AuthErrorAlert;
