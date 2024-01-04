import {addUserCase} from "../../actions/user";
import {logout} from "../../actions/auth";

const useFetchUserCases = () => {

    const fetchUserCases = async (token, dispatch, navigate) => {
        try {
            const response = await fetch('/api/user/cases/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log("Unauthorized, logging out");
                    dispatch(logout());
                    navigate('/login');
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