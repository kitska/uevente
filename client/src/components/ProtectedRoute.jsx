import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import { userStore } from "../store/userStore";

const ProtectedRoute = observer(({ children }) => {
  console.log(userStore?.user);
  if (!userStore?.user) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the requested page
  return children;
});

export default ProtectedRoute;
