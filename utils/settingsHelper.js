import Settings from "../models/settingsModel.js";

export const getSettings = async () => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  return settings;
};

export default getSettings;