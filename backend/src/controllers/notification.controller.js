const { Notification } = require('../models');
const response = require('../utils/response');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = require('sequelize');

// GET /?page=
const getNotifications = async (req, res) => {
  const userId = req.user.id;
  const { page, limit } = req.query;

  try {
    const { limit: l, offset } = getPagination(page, limit || 20);

    const notifications = await Notification.findAndCountAll({
      where: {
        [Op.or]: [
          { user_id: userId },
          { user_id: null } // Global system notifications
        ]
      },
      limit: l,
      offset,
      order: [['created_at', 'DESC']]
    });

    const paginatedResult = getPagingData(notifications, page, l);
    return response.paginated(res, paginatedResult.items, {
      totalItems: paginatedResult.totalItems,
      totalPages: paginatedResult.totalPages,
      currentPage: paginatedResult.currentPage
    }, 'Notifications retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch notifications', 500);
  }
};

// POST /read/:id
const markAsRead = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const notif = await Notification.findOne({
      where: { id, user_id: userId }
    });

    if (!notif) {
      return response.error(res, 'Notification not found', 404);
    }

    await notif.update({ read: true });
    return response.success(res, null, 'Notification marked as read');
  } catch (err) {
    return response.error(res, 'Failed to update notification', 500);
  }
};

// POST /read-all
const markAllAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await Notification.update(
      { read: true },
      { where: { user_id: userId, read: false } }
    );

    return response.success(res, null, 'All notifications marked as read');
  } catch (err) {
    return response.error(res, 'Failed to update notifications', 500);
  }
};

// POST /fcm-token
const updateFcmToken = async (req, res) => {
  const user = req.user;
  const { token } = req.body;

  if (!token) {
    return response.error(res, 'FCM token is required', 400);
  }

  try {
    await user.update({ fcm_token: token });
    return response.success(res, null, 'FCM token updated successfully');
  } catch (err) {
    return response.error(res, 'Failed to save FCM token', 500);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  updateFcmToken
};
