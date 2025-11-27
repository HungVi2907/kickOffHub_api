export function parseJsonFields(fields = []) {
  return (req, res, next) => {
    fields.forEach((field) => {
      const value = req.body[field]
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          req.body[field] = parsed
        } catch (error) {
          // fallback: comma separated list -> array
          req.body[field] = value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        }
      }
    })
    next()
  }
}
