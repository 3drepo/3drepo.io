const { v5Path } = require('../../../interop');
const { removeAvatar, storeAvatarInFs, updateAvatar } = require('../../../v4/models/user');
const db = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const storeUserAvatarInFileshare = async (username, avatarBuffer) => {
    await removeAvatar(username);    
    const avatarLink = await storeAvatarInFs(avatarBuffer);
    await updateAvatar(username, avatarLink);
};

const run = async () => {
    const usersWithBinaryAvatars = await db.find('admin', 'system.users', { 'customData.avatar': { $type: 'object' } },
        { 'customData.avatar': 1, user: 1 });

    await Promise.all(usersWithBinaryAvatars.map(async (user) => {
        logger.logInfo(`\t\t-${user.user}`);
        await storeUserAvatarInFileshare(user.user, user.customData.avatar.data.buffer);
    }));
};

module.exports = run;
