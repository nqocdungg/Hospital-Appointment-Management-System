export default function requirePatient(req, res, next) {
  if (!req.user || req.user.role.toUpperCase() !== "PATIENT") {
    return res.status(403).json({ error: "Access denied: Patients only" })
  }
  next()
}
