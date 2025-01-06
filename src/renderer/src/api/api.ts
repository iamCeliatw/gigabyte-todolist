import service from './axios'
let BACKEND_URL = import.meta.env.VITE_BACKEND_URL

console.log(import.meta.env.VITE_BACKEND_URL, 'window.location.origin🦊')

export function postImage(file: string, token: string) {
  return service({
    url: `${BACKEND_URL}/api/upload`,
    method: 'post',
    data: {
      file: file,
      token: token
    }
  })
}

export function getMusicData() {
  return service({
    url: `${BACKEND_URL}/api/music/urped4vydv`,
    method: 'get'
  })
}

export function agreeShare(status: string) {
  return service({
    url: `${BACKEND_URL}/api/agree`,
    method: 'post',
    data: {
      status: status
    }
  })
}
