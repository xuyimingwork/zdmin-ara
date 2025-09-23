export function createResponse<T = any>(data?: T, message = 'Success'): Promise<{ ok: true; data?: T; message: string }> {
  return Promise.resolve({ ok: true, data, message })
}

export function createError(message = '服务器内部错误'): Promise<{ ok: false; message: string }> {
  return Promise.resolve({ ok: false, message })
}