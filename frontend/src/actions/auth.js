import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    SET_AUTH_ERROR,
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
            console.log(err)
        }
    }
}

export const logout = () => dispatch => {
    dispatch({
        type: LOGOUT
    })
}