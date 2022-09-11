const Env = use('Env')
const Nightmare = require('nightmare')
//const phantom = require('phantom')
const Logger = use('Logger')

const WAIT_TIME = parseInt(Env.get('WAIT_TIME'));

class BuqueParserService {
	//Inicializacion de Servicio de buques
	init () {
		Logger.info("init BuqueParserService");
		//Array final de buques
		this.listadoBusques = [];
		//Herramienta nightmare para scrapping
        this.nightmare = Nightmare({ show: true, waitTimeout: WAIT_TIME, gotoTimeout: WAIT_TIME, executionTimeout: WAIT_TIME });
    }

    // Funcion de logueo en nuevo sitio Exolgan
    async login (user, password) {
    	Logger.info(`User => [${user}] Pass => [${password}]`);
    	//https://srv-sso.itl.com.ar/auth/realms/ITL/protocol/openid-connect/auth?client_id=itl_track&redirect_uri=https%3A%2F%2Fitl-track.itl.com.ar%2F%23%2Foperations&response_mode=fragment&response_type=code&scope=openid
    	await this.nightmare
		  .goto(`https://srv-sso.itl.com.ar/auth/realms/ITL/protocol/openid-connect/auth?client_id=itl_track&redirect_uri=https%3A%2F%2Fitl-track.itl.com.ar%2F%23%2Foperations&response_mode=fragment&response_type=code&scope=openid`)
		  .wait('#username')
		  .type('#username', user)
		  .type('#password', password)
		  .wait(3000)
		  .click('#kc-login')
		  .wait(20000)
		  .wait('div#app')
		  .catch(function(e){
			  console.log("ERRRRR");
			  console.log(e);
			  //console.log(e.message.includes('div#app'));
			  throw "Error Soporte (login)";
		  });
          //.wait('#mainNav')
		  //.wait('#mainNav > .inner > ul.nav > li > a[href^="#/queries"]')
		  //.click('#mainNav > .inner > ul.nav > li > a[href^="#/queries"]')
    }

    //Entrada a la pagina de consultas de buques
    async enterToConsultasBuques () {
    	await this.nightmare
    		.click('.card.selectable:first-child')
    		.wait('#inputquery')
    		.wait('.page-container .table > table')
    		.wait(3000);
    }

    // Peticion GET con Bearer para obtener Json de los registros de buques
    async readInfoBuquesJson () {
    	const bearer = await this.nightmare.evaluate(() => {
            return window.localStorage.getItem('vue-token');
        });

		console.log(bearer);

        if(bearer != '' && bearer != null){
        	this.listadoBusques = await this.nightmare
								  			.goto('https://itl-track.itl.com.ar/vessels/search', {'Authorization': `Bearer ${bearer}`})
								  			.evaluate(() => {
								  				return JSON.parse(document.body.innerText);
								  			})
								  			.catch(error => {
											    console.log(error);
												throw "Error Soporte (listado buques)";
											});
			
			console.log(this.listadoBusques);

		  	if(this.listadoBusques.statusCode && this.listadoBusques.statusCode != 200){
		  		this.listadoBusques = [];
		  	}
        }else{
        	throw "Error Soporte (token after login)";
        }

        return this.listadoBusques;
    }

    //Cierre del scrapping
    async close() {
        return this.nightmare.end();
    }
}

module.exports = BuqueParserService