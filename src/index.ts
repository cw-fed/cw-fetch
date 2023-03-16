import { qs } from "./utils"

export type MethodInterface = 'GET' | 'POST'
export type RequestTypeInterface = 'HTTP' | 'AUTO' | 'RPC'

const verbs = {
  'GET': (url: RequestInfo | URL, params: any, options?: any): Promise<Response> => {
    const target = url + '?' + params

    return fetch(target, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json'
      },
      ...options
    })
  },
  'POST': (url: RequestInfo | URL, params: any, options?: any): Promise<Response> => {
    return fetch(url, {
      method: 'POST',
      body: { ...params },
      credentials: 'include',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      ...options
    })
  }
}

function handleRequestParams(params) {
  return qs.stringify(params)
}

export function request(url: URL, method: MethodInterface, params?: any, options?: any, type: RequestTypeInterface = 'HTTP') {
  const envelope = type !== 'RPC' ? handleRequestParams(params) : params

  return verbs[method](url, envelope, options)
    .then((res: Response) => {
      return handleSuccessResponse(res)
    })
    .then((res: Response) => {
      return res.json()
    })
    .catch((err: Response) => {
      return handleErrorResponse(err)
    })
}

function handleSuccessResponse(res) {
  const { status = 200 } = res
  if (status >= 200 || status < 400) {
    return res
  }
  throw new Error(res)
}

function handleErrorResponse(err) {
  console.error({
    msg: err?.errMsg || 'common system error.'
  })
  return err
}

export function getH5data(url: URL) {
  return request(url, 'GET')
}

export default request