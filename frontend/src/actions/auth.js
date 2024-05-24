import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    USER_ALREADY_EXISTS,
    AUTHENTICATED_SUCCESS,
    AUTHENTICATED_FAIL,
    AUTHENTICATED_RESEND_SUCCESS,
    AUTHENTICATED_RESEND_FAIL,
    PASSWORD_RESET_SUCCESS,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_CONFIRM_SUCCESS,
    PASSWORD_RESET_CONFIRM_FAIL,
    SIGNUP_SUCCESS,
    SIGNUP_FAIL,
    ACTIVATION_SUCCESS,
    ACTIVATION_FAIL,
    SET_AUTH_ERROR,
    RESET_AUTH_ERROR,
    TWITTER_AUTH_FAIL,
    TWITTER_AUTH_SUCCESS,
    GOOGLE_AUTH_FAIL,
    GOOGLE_AUTH_SUCCESS,
    LOGOUT,
} from "./types";

import axios from "axios";

axios.defaults.withCredentials = true;

export const load_user = () => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${localStorage.getItem('access')}`,
                'Accept': 'application/json'
            }
        };

        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/me/`, config);

            dispatch({
                type: USER_LOADED_SUCCESS,
                payload: res.data
            });
        } catch (err) {
            dispatch({
                type: USER_LOADED_FAIL
            });
        }
    } else {
        dispatch({
            type: USER_LOADED_FAIL
        });
    }
};

export const login = (email, password) => async dispatch => {
    console.log("trying_login");
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({email, password})
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/jwt/create/`, body, config);
        dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data
        })
        dispatch(load_user())
    } catch (err) {
        console.log("login_failed");
        dispatch({
            type: LOGIN_FAIL
        });
        dispatch({
            type: SET_AUTH_ERROR,
            payload: err.response.data.detail
        });
    }
}

export const googleAuthenticate = (state, code) => async dispatch => {
    if (state && code && !localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        const details = {
            'state': state,
            'code': code
        }
        const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&')
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/o/google-oauth2/?${formBody}`, config);
            console.log(res.data)
            dispatch({
                type: GOOGLE_AUTH_SUCCESS,
                payload: res.data
            })
        } catch (err) {
            dispatch({
                type: GOOGLE_AUTH_FAIL
            })
            dispatch({
                type: SET_AUTH_ERROR,
                payload: err.response.data.detail
            })
        }
    }
}

export const twitterAuthenticate = (state, code, verifier) => async (dispatch) => {
    if (state && code && verifier && !localStorage.getItem("access")) {
        const config = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };
        const details = {
            state: state,
            oauth_token: code,
            oauth_verifier: verifier,
        };
        const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&')
        try {

            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/o/twitter/?${formBody}`, config)
            dispatch({
                type: TWITTER_AUTH_SUCCESS,
                payload: res.data
            })
        } catch (err) {
            dispatch({
                type: TWITTER_AUTH_FAIL
            })
            dispatch({
                type: SET_AUTH_ERROR,
                payload: err.response.data.detail
            })
        }
    }
}


export const signup = (first_name, last_name, email, password, re_password, newsletter_opt_in) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log('trying_signup');
    const body = JSON.stringify({ first_name, last_name, email, password, re_password, newsletter_opt_in });

    try {
        // Check if the user or social user exists with the given email
        const checkRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/check?email=${encodeURIComponent(email)}`);
        if (checkRes.data.social_user_exists && checkRes.data.user_exists) {
            dispatch({
                type: USER_ALREADY_EXISTS,
                payload: [{ field: 'email', message: "This email is already tied to a social account. Please login that way." }]
            });
        }
        else if (checkRes.data.user_exists) {
            dispatch({
                type: USER_ALREADY_EXISTS,
                payload: [{ field: 'email', message: "An account with this email already exists." }]
            });
        }
        else {
            // If no user is found with the email, proceed to create a new user
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/users/`, body, config);
            dispatch({
                type: SIGNUP_SUCCESS,
                payload: res.data
            });
        }
    } catch (err) {
        dispatch({
            type: SIGNUP_FAIL
        });
        // Handle other errors
        if (err.response && err.response.data) {
            for (let key in err.response.data) {
                dispatch({
                    type: SET_AUTH_ERROR,
                    payload: [{ field: key, message: err.response.data[key][0]}]
                });
            }
        }
    }
};


export const verify = (uid, token) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({uid, token});

    console.log("verifying");

    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/users/activation/`, body, config);

        dispatch({
            type: ACTIVATION_SUCCESS,
        });
    } catch (err) {
        dispatch({
            type: ACTIVATION_FAIL
        })
        dispatch({
            type: SET_AUTH_ERROR,
            payload: err.response.data.detail
        })
    }
};

export const checkAuthenticated = () => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const body = JSON.stringify({ token: localStorage.getItem('access') });

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/jwt/verify/`, body, config)

            if (res.data.code !== 'token_not_valid') {
                dispatch({
                    type: AUTHENTICATED_SUCCESS
                });
            } else {
                dispatch({
                    type: AUTHENTICATED_FAIL
                });
            }
        } catch (err) {
            dispatch({
                type: AUTHENTICATED_FAIL
            });
        }

    } else {
        dispatch({
            type: AUTHENTICATED_FAIL
        });
    }
};

export const reset_password = (email) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ email });

    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/users/reset_password/`, body, config);

        dispatch({
            type: PASSWORD_RESET_SUCCESS
        });
    } catch (err) {
        dispatch({
            type: PASSWORD_RESET_FAIL
        });
    }
};

export const resend_activation = (email) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ email });

    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/users/resend_activation/`, body, config);

        dispatch({
            type: AUTHENTICATED_RESEND_SUCCESS
        });
    } catch (err) {
        dispatch({
            type: AUTHENTICATED_RESEND_FAIL
        });
    }
};

export const reset_password_confirm = (uid, token, new_password, re_new_password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ uid, token, new_password, re_new_password });

    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/users/reset_password_confirm/`, body, config);

        dispatch({
            type: PASSWORD_RESET_CONFIRM_SUCCESS
        });
    } catch (err) {
        dispatch({
            type: PASSWORD_RESET_CONFIRM_FAIL
        });
    }
};


export const resetAuthError = () => dispatch => {
    dispatch({
        type: RESET_AUTH_ERROR,
    });
};

export const logout = () => dispatch => {
    dispatch({
        type: LOGOUT
    })
}