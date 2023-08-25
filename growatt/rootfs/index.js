const Util = require('./util');

(async () => {

    console.log('SUPERVISOR, TOKEN', process.env.SUPERVISOR_TOKEN);

    await Util.createSensor();

})();

