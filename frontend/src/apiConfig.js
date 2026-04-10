const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001/api' 
  : (process.env.REACT_APP_API_URL || '/api');
export default API_URL;
