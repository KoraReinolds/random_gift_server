import axios from 'axios'

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Client-Id': process.env.CLIENT_ID,
  }
})

export default axiosInstance