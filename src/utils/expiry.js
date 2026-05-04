export function daysLeft(date) {
  if (!date) return null
  const today = new Date()
  today.setHours(0,0,0,0)

  const expiry = new Date(date)
  expiry.setHours(0,0,0,0)

  return Math.round((expiry - today) / 86400000)
}

export function expiryStatus(date) {
  const d = daysLeft(date)
  if (d === null) return null
  if (d < 0) return 'expired'
  if (d <= 2) return 'soon'
  return 'ok'
}