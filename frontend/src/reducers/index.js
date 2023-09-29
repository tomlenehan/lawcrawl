import { combineReducers } from 'redux';
import auth from './auth';
import userCasesReducer from './user';

const rootReducer = combineReducers({
    auth,
    userCases: userCasesReducer,
})

export default rootReducer