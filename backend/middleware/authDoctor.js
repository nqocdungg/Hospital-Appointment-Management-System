export default function requireDoctor(req, res, next) {
  if (!req.user || req.user.role?.toUpperCase() !== 'DOCTOR') {
    return res.status(403).json({ message: 'Forbidden' })
  }
  next()
}
