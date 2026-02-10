// // src/components/PrivateRoute.jsx
// import React, { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// const PrivateRoute = ({ children }) => {
//   const { auth } = useContext(AuthContext);

//   if (!auth.isAuthenticated) {
//     return <Navigate to="/" />;
//   }

//   return children;
// };

// export default PrivateRoute;
