const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKeys = process.env.API_KEYS.split(',');

    if (!apiKey || !validApiKeys.includes(apiKey)) {
        return res.status(401).send('Unauthorized - Invalid API Key');
    }

    next();
};

module.exports = validateApiKey;