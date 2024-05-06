import adminModel from '../../models/admin.model.js';
import currencyModel from '../../models/currency.model.js';

export const getAllCurrency = async (req, res) => {
  const admin = req.decoded;
  const { enabled } = req.query;
  try {
    const query = {};
    if (enabled === 'true') {
      query.enabled = true;
    }
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const currencies = await currencyModel.find(query).sort({ created_at: -1 });
    return res
      .status(200)
      .json({ error: false, success: true, currencies: currencies });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCurrency = async (req, res) => {
  const admin = req.decoded;
  const { name, symbol, enabled } = req.body;
  const file = req.file;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    if (!name || !symbol || !enabled || !file)
      return res
        .status(400)
        .json({ error: true, success: false, message: 'Bad request!' });
    const createdCurrency = await currencyModel.create({
      name: name,
      symbol: symbol,
      flag: file.path,
      enabled: JSON.parse(enabled),
    });
    if (createdCurrency) {
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Created currency successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCurrency = async (req, res) => {
  const { id } = req.params;
  const { name, symbol, enabled } = req.body;
  const admin = req.decoded;
  const file = req.file;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    if (!name || !symbol || !enabled)
      return res
        .status(400)
        .json({ error: true, success: false, message: 'Bad request!' });
    const currency = {
      name: name,
      symbol: symbol,
      enabled: JSON.parse(enabled),
      updated_at: Date.now(),
    };
    if (file) {
      currency.flag = file.path;
    }
    const updatedCurrency = await currencyModel.findByIdAndUpdate(id, currency);
    if (updatedCurrency) {
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Updated currency successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCurrency = async (req, res) => {
  const { id } = req.params;
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const totalCurrencies = await currencyModel.countDocuments();
    if (totalCurrencies === 1) {
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Must have at least 1 currency!',
      });
    }
    const deletedCurrency = await currencyModel.findByIdAndDelete(id);
    if (deletedCurrency)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Deleted currency successfully!',
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
