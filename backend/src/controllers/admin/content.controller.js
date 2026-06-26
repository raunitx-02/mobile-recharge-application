const { Banner, Offer, Coupon } = require('../../models');
const response = require('../../utils/response');

// GET /banners
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({ order: [['position', 'ASC']] });
    return response.success(res, banners, 'Banners retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch banners', 500);
  }
};

// POST /banners
const createBanner = async (req, res) => {
  const { title, image_url, link_url, position } = req.body;

  try {
    const banner = await Banner.create({ title, image_url, link_url, position, status: true });
    return response.success(res, banner, 'Banner created successfully', 201);
  } catch (err) {
    return response.error(res, 'Failed to create banner', 500);
  }
};

// PUT /banners/:id
const updateBanner = async (req, res) => {
  const { id } = req.params;
  const { title, image_url, link_url, position, status } = req.body;

  try {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      return response.error(res, 'Banner not found', 404);
    }

    await banner.update({
      title: title !== undefined ? title : banner.title,
      image_url: image_url !== undefined ? image_url : banner.image_url,
      link_url: link_url !== undefined ? link_url : banner.link_url,
      position: position !== undefined ? position : banner.position,
      status: status !== undefined ? status : banner.status
    });

    return response.success(res, banner, 'Banner updated successfully');
  } catch (err) {
    return response.error(res, 'Failed to update banner', 500);
  }
};

// DELETE /banners/:id
const deleteBanner = async (req, res) => {
  const { id } = req.params;

  try {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      return response.error(res, 'Banner not found', 404);
    }

    await banner.destroy();
    return response.success(res, null, 'Banner deleted successfully');
  } catch (err) {
    return response.error(res, 'Failed to delete banner', 500);
  }
};

// GET /offers
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.findAll({ order: [['created_at', 'DESC']] });
    return response.success(res, offers, 'Offers retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch offers', 500);
  }
};

// POST /offers
const createOffer = async (req, res) => {
  const { title, description, type, value, min_amount, max_cashback, valid_till } = req.body;

  try {
    const offer = await Offer.create({
      title,
      description,
      type,
      value,
      min_amount,
      max_cashback,
      valid_till,
      status: true
    });
    return response.success(res, offer, 'Offer rule created successfully', 201);
  } catch (err) {
    return response.error(res, 'Failed to create offer rule', 500);
  }
};

// GET /coupons
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [['created_at', 'DESC']] });
    return response.success(res, coupons, 'Coupons list retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch coupons', 500);
  }
};

// POST /coupons
const createCoupon = async (req, res) => {
  const { code, discount_type, value, min_recharge, max_discount, usage_limit, valid_till } = req.body;

  try {
    const exists = await Coupon.findOne({ where: { code } });
    if (exists) {
      return response.error(res, 'Coupon code already exists', 400);
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discount_type,
      value,
      min_recharge,
      max_discount,
      usage_limit,
      valid_till,
      status: true
    });
    return response.success(res, coupon, 'Coupon rule created successfully', 201);
  } catch (err) {
    return response.error(res, 'Failed to create coupon rule', 500);
  }
};

module.exports = {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getOffers,
  createOffer,
  getCoupons,
  createCoupon
};
