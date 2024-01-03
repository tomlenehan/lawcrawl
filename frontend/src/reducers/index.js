import { combineReducers } from 'redux';
import auth from './auth';
import userCasesReducer from './user';
import page from './page';

const rootReducer = combineReducers({
    auth,
    userCases: userCasesReducer,
    page,
})

export default rootReducer