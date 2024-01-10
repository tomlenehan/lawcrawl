import {
    ADD_USER_CASE,
    UPDATE_USER_CASES,
} from "./types";

export const addUserCases = (userCase) => ({
  type: ADD_USER_CASE,
  payload: userCase,
});

export const updateUserCases = (userCases) => ({
  type: UPDATE_USER_CASES,
  payload: userCases,
});