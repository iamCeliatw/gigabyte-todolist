import service from './axios'
let BACKEND_URL =
  'https://api.thedogapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1'

let API_KEY = import.meta.env.VITE_API_KEY
let IMGUR_CLIENT_ID = import.meta.env.VITE_IMGUR_CLIENT_ID

export function getRandomImage() {
  return service({
    url: BACKEND_URL,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    }
  })
}
