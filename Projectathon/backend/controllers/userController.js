const db = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'super-secret-key', {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    });
};

// Badge tiers per master plan (Section 4.8)
function getBadge(points) {
    if (points >= 2500) return 'Champion';
    if (points >= 1000) return 'Guardian';
    if (points >= 500) return 'Civic Hero';
    return 'Rising Star';
}

exports.register = catchAsync(async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return next(new AppError('Please provide name, email, and password', 400));
    }

    // 1) Check if email already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        return next(new AppError('Email already in use', 400));
    }

    // 2) Hash password — cost factor 12 per master plan
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3) Create new user with 10 starting points (gamification reward for registration)
    const newUser = await db.query(
        'INSERT INTO users (name, email, password_hash, points) VALUES ($1, $2, $3, 10) RETURNING id, name, email, role, points',
        [name, email, passwordHash]
    );

    // 4) Generate token
    const token = signToken(newUser.rows[0].id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser.rows[0],
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists && password is correct
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    const token = signToken(user.id);

    // Remove password from output
    const { password_hash, ...userData } = user;

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: userData,
        },
    });
});

exports.getProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const userResult = await db.query(
        'SELECT id, name, email, role, points, created_at FROM users WHERE id = $1',
        [userId]
    );

    if (userResult.rows.length === 0) {
        return next(new AppError('User not found', 404));
    }

    // Count user's complaints
    const countResult = await db.query(
        'SELECT COUNT(*) as total_reports FROM issues WHERE user_id = $1',
        [userId]
    );

    const user = userResult.rows[0];
    user.total_reports = parseInt(countResult.rows[0].total_reports) || 0;
    user.badge = getBadge(user.points);

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

exports.getLeaderboard = catchAsync(async (req, res, next) => {
    // Get top 20 users by points, with their complaint count
    const result = await db.query(`
        SELECT
            u.id,
            u.name,
            u.points,
            COUNT(i.id) as reports
        FROM users u
        LEFT JOIN issues i ON i.user_id = u.id
        WHERE u.role = 'citizen'
        GROUP BY u.id
        ORDER BY u.points DESC
        LIMIT 20
    `);

    const users = result.rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        points: row.points || 0,
        reports: parseInt(row.reports) || 0,
        badge: getBadge(row.points || 0),
    }));

    res.status(200).json({
        status: 'success',
        data: users,
    });
});
