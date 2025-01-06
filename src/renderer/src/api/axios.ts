import axios from 'axios'

const service = axios.create({})

service.interceptors.request.use(
  (config) => {
    //
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    if (response.status !== 200) {
      console.error('Error:', response.data.message)
      return Promise.reject(new Error(response.data.message))
    } else return response.data
  },
  (error) => {
    console.error('err' + error)
    return Promise.reject(error)
  }
)

export default service
