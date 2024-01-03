export const setCurrentPage = (pageNumber) => {
    return {
        type: "SET_CURRENT_PAGE",
        payload: pageNumber,
    };
};