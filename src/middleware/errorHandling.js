const { errorMsg, errorName } = require("../utils/errorMiddlewareMsg");

exports.errorHandling = (err, req, res, next) => {
  // Jika error adalah BAD_REQUEST
  if (err?.name === errorName.BAD_REQUEST) {
    return res.status(400).json({
      success: false,
      name: errorName.BAD_REQUEST,
      message: err?.message ?? "Bad Request",
    });
  }

  // Jika error adalah NOT_FOUND
  if (err?.name === errorName.NOT_FOUND) {
    return res.status(404).json({
      success: false,
      name: errorName.NOT_FOUND,
      message: err?.message ?? "Not Found",
    });
  }

  // Jika error adalah UNAUTHORIZED
  if (err?.name === errorName.UNAUTHORIZED) {
    return res.status(401).json({
      success: false,
      name: errorName.UNAUTHORIZED,
      message: err?.message ?? "Unauthorized",
    });
  }

  // Jika error adalah FORBIDDEN
  if (err?.name === errorName.FORBIDDEN) {
    return res.status(403).json({
      success: false,
      name: errorName.FORBIDDEN,
      message: err?.message ?? "Forbidden",
    });
  }

  // Jika error adalah CONFLICT (duplikasi data)
  if (err?.name === errorName.CONFLICT) {
    return res.status(409).json({
      success: false,
      name: errorName.CONFLICT,
      message: err?.message ?? "Conflict",
    });
  }

  // Jika error adalah INTERNAL_SERVER_ERROR
  if (err?.name === errorName.INTERNAL_SERVER_ERROR) {
    return res.status(500).json({
      success: false,
      name: errorName.INTERNAL_SERVER_ERROR,
      message: err?.message ?? "Internal Server Error",
    });
  }

  if (err?.name === errorName.KYC_ERROR) {
    return res.status(400).json({
      success: false,
      name: errorName.NOT_FOUND,
      message:
        err?.message ?? "Verifikasi KTP diperlukan sebelum membuat kampanye",
    });
  }

  // Default Error Handling (untuk error yang tidak terdefinisi)
  console.error(err);
  return res.status(500).json({
    success: false,
    name: "SERVER_ERROR",
    message: "An unexpected error occurred",
  });
};
