const { errorMsg, errorName } = require("../utils/errorMiddlewareMsg");
const { Category}= require("../models");

checkCategory = async (req, res, next) => {
  try {
    
    if(!req.body.categoryId){
        return next(); 
    }

    // Cek Apakah Category Ada
    const checkCategory = await Category.findOne({ _id: req.body.categoryId, deleteAt: null });

    // Jika Category Tidak Ada
    if (!checkCategory) {
      return next({
        name: errorName.NOT_FOUND,
        message: errorMsg.CATEGORY_NOT_FOUND,
      });
    }

    // Jika Category Ada Maka Lanjut
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkCategory;
