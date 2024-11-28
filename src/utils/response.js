class ResponseAPI {
  static success(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = "Error", statusCode = 400, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static unauthorized(res, message = "Unauthorized") {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = "Forbidden") {
    return this.error(res, message, 403);
  }

  static notFound(res, message = "Not Found") {
    return this.error(res, message, 404);
  }

  static serverError(res, error) {
    console.error(error);
    return this.error(
      res,
      "Internal Server Error",
      500,
      process.env.NODE_ENV === "development" ? error.message : null
    );
  }
}

module.exports = ResponseAPI;
