export const text = (result: any) => {
  if (typeof result?.text === 'string') return result.text

  if (typeof result?.response?.text === 'function') {
    return result.response.text()
  }

  if (typeof result === 'string') return result

  return ''
}
