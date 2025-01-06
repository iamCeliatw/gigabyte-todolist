import service from './axios'
let BACKEND_URL =
  'https://api.thedogapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1'

let API_KEY = import.meta.env.VITE_API_KEY

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
// curl --location 'https://api.thedogapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1' \
// --header 'Content-Type: application/json' \
// --header 'x-api-key: YOUR-API-KEY'
