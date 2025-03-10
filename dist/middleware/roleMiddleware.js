/**
 * 🛡️ Middleware: Check if User has Required Role
 */
export const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRoles = req.user.roles.map((role) => role.name);
        if (!allowedRoles.some(role => userRoles.includes(role))) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
};
