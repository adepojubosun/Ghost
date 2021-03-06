var Nconf = require('nconf'),
    path = require('path'),
    _debug = require('debug'),
    debug = _debug('ghost:config'),
    localUtils = require('./utils'),
    env = process.env.NODE_ENV || 'development',
    _private = {};

_private.loadNconf = function loadNconf(options) {
    debug('config start');
    options = options || {};

    var baseConfigPath = options.baseConfigPath || __dirname,
        customConfigPath = options.customConfigPath || process.cwd(),
        nconf = new Nconf.Provider();

    /**
     * no channel can override the overrides
     */
    nconf.file('overrides', path.join(baseConfigPath, 'overrides.json'));

    /**
     * command line arguments
     */
    nconf.argv();

    /**
     * env arguments
     */
    nconf.env({
        separator: '__'
    });

    nconf.file('custom-env', path.join(customConfigPath, 'config.' + env + '.json'));
    nconf.file('default-env', path.join(baseConfigPath, 'env', 'config.' + env + '.json'));
    nconf.file('defaults', path.join(baseConfigPath, 'defaults.json'));

    /**
     * transform all relative paths to absolute paths
     * transform sqlite filename path for Ghost-CLI
     */
    nconf.makePathsAbsolute = localUtils.makePathsAbsolute.bind(nconf);
    nconf.isPrivacyDisabled = localUtils.isPrivacyDisabled.bind(nconf);
    nconf.getContentPath = localUtils.getContentPath.bind(nconf);
    nconf.sanitizeDatabaseProperties = localUtils.sanitizeDatabaseProperties.bind(nconf);

    nconf.sanitizeDatabaseProperties();
    nconf.makePathsAbsolute(nconf.get('paths'), 'paths');
    nconf.makePathsAbsolute(nconf.get('database:connection'), 'database:connection');

    /**
     * values we have to set manual
     */
    nconf.set('env', env);

    // Wrap this in a check, because else nconf.get() is executed unnecessarily
    // To output this, use DEBUG=ghost:*,ghost-config
    if (_debug.enabled('ghost-config')) {
        debug(nconf.get());
    }

    debug('config end');
    return nconf;
};

module.exports = _private.loadNconf();
module.exports.loadNconf = _private.loadNconf;
