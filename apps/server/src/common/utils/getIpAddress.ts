export function getIpAddress(request: any): string {
  const xForwardedFor = request.headers['x-forwarded-for']
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim() // Get the first IP in the list
  }
  // Check if the IP is an IPv4-mapped IPv6 address
  if (request.ip.startsWith('::ffff:')) {
    return request.ip.substring(7) // Remove the IPv6 prefix
  }
  return request.ip
}
