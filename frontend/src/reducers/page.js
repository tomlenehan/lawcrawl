const initialState = {
    currentPage: 1,
};

const pageReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_CURRENT_PAGE":
            return {
                ...state,
                currentPage: action.payload,
            };
        default:
            return state;
    }
};

export default pageReducer;
