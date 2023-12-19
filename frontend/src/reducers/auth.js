import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    AUTHENTICATED_SUCCESS,
    AUTHENTICATED_FAIL,
    PASSWORD_RESET_SUCCESS,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_CONFIRM_SUCCESS,
    PASSWORD_RESET_CONFIRM_FAIL,
    SIGNUP_SUCCESS,
    SIGNUP_FAIL,
    ACTIVATION_SUCCESS,
    ACTIVATION_FAIL,
    SET_AUTH_ERROR,
    TWITTER_AUTH_FAIL,
    TWITTER_AUTH_SUCCESS,
    GOOGLE_AUTH_FAIL,
    GOOGLE_AUTH_SUCCESS,
} from "../actions/types";

const initialState = {
    access: localStorage.getItem('access'),
    refresh: localStorage.getItem('refresh'),
    isAuthenticated: !!localStorage.getItem("access"),
    user: localStorage.getItem('user'),
    token: null,
    secret: null,
}

export default function(state=initialState, action){
    switch (action.type){
        case AUTHENTICATED_SUCCESS:
            return {
                ...state,
                isAuthenticated: true
            }
        case SET_AUTH_ERROR:
            return {
                ...state,
                authError: action.payload
            };
        case LOGIN_SUCCESS:
        case TWITTER_AUTH_SUCCESS:
        case GOOGLE_AUTH_SUCCESS:
            localStorage.setItem('access', action.payload.access);
            localStorage.setItem('refresh', action.payload.refresh);
            return{
                ...state,
                isAuthenticated: true,
                access: action.payload.access,
                refresh: action.payload.refresh
            }
        case GOOGLE_AUTH_FAIL:
        case TWITTER_AUTH_FAIL:
        case LOGIN_FAIL:
        case SIGNUP_FAIL:
        case LOGOUT:
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            return {
                ...state,
                access: null,
                refresh: null,
                isAuthenticated: false,
                user: null
            }
        case SIGNUP_SUCCESS:
            return {
                ...state,
                isAuthenticated: false
            }
        case USER_LOADED_SUCCESS:
            return {
                ...state,
                user: action.payload
            }
        case AUTHENTICATED_FAIL:
            return {
                ...state,
                isAuthenticated: false
            }
        case USER_LOADED_FAIL:
            return {
                ...state,
                user: null
            }
        case PASSWORD_RESET_SUCCESS:
        case PASSWORD_RESET_FAIL:
        case PASSWORD_RESET_CONFIRM_SUCCESS:
        case PASSWORD_RESET_CONFIRM_FAIL:
        case ACTIVATION_SUCCESS:
        case ACTIVATION_FAIL:
            return {
                ...state
            }
        default:
            return state
    }
}
