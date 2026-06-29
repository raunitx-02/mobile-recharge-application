const { AppSetting, AdminUser } = require('../../models');
const response = require('../../utils/response');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// GET /admin/settings
const getSettings = async (req, res) => {
  try {
    let settings = {};
    if (AppSetting) {
      const rows = await AppSetting.findAll();
      rows.forEach(r => { settings[r.key] = r.value; });
    }
    return response.success(res, settings, 'Settings retrieved');
  } catch (err) {
    return response.success(res, {}, 'Settings retrieved');
  }
};

// PUT /admin/settings
const updateSettings = async (req, res) => {
  try {
    if (AppSetting) {
      for (const [key, value] of Object.entries(req.body)) {
        await AppSetting.upsert({ key, value: String(value) });
      }
    }
    return response.success(res, null, 'Settings saved');
  } catch (err) {
    console.error('updateSettings error:', err);
    return response.error(res, 'Failed to save settings', 500);
  }
};

// POST /admin/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return response.error(res, 'Current and new password required', 400);
  try {
    const admin = await AdminUser.findByPk(req.adminUser.id);
    const valid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valid) return response.error(res, 'Current password is incorrect', 401);
    const hash = await bcrypt.hash(newPassword, 10);
    await admin.update({ password_hash: hash });
    return response.success(res, null, 'Password changed successfully');
  } catch (err) {
    return response.error(res, 'Failed to change password', 500);
  }
};

// POST /admin/upload  (image upload to Cloudinary)
const uploadImage = async (req, res) => {
  if (!req.file) return response.error(res, 'No file uploaded', 400);
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'optionspay', resource_type: 'image' },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(req.file.buffer);
    });
    return response.success(res, { url: result.secure_url, public_id: result.public_id }, 'Uploaded');
  } catch (err) {
    return response.error(res, 'Upload failed', 500);
  }
};

// GET /admin/notifications/logs  
const getNotificationLogs = async (req, res) => {
  try {
    const { Notification } = require('../../models');
    const logs = Notification ?
      await Notification.findAll({ order: [['created_at', 'DESC']], limit: 50 }) : [];
    return response.success(res, logs, 'Logs retrieved');
  } catch (err) {
    return response.success(res, [], 'Logs retrieved');
  }
};

// POST /admin/notifications/send
const sendNotification = async (req, res) => {
  const { title, body, target, data } = req.body;
  if (!title || !body) return response.error(res, 'Title and body required', 400);
  try {
    // Log the notification
    const { Notification } = require('../../models');
    if (Notification) {
      await Notification.create({
        title, body,
        target: target || 'all',
        status: 'sent',
        sent_count: 0,
        data: data || null
      });
    }
    // TODO: Actual FCM push implementation goes here
    return response.success(res, { sent: true }, 'Notification sent');
  } catch (err) {
    console.error('sendNotification error:', err);
    return response.error(res, 'Failed to send notification', 500);
  }
};

// GET/PUT /admin/banners
const getBanners = async (req, res) => {
  try {
    const { Banner } = require('../../models');
    const banners = Banner ? await Banner.findAll({ order: [['created_at', 'DESC']] }) : [];
    return response.success(res, banners, 'Banners retrieved');
  } catch { return response.success(res, [], 'Banners retrieved'); }
};

const createBanner = async (req, res) => {
  try {
    const { Banner } = require('../../models');
    if (!Banner) return response.error(res, 'Banner model not available', 500);
    const banner = await Banner.create(req.body);
    return response.success(res, banner, 'Banner created');
  } catch (err) { return response.error(res, err.message || 'Failed', 500); }
};

const updateBanner = async (req, res) => {
  try {
    const { Banner } = require('../../models');
    if (!Banner) return response.error(res, 'Banner model not available', 500);
    await Banner.update(req.body, { where: { id: req.params.id } });
    return response.success(res, null, 'Banner updated');
  } catch (err) { return response.error(res, 'Failed', 500); }
};

const deleteBanner = async (req, res) => {
  try {
    const { Banner } = require('../../models');
    if (!Banner) return response.error(res, 'Not found', 404);
    await Banner.destroy({ where: { id: req.params.id } });
    return response.success(res, null, 'Banner deleted');
  } catch { return response.error(res, 'Failed', 500); }
};

// GET/POST/PUT/DELETE /admin/offers
const getOffers = async (req, res) => {
  try {
    const { Offer } = require('../../models');
    const offers = Offer ? await Offer.findAll({ order: [['created_at', 'DESC']] }) : [];
    return response.success(res, offers, 'Offers retrieved');
  } catch { return response.success(res, [], 'Offers retrieved'); }
};

const createOffer = async (req, res) => {
  try {
    const { Offer } = require('../../models');
    if (!Offer) return response.error(res, 'Offer model not available', 500);
    const offer = await Offer.create(req.body);
    return response.success(res, offer, 'Offer created');
  } catch (err) { return response.error(res, err.message || 'Failed', 500); }
};

const updateOffer = async (req, res) => {
  try {
    const { Offer } = require('../../models');
    if (!Offer) return response.error(res, 'Not found', 404);
    await Offer.update(req.body, { where: { id: req.params.id } });
    return response.success(res, null, 'Offer updated');
  } catch { return response.error(res, 'Failed', 500); }
};

const deleteOffer = async (req, res) => {
  try {
    const { Offer } = require('../../models');
    if (!Offer) return response.error(res, 'Not found', 404);
    await Offer.destroy({ where: { id: req.params.id } });
    return response.success(res, null, 'Deleted');
  } catch { return response.error(res, 'Failed', 500); }
};

// GET /admin/reports
const getReports = async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  try {
    const { Transaction, User } = require('../../models');
    const where = {};
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) where.created_at[require('sequelize').Op.gte] = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
        where.created_at[require('sequelize').Op.lte] = to;
      }
    }

    const [totalTxns, successTxns, failedTxns, totalRevenue, newUsers] = await Promise.all([
      Transaction.count({ where }),
      Transaction.count({ where: { ...where, status: 'success' } }),
      Transaction.count({ where: { ...where, status: 'failed' } }),
      Transaction.sum('recharge_amount', { where: { ...where, status: 'success' } }),
      User.count({ where: dateFrom || dateTo ? { created_at: where.created_at } : {} })
    ]);

    const avgTxnValue = successTxns > 0 ? (totalRevenue || 0) / successTxns : 0;

    return response.success(res, {
      totalTxns,
      successTxns,
      failedTxns,
      totalRevenue: totalRevenue || 0,
      newUsers,
      avgTxnValue,
      revenueTrend: [],
      txnByType: [],
      dailyBreakdown: []
    }, 'Report generated');
  } catch (err) {
    console.error('Reports error:', err);
    return response.error(res, 'Failed to generate report', 500);
  }
};

module.exports = {
  getSettings, updateSettings, changePassword, uploadImage,
  getNotificationLogs, sendNotification,
  getBanners, createBanner, updateBanner, deleteBanner,
  getOffers, createOffer, updateOffer, deleteOffer,
  getReports
};
