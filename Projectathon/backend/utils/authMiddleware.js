const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'super-secret-key');

    // 3) Check if user still exists — exclude password_hash
    const result = await db.query(
        'SELECT id, name, email, role, points, created_at FROM users WHERE id = $1',
        [decoded.id]
    );
    const currentUser = result.rows[0];

    if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});
