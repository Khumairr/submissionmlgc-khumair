const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const InputError = require('../exceptions/InputError');
const storeData = require('../services/storeData');

async function postPredictHandler(request, h) {
  try {
    const { image } = request.payload;
    const { model } = request.server.app;

    // Lakukan prediksi menggunakan model
    const { confidenceScore, label, explanation, suggestion } = await predictClassification(model, image);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      id: id,
      result: label,
      explanation: explanation,
      suggestion: suggestion,
      confidenceScore: confidenceScore,
      createdAt: createdAt
    };

    // Simpan data hasil prediksi
    await storeData(id, data);

    // Kembalikan respon sukses
    const response = h.response({
      status: 'success',
      message: 'Model is predicted successfully',
      data
    });
    response.code(201);
    return response;
  } catch (error) {
    // Tangani kesalahan prediksi
    if (error instanceof InputError) {
      const response = h.response({
        status: 'fail',
        message: 'Terjadi kesalahan dalam melakukan prediksi'
      });
      response.code(400);
      return response;
    }

    // Tangani kesalahan tidak terduga
    const response = h.response({
      status: 'fail',
      message: 'Terjadi kesalahan yang tidak diketahui'
    });
    response.code(500);
    return response;
  }
}

module.exports = postPredictHandler;
