import { logout } from '../features/auth/authSlice';
import { useDispatch } from 'react-redux';
import { apiSlice } from '../features/api/apiSlice';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Clear Redux auth state
    dispatch(logout());

    // Clear all RTK query cache
    dispatch(apiSlice.util.resetApiState());
    // Navigate to login

    navigate('/login');
  };


  return <Button className={`bg-red-800`} onClick={handleLogout}>Logout</Button>;
};

export default LogoutButton;