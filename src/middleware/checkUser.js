const { errorMsg, errorName } = require("../utils/errorMiddlewareMsg");
const User = require("../models/User");

checkUser = async (req, res, next) => {
    try {
        // Cek Apakah User Ada
        const checkUser = await User.findOne({ _id: req.user._id, deleteAt: null });

        // Jika User Tidak Ada
        if (!checkUser) {
            return next({
                name: errorName.NOT_FOUND,
                message: errorMsg.USER_NOT_FOUND,
            });
        }

        // Jika User Ada Maka Lanjut
        next();
    } catch (error) {

        next(error);
    }
};

module.exports = checkUser;
