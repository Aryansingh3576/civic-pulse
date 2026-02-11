const db = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createComplaint = catchAsync(async (req, res, next) => {
    const { title, description, category, category_id, latitude, longitude, photo_url, address } = req.body;
    const userId = req.user.id;

    // Resolve category_id from category name if needed
    let resolvedCategoryId = category_id;
    if (!resolvedCategoryId && category) {
        const catResult = await db.query('SELECT id FROM categories WHERE name = $1', [category]);
        if (catResult.rows.length > 0) {
            resolvedCategoryId = catResult.rows[0].id;
        }
    }

    // Basic validation — title or description required
    if (!title && !description) {
        return next(new AppError('Please provide a title or description for the complaint', 400));
    }

    // Check complaint limit (10 per day)
    const today = new Date().toISOString().split('T')[0];
    const complaintCount = await db.query(
        "SELECT COUNT(*) as count FROM issues WHERE user_id = $1 AND DATE(created_at) = $2",
        [userId, today]
    );

    if (parseInt(complaintCount.rows[0].count) >= 10) {
        return next(new AppError('You have reached the daily limit of 10 complaints.', 429));
    }

    // Use title or derive from description
    const complaintTitle = title || (description ? description.substring(0, 80) : 'Untitled Report');

    // Insert into DB
    const query = `
        INSERT INTO issues (user_id, category_id, title, description, latitude, longitude, address, photo_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, title, status, priority, created_at
    `;

    const newIssue = await db.query(query, [
        userId,
        resolvedCategoryId || null,
        complaintTitle,
        description || '',
        latitude || null,
        longitude || null,
        address || '',
        photo_url || null,
    ]);

    // Award +10 gamification points for submitting
    await db.query('UPDATE users SET points = points + 10 WHERE id = $1', [userId]);

    res.status(201).json({
        status: 'success',
        data: {
            complaint: newIssue.rows[0],
        },
    });
});

exports.getAllComplaints = catchAsync(async (req, res, next) => {
    const result = await db.query(`
        SELECT
            i.id, i.title, i.description, i.status, i.priority, i.priority_score,
            i.address, i.photo_url, i.upvotes, i.created_at, i.updated_at,
            c.name as category,
            u.name as reporter_name
        FROM issues i
        LEFT JOIN categories c ON c.id = i.category_id
        LEFT JOIN users u ON u.id = i.user_id
        ORDER BY i.created_at DESC
    `);

    res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: {
            complaints: result.rows,
        },
    });
});

exports.getMyComplaints = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const result = await db.query(`
        SELECT
            i.id, i.title, i.description, i.status, i.priority, i.priority_score,
            i.address, i.photo_url, i.upvotes, i.created_at, i.updated_at,
            c.name as category
        FROM issues i
        LEFT JOIN categories c ON c.id = i.category_id
        WHERE i.user_id = $1
        ORDER BY i.created_at DESC
    `, [userId]);

    res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: {
            complaints: result.rows,
        },
    });
});

exports.getStats = catchAsync(async (req, res, next) => {
    const result = await db.query(`
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as submitted,
            SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
            SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed,
            SUM(CASE WHEN is_escalated = 1 THEN 1 ELSE 0 END) as escalated
        FROM issues
    `);

    const stats = result.rows[0];

    res.status(200).json({
        status: 'success',
        data: {
            total: parseInt(stats.total) || 0,
            submitted: parseInt(stats.submitted) || 0,
            in_progress: parseInt(stats.in_progress) || 0,
            resolved: parseInt(stats.resolved) || 0,
            closed: parseInt(stats.closed) || 0,
            escalated: parseInt(stats.escalated) || 0,
        },
    });
});
