import {
    TWITTER_AUTH_FAIL,
    TWITTER_AUTH_SUCCESS,
    LOGOUT,
} from "./types";

import axios from "axios";

axios.defaults.withCredentials = true;

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
            console.log('Trying to authenticate');
            dispatch({
                type: TWITTER_AUTH_SUCCESS,

                payload: res.data
            })
            console.log(res.data)
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