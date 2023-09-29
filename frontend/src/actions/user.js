import {
    ADD_USER_CASE
} from "./types";

export const addUserCase = (userCase) => ({

  type: ADD_USER_CASE,
  payload: userCase,
});
