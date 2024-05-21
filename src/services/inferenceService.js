const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
    try {
        const tensor = tf.node
            .decodeImage(image, 3)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat()
            .div(tf.scalar(255)); // Normalisasi gambar

        const prediction = model.predict(tensor);
        const score = await prediction.data();
        const confidenceScore = score[0];

        const threshold = 0.5;
        let label, explanation, suggestion;

        if (confidenceScore > threshold) {
            label = 'Cancer';
            explanation = "This skin image shows signs of cancer.";
            suggestion = "Please consult a nearby doctor for further examination and appropriate treatment.";
        } else {
            label = 'Non-cancer';
            explanation = "This skin image does not show signs of cancer.";
            suggestion = "However, continue to monitor any changes in your skin and consult a doctor if there are any suspicious changes.";
        }

        if (!label || (label !== 'Cancer' && label !== 'Non-cancer')) {
            throw new InputError('Invalid label generated by the model');
        }

        return { confidenceScore: confidenceScore * 100, label, explanation, suggestion };
    } catch (error) {
        throw new InputError(`Input error occurred: ${error.message}`);
    }
}

module.exports = predictClassification;
