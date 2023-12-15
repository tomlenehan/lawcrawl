import { addUserCase } from "../../actions/user";

const useFetchUserCases = () => {

    const fetchUserCases = async (token, dispatch) => {
        try {
            const response = await fetch('/api/user/cases/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Dispatch a logout action
                    dispatch(logout());
                }
                return response.status;
            }
            const data = await response.json();

            if (data) {
                dispatch(addUserCase(data));
            }
        } catch (error) {
            console.error('Error fetching user cases:', error);
        }
    };

    return fetchUserCases;
};

export default useFetchUserCases;