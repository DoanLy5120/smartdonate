export function formatVnd(amount) {
  const n = typeof amount === 'number' ? amount : Number(amount ?? 0)
  return n.toLocaleString('vi-VN') + ' đ'
}

