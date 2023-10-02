import React, { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';

const PasswordProtectedRoute = ({ component: Component, ...rest }) => {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    const username = window.prompt('Enter username:');
    const password = window.prompt('Enter password:');
    if (username === 'testuser' && password === 'testpassword') {
      setAuthenticated(true);
    } else {
      alert('Incorrect credentials');
    }
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        authenticated ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default PasswordProtectedRoute;
