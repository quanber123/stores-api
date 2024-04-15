import notifyModel from '../../models/notify.model.js';
import { firstLoadingCache } from '../../modules/cache.js';

export const getSettingsNotifications = async (req, res) => {
  try {
    const data = await firstLoadingCache(
      `settings_notifications:*`,
      notifyModel,
      []
    );

    return res.status(200).json({ notifications: data !== null ? data : [] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
