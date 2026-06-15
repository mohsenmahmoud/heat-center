/**
 * Normalizes any Egyptian phone number format to WhatsApp-compatible international format.
 * Handles: 01xxxxxxxxx / 1xxxxxxxxx / +201xxxxxxxxx / 201xxxxxxxxx / with spaces or dashes
 */
export function toWhatsAppNumber(raw) {
  // Remove everything except digits
  const digits = String(raw || '').replace(/[^0-9]/g, '')

  if (!digits) return null

  // Already has Egypt country code 20
  if (digits.startsWith('20') && digits.length >= 12) return digits

  // Starts with 0 (local Egyptian format: 01xxxxxxxxx)
  if (digits.startsWith('0')) return '20' + digits.slice(1)

  // Starts with 1 and looks like 10 digits (1xxxxxxxxx)
  if (digits.startsWith('1') && digits.length === 10) return '20' + digits

  // Fallback: just prepend 20
  return '20' + digits
}

export function openWhatsApp(phone, message = '') {
  const number = toWhatsAppNumber(phone)
  if (!number) return
  const url = message
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${number}`
  window.open(url, '_blank')
}
