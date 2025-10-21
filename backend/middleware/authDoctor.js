export default function requireDoctor(req, res, next) {
  if (!req.user || req.user.role !== "DOCTOR") {
    return res.status(403).json({ error: "Access denied. Doctor only." })
  }
  next()
}
