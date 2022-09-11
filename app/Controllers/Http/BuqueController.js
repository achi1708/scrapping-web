'use strict'

const Env = use('Env')
const Logger = use('Logger')
const moment = require('moment');
const { exit } = require('process');

class BuqueController {

	static get inject () {
        return [
          'App/Services/BuqueParserService'
        ];
    }

    constructor (buqueParserService) {
    	//inyecta servicio buques que maneja todo en cuanto al scrapping
    	this.buqueParserService = buqueParserService;
    }

    /**
    ** Abg :: Funcion principal que hace la lectura de los buques desde la nueva pagina de Exolgan
    **/
    async leerInfoBuques ({ params, response }) {
    	Logger.info('Start scrapping of buques (' +  moment().format() + ')');

    	//Inicializa servicio de buques
    	this.buqueParserService.init();

    	let errors = [];
    	let listadoBuques = [];

    	try {
    		//Logueo e ingreso a la plataforma
            await this.buqueParserService.login(Env.get('BUQUES_PLATFORM_USER'), Env.get('BUQUES_PLATFORM_PASS'))
            //Entrada a la vista de los buques
            //await this.buqueParserService.enterToConsultasBuques()
            //Obtiene los buques mediante request GET que retorna un Array (json)
            listadoBuques = await this.buqueParserService.readInfoBuquesJson()
            //Se cierra scrapping
            await this.buqueParserService.close()

          } catch (e) {
          	console.log("errores de este main catch ");
            errors.push(e);
            Logger.error(e)
            return response.send({
                success: false,
                errors
            })
          }

        return response.send({
	        success: true,
	        data: listadoBuques
	    })
    }
}

module.exports = BuqueController
