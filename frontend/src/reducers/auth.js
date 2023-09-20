import {
    TWITTER_AUTH_FAIL,
    TWITTER_AUTH_SUCCESS,
    LOGOUT,
} from "../actions/types";

const initialState = {
    access: localStorage.getItem('access'),
    refresh: localStorage.getItem('refresh'),
    isAuthenticated: !!localStorage.getItem("access"),
    user: localStorage.getItem('user'),
    token: null,
    secret: null,
}

export default function(state=initialState,action){
    switch (action.type){
        case TWITTER_AUTH_SUCCESS:
            console.log('success');
            localStorage.setItem('access', action.payload.access);
            localStorage.setItem('refresh', action.payload.refresh);
            localStorage.setItem('user', action.payload.user);
            return{
                ...state,
                isAuthenticated: true,
                access: action.payload.access,
                refresh: action.payload.refresh,
                user: action.payload.user, // Update the user in state
            }
        case TWITTER_AUTH_FAIL:
        case LOGOUT:
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user'); // Remove the user email from localStorage
            return{
                ...state,
                isAuthenticated: false,
                access: null,
                refresh: null,
                user: null, // Set user to null in state
            }
        default:
            return state
    }
}
