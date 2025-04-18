const database = require("../database/firestore");

/**
 * ConfigManager - A singleton class that manages application configuration
 * by caching values in memory and using Firestore listeners to stay in sync
 */
class ConfigManager {
    constructor() {
        // Singleton pattern
        if (ConfigManager.instance) {
            return ConfigManager.instance;
        }

        this.config = null;
        this.isInitialized = false;

        ConfigManager.instance = this;
    }

    /**
     * Initialize the config manager and attach Firestore listeners
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Initial fetch of configuration
            const configRef = database.collection("metadata").doc("config");
            const snapshot = await configRef.get();

            if (snapshot.exists) {
                this.config = snapshot.data();
            } else {
                // Set defaults if config doesn't exist
                this.config = {
                    lapoPrice: 5.00,
                    lapoSplitRatio: 0.6,
                    votesToCompleteBlock: 3
                };

                // Create the config document with defaults
                await configRef.set(this.config);
            }

            // Attach real-time listener to keep config in sync
            configRef.onSnapshot((doc) => {
                if (doc.exists) {
                    this.config = doc.data();
                }
            }, (error) => {
                console.error("Error listening to config changes:", error);
            });

            this.isInitialized = true;
            console.log("ConfigManager initialized with values:", this.config);

        } catch (error) {
            console.error("Failed to initialize ConfigManager:", error);
            throw error;
        }
    }

    /**
     * Get a configuration value
     * @param {string} key - Configuration key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Configuration value
     */
    get(key, defaultValue = null) {
        if (!this.isInitialized) {
            console.warn("ConfigManager not initialized when accessing", key);
        }

        return this.config && this.config[key] !== undefined
            ? this.config[key]
            : defaultValue;
    }

    /**
     * Get all configuration values
     * @returns {Object} All configuration values
     */
    getAll() {
        if (!this.isInitialized) {
            console.warn("ConfigManager not initialized when accessing all config");
        }

        return this.config || {};
    }

    /**
     * Update a configuration value
     * @param {string} key - Configuration key
     * @param {*} value - New value
     * @returns {Promise<void>}
     */
    async set(key, value) {
        if (!this.isInitialized) {
            throw new Error("ConfigManager not initialized");
        }

        try {
            const configRef = database.collection("metadata").doc("config");
            await configRef.update({[key]: value});
            // No need to update local cache, the listener will handle it

            return true;
        } catch (error) {
            console.error(`Failed to update config key ${key}:`, error);
            throw error;
        }
    }
}

// Export a singleton instance
const configManager = new ConfigManager();
module.exports = configManager;