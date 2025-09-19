// Legacy text extraction utility - now adapter returns text directly
export const text = (result: any) => {
  // Handle new @google/genai response format
  if (typeof result?.text === 'string') return result.text
  
  // Handle legacy @google/generative-ai format
  if (typeof result?.response?.text === 'function') {
    return result.response.text()
  }
  
  // Fallback for direct text response
  if (typeof result === 'string') return result
  
  return ''
}
