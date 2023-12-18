import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    LOGOUT,
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
        case SET_AUTH_ERROR:
            return {
                ...state,
                authError: action.payload
            };
        case LOGIN_SUCCESS:
            localStorage.setItem('access', action.payload.access);
            return{
                ...state,
                isAuthenticated: true,
                access: action.payload.access,
                refresh: action.payload.refresh
            }
        case LOGIN_FAIL:
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            return{
                ...state,
                isAuthenticated: false,
                access: null,
                refresh: null,
                user: null,
            }
        case USER_LOADED_SUCCESS:
            return{
                ...state,
                user: action.payload
            }
        case USER_LOADED_FAIL:
            return{
                ...state,
                user: null
            }
        case TWITTER_AUTH_SUCCESS:
            localStorage.setItem('access', action.payload.access);
            localStorage.setItem('refresh', action.payload.refresh);
            localStorage.setItem('user', action.payload.user);
            return{
                ...state,
                isAuthenticated: true,
                access: action.payload.access,
                refresh: action.payload.refresh,
                user: action.payload.user,
            }
        case TWITTER_AUTH_FAIL:
        case GOOGLE_AUTH_SUCCESS:
            localStorage.setItem('access',action.payload.access)
            return{
                ...state,
                isAuthenticated: true,
                access: action.payload.access,
                refresh: action.payload.refresh
            }
        case GOOGLE_AUTH_FAIL:
        case LOGOUT:
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user');
            return{
                ...state,
                isAuthenticated: false,
                access: null,
                refresh: null,
                user: null,
            }
        default:
            return state
    }
}
