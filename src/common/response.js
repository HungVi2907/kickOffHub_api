export class ApiResponse {
  static success(res, data = {}, message = 'OK', status = 200) {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, data = {}, message = 'Created') {
    return ApiResponse.success(res, data, message, 201);
  }
}

export default ApiResponse;
