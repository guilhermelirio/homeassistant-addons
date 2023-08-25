const Util = require('./util');

(async () => {

    await Util.createSensor();

    await Util.verifyOptions();

})();

