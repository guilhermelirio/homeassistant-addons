const Util = require('./util');

(async () => {

    await Util.createSensor();

    const dados = await Util.getData();

    await Util.login(dados.login, dados.password);

})();

