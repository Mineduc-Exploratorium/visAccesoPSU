// visAccesoEdSup
define([
	'underscore',
	'backbone',
	'jquery',
	'd3',
	'VistaTooltip',
	'VistaEjesXY',
	'views/BarLayout'
	], function(_, Backbone,$, d3, VistaTooltip, VistaEjesXY, BarLayout){

	var Visualizador = Backbone.View.extend(
		/** @lends Visualizador.prototype */
		{

		/**
		* @class VistaPrincipal vista que despliega visualizacion de ingresos vs costos de carreras
		*
		* @augments Backbone.View
		* @constructs
		*
		* @param {object} options parametros de incializacion
		* @param {array} options.data arreglo con datos (cada dato es un objeto con atributos)
		* @param {d3.select()} options.svg elemento SVG utilizado como contenedor del gráfico
		* @param {Backbone.View} options.tooltip vista utilizada como tooltip
		* Visualizador Inicia parametros de configuración y llamada a datos
		*/
		initialize: function() {
			//this.svg = this.options && this.options.svg ? this.options.svg : document.createElementNS('http://www.w3.org/2000/svg', "g");
			this.data = this.options && this.options.data ? this.options.data : [];

			// Formato de datos de entrada
			// [
			// {
			//		estudiantes : "2213" - cantidad de estudiantes en esta agrupación
			//		agno_ingreso : "2012" - año de ingreso a ES (2006 a 2013)
			//		tipo_ie : "IP" - tipo de institución (IP | CFT | FFAA | U-CRUCH | U-PRIVADA)
			//		psu : "700a900" - rango de puntaje PSU (100 a 475 | 475a500 | 500a550 | 550a600 | 600a700 | 700a900 | S/I )
			//		nem : "50a55" - rango de notas NEM (10a40 | 40a50 | 50a55 | 55a60 | 60a70 | S/I)
			//		ranking_10 : "1" - pertenece a 10% mejores egresados ("0" | "1")
			//		ranking_75 : "1" - pertenece a 7.5% mejores egresados ("0" | "1")
			// 		dependencia : "PP" - dependencia de egreso (MUN | PP | PS | S/I)
			//		año_egreso : "2012" - año de egreso (2009 | 2010 | 2011 | 2012 | 2008oAnterior | S/I)
			//		QUINTIL : "3" - Quintil socioeconímico (1,2,3,4,5)
			//	
			// },
			// ...
			// ]

			// Binding de this (esta vista) al contexto de las funciones indicadas
			_.bindAll(this,"render", "tootipMessage", "toggle")

			// Alias a this para ser utilizado en callback functions
			var self = this; 
			
			// Configuración de espacio de despliegue de contenido en pantalla
			this.margin = {top: 20, right: 20, bottom: 30, left: 20},
	    	this.width = 800 - this.margin.left - this.margin.right,
	    	this.height = 300 - this.margin.top - this.margin.bottom;

	    	// Escala de colores para rango PSU
	   		this.colorPSU = d3.scale.category10();
	   		this.colorIEs =  d3.scale.category20();

	   		// Crea tooltip utilizada para desplegar detalles de elementos
			this.tooltip = new VistaTooltip();
	  		// Reescribe función generadora del mensaje en tooltip
			this.tooltip.message = this.tootipMessage;

			// Limpia Data
			// ===========
			// Limpia datos de entrada (P.Ej. Cambiar duración de semestres a años)

			// Deja filtar para dejar sólo estudiantes egresadoel 2012
			this.data = _.filter(this.data, function(d) {return (d.año_egreso == 2012)})
			
			// Crea nuevas agrupaciones por resultados PSU
			// De psu : (100 a 475 | 475a500 | 500a550 | 550a600 | 600a700 | 700a900 | S/I )
			// A rangopsu : ("Bajo 475" | "475 a 550" | "Sobre 550")
			this.data = _.map(this.data, function(d,i) {
				switch(d.psu)
				{
				case "100a475":
				  d.rangopsu = "Bajo 475";
				  break;
				case "475a500":
				  d.rangopsu = "475 a 550";
				  break;
				case "500a550":
				  d.rangopsu = "475 a 550";
				  break;
				case "550a600":
				  d.rangopsu = "Sobre 550";
				  break;
				case "600a700":
				  d.rangopsu = "Sobre 550";
				  break;
				case "700a900":
				  d.rangopsu = "Sobre 550";
				  break;
				default:
				  d.rangopsu = "Bajo 475";
				}

				d.id = i;
				return d;
			})

	


			this.render();
	 
		},

		/**
		* Reescribe función generador de mensajes utilizado en herramienta de tooltip
		* tooltip.tooltipMessage(data) 	
		*
		* @param {object} data objeto con atributos (Ej: {nombre: "Juan", Edad: 18}) utilizados en la creación del mensaje a desplegar por tooltip
		* @returns {string} Mensaje (html) a ser utilizado por tooltip
		*/
		tootipMessage : function(d) {
			var self = this;
		
			var formatMiles = d3.format(",d");
			var formatDecimal = d3.format('.2f')

			// Texto a incluir para identificar el quintil ("0" -> Todos)
			var quintilmsg = (d.quintilkey == "0") ? "Todos los quintiles" : "Quintil "+d.quintilkey;
		
			var msg = "<strong>"+d.psukey+" puntos en PSU - "+quintilmsg+"</strong>";
			msg += "<br>Total: "+formatMiles(d.value)+" estudiantes<br><br>";

			// Crea arreglo con datos por tipo de universidades
			grupoTipoIE = d3.entries(_.groupBy(d.values, function(d) {return d.tipo_ie}))
			_.map(grupoTipoIE, function(d) {
				d.total = _.reduce(d.value, function(memo, d) {return +memo+parseInt(d.estudiantes)}, 0)
			})

			grupoTipoIE=grupoTipoIE.sort(function(a,b) {return b.total-a.total});

			var maxEstudiantes = d3.max(grupoTipoIE, function(d) {return d.total});
			var scaleIEs = d3.scale.linear().range([0,200]).domain([0,maxEstudiantes])
			var tablecontainer = d3.select($("<div>")[0])

			var tablerows = tablecontainer.append("table").selectAll("tr")
				.data(grupoTipoIE)
				.enter()
				.	append("tr")

			tablerows.append("td")
				.text(function(d) {return d.key})

			var totalestudiantesporIE = tablerows.append("td")
				.append("div")
				.style("background", function(d) { return self.colorIEs(d.key) })
				.style("white-space", "nowrap")
				.style("width", function(d) { return scaleIEs(d.total) + "px"; })
				.text(function(d) {return formatMiles(d.total)+" estudiantes"})
				
			msg += tablecontainer.html();

			var estudiantesTop75 = _.reduce(d.values, function(memo,d) {return (d.ranking_75=="1" && d.dependencia!="PP")?+memo +parseInt(d.estudiantes):memo}, 0)

			msg += "<br>"+formatMiles(estudiantesTop75)+ " estudiantes en los 7,5% mejores egresados de su establecimiento (municipales o particulares subvencionados)"
			
			return msg;
		}, 

		/**
		* Genera nodos que corresponden a objetos ordenados a la derecha e izquierda de un origen y que representan agrupaciones de estudiantes
		* @param {array} nodes Lista de objetos que agrupan datos. Cada objeto tiene propiedad key (Identificador/nombre) y value (arreglo con detalle de grupos individuales de estudiantes - cada uno tiene propiedad estudiantes para indicar la cantidad de etsudiantes en el grupo)
		* @param {number} xOrigin Punto en el eje x en torno al cual de ordenarán los nodos a la derceha e izquierda 
		* @param {number} width Ancho que utilizara el conjunto total de nodos
		* @param {number} total de estudiantes en el conjunto total de nodos
		* @param {array} left Arreglo con el listado de keys o nombres de los subgrupos que se ordenarán a la izquierda del origen (partiendo por el más cercano al origen)
		* @param {array} right Arreglo con el listado de keys o nombres de los subgrupos que se ordenarán a la derecha del origen (partiendo por el más cercano al origen)
		* @returns {array} Arreglo con nodos que contienen propiedades x (pos x), dx (ancho), value (total de estudiantes en este nodo) y values (detalle de objetos con datos individuales)
		*/
		layoutXPSU : function(nodes, xOrigin, width, total, left, right) {
			
			// Cosntruye map (objeto) indexando todos los grupos de PSu
			var map = {};

			_.each(left, function(d,i) {
				map[d] = {};
				//map[d].order = -(i+1);
				map[d].nodeIndex = null;
			});

			_.each(right, function(d,i) {
				map[d] = {};
				//map[d].order = i;
				map[d].nodeIndex = null;
			});

			// Asigna a cada nodo atributos 
			// values: arreglo con el listado de nodos asocidaos al rango de pSU (originalmente almacenado como value)
			// value: total de estudiantes (suma los estudiantes de todos los nodos en la categoría)
			// dx: ancho del nodo (proporcional a la cantidad de estudiantes c/r al total)
			_.map(nodes, function(d) {
				d.values = d.value;
				d.value = _.reduce(d.values, function(memo,d) {return +memo+parseInt(d.estudiantes)}, 0);
				d.dx = width*d.value/total;
			});

			// Registra en map el índice del respectivo nodo en el arreglo nodes (y el ancho dx)
			_.each(nodes, function(d,i) {
				map[d.key].nodeIndex=i;
				map[d.key].dx = d.dx;
			});

			// Calcula posición x de los nodos a la derecha del origen
			_.each(right, function(key,i) {
				// Primer nodo a la derecha
				if (i == 0) {
					x = xOrigin
				} else {
					// Calcula pos x en base a posicion y ancho del nodo anterior
					prevIndex = map[right[i-1]].nodeIndex;
					prevNode = nodes[prevIndex];
					x = prevNode.x + prevNode.dx
				}
				nodes[map[key].nodeIndex].x = x;
			})

			_.each(left, function(key,i) {
				// Verificar que exista un nodo para esta categoría y calcular psoición
				if (i == 0) {
					myIndex = map[left[i]].nodeIndex;
					myNode = nodes[myIndex];
					x = xOrigin - myNode.dx;
				} else {
					prevIndex = map[left[i-1]].nodeIndex;
					prevNode = nodes[prevIndex];
					myIndex = map[left[i]].nodeIndex;
					myNode = nodes[myIndex];

					x = prevNode.x - myNode.dx
				}
				nodes[map[key].nodeIndex].x = x;
			})

			// Deja datos de ubicación bajo el atributo pos1 y genera atributos psukey & quintilkey
			// [{psukey:"Bajo 475", quintilkey:"Todos", pos1.x=350, pos1.dx=50, value: 1234, values:[datos]}, ...]
			_.map(nodes, function(d) {
				d.psukey = d.key;
				d.quintilkey = "0";  //Se utiliza quintil 0 cunado están todos agrupados
				d.pos1 = {};
				d.pos1.x = d.x;
				d.pos1.dx = d.dx
			})

			return nodes;
		},

		/**
		* Genera nodos que corresponden subagrupaciones PSY & Quintil
		* Se generan tantos nodos como combinacion PSU/Quintil con 2 posibles ubicaciones
		* pos1: Ubicación de quintiles al interior de un grupo mayor de rango PSU
		* pos2: Ubicación de todos los rangos PSU de un mismo quintil oredenados a la derecha e izquierda d eun origen
		* @param {array} psunodesdata Arreglo con los nodos que contienen las ubicacioens de las agrupaciones principales por rango PSU
		* Cada noso tiene propiedades x (pos x), dx (ancho), value (total de estudiantes en este nodo) y values (detalle de objetos con datos individuales)
		* @param {number} xOrigin Punto en el eje x en torno al cual de ordenarán los nodos a la derceha e izquierda 
		* @param {number} width Ancho que utilizara el conjunto total de nodos
		* @param {number} total de estudiantes en el conjunto total de nodos
		* @param {array} left Arreglo con el listado de keys o nombres de los subgrupos que se ordenarán a la izquierda del origen (partiendo por el más cercano al origen)
		* @param {array} right Arreglo con el listado de keys o nombres de los subgrupos que se ordenarán a la derecha del origen (partiendo por el más cercano al origen)
		* @param {array} quintiles Arreglo con el listado de quintiles Ej: [1,2,3,4,5]
		* @returns {array} Arreglo con nodos que contienen propiedades x (pos x), dx (ancho), value (total de estudiantes en este nodo) y values (detalle de objetos con datos individuales)
		*/
		layoutXPSUQuintil : function(psunodesdata, xOrigin, width, total, left, right, quintiles) {
			var self = this;

			// Genera subnodoe (QuintilPSU) y los organiza en una matriz[psu][quintil]  nodeMapPSUQuintil["Bajo 475"]["1"] = arreglo con nodos de Bajo 475 Q1
			// Para cada nodo calcula su pos1 (Ubicacion al interior de la agrupación "padre" de rango PSU)
			// Seá utilizado como estructura auxiliar para calcular los datos de los subnodos
			var nodeMapPSUQuintil = {};
			_.each(psunodesdata, function(psunode) {
				var psukey = psunode.key;
				

				nodeMapPSUQuintil[psukey] = {};

				// Generar grupos por quintil para cada rango de PSU
				var subdata =  _.groupBy(psunode.values, function(d) {return d.QUINTIL})
				subdata = d3.entries(subdata);

				// Filtra aquellos con Quintil no vacio para evitar errores
				subdata = _.filter(subdata, function(d) {return d.key != ""} );

				var localxOrigin = psunode.x;
				var width = psunode.dx;
				var total = psunode.value;
				var left = [];
				var right = quintiles;

				// Genera los nodos de cada quintil para una agrupación PSU dada
				var quintilnodes = self.layoutXPSU(subdata,localxOrigin,width, total, left, right );

				// Almacena datos de posición en objeto pos1 y registra claves de psu & quintil
				_.map(quintilnodes, function(node) {
					node.psukey = psukey;
					node.quintilkey = node.key;
				})

				// Ubica los nodos en el mapa (matriz) nodeMapPSUQuintil
				_.each(quintilnodes, function(quintilnode) {
					nodeMapPSUQuintil[psukey][quintilnode.key] = quintilnode;
				})

			})

			// Recorre los nodos para calcular la posición 2 (agrupados por Quintil)
			_.each(quintiles, function(quintil) {
				var prevX;
				var nextX;
				// Calcula la posición de nodos ubicados a la izquierda del origen
				_.each(left, function(rangopsu, i) {
					var node = nodeMapPSUQuintil[rangopsu][quintil];
					node.pos2 = {};
					node.pos2.dx = node.pos1.dx;
					if (i == 0) {
						node.pos2.x = xOrigin - node.pos2.dx;
					} else {
						node.pos2.x = prevX - node.pos2.dx;
					}
					prevX = node.pos2.x;
				});
				// Calcula la posición de nodos ubicados a la derecha del origen
				_.each(right, function(rangopsu, i) {
					var node = nodeMapPSUQuintil[rangopsu][quintil];
					node.pos2 = {};
					node.pos2.dx = node.pos1.dx;
					if (i == 0) {
						node.pos2.x = xOrigin;					
					} else {
						node.pos2.x = nextX;
					}
					nextX = node.pos2.x+node.pos2.dx;
				});
			})

			//Genera arreglo plano con todos los nodos almacenados en el mapa nodeMapPSUQuintil
			var nodespsuquintil = [];

			_.each(d3.entries(nodeMapPSUQuintil), function(subnodePSU) {
				_.each(d3.entries(subnodePSU.value), function(subnodeQuintil) {
					nodespsuquintil = _.union(nodespsuquintil, subnodeQuintil.value);
				})
			})

			return nodespsuquintil
		},


		render: function() {
			var self = this;


			// Se generarán 2 arreglos con nodos
			// nodesPSU: grupos por categorías de  resultado PSU (Ej "Bajo 475")
			// nodesPSUQuintil: grupos  categorías de  resultado PSU y Quintil (Ej "Bajo 475" & "Q1")
			// 
			// Para nodesPSU se genera los datos de ubicación de cada nodo (x & dx), de tal manera que se organizedn algunos nodos
			// a la derecha del origen (Ej. Aquellos con PSU sobre 475 ) y otros a la izquierda (Ej. Aquellos con PSU Bajo 475)
			//
			// Sólo se calculan datos de posición x y ancho (dx), la posicion y y el alto quedan para ser definido por la visualización.
			//
			// Para los nodesPSUQuintil se calculan 2 posiciones pos1 & pos2
			// pos1 es la posicion del nodo al interior de la ubicación nodo 1 relacionado (Ej todos los Quintiles del grupo "Bajo 475")
			// pos2 es la posición del nodo al agruparse todos los grupos PSU de un determinado quintil.
			// Al igual que en nodos PSU, la pos2 asume algunos nodos a la izquierda del origen y otros a la derecha

			/* this .data: Arreglo con objetos del tipo
			 {
			 	estudiantes : Numero total de estudiantes que comparten estas características
			 	rangopsu : Rango de resultado PSU (Ej "Sobre 550")
			 	tipo_ie : Tipo de institución en la cual está matriculado (Ej. "Centro de Formación Técnica")
			 	QUINTIL : Quintil socioeconómico (Ej 3)
			 }
			 */


			// Calcula el total de estudiantes en los datos
			var total = _.reduce(this.data, function(memo,d) {return +memo+parseInt(d.estudiantes)}, 0)

			// Grupos de PSU que se ubicarán a la izquierda del origen
			var left = ["Bajo 475"];
			// Grupos de PSU que se ubicarán a la derecha del origen
			var right = ["475 a 550", "Sobre 550"];
			// Lista ordenada de quintiles
			var quintiles = ["1","2","3","4","5"];

			// Posición x que corresponde al origen en torno al cual se ordenan los grupos
			var xOrigin = self.width/2;

			// Ancho utilizado por el total de nodos unidos
			var width = this.width;

			// Genera objeto con los datos agrupados según el atributo rango psu (Ej {"Bajo 475":[arreglo condatos], "Sobre550":[arreglo con datos], ...})
			var psuGroupedData = _.groupBy(this.data, function(d) {return d.rangopsu});

			// Convierte datos agrupados a un arreglo del tipo:
			// [{key:"Bajo 475", value:[datos]}, {key:"Sobre 550", value:[datos]}, ...]
			psuGroupedData = d3.entries(psuGroupedData);
			
			// psunodesdata
			// ============
			// Genera arreglo con datos de nodos psu
			// [{psukey:"Bajo 475", quintilkey="0", pos1.x=350, pos1.dx=50, value: 1234, values:[datos]}, ...]
			this.psunodesdata = this.layoutXPSU(psuGroupedData, xOrigin, width, total, left, right);


			// nodespsuquintil
			// ============
			// Genera arreglo con datos de nodos segun psu & quintil
			// [{psukey:"Bajo 475", quintilkey="3", pos1.x=350, pos1.dx=50, pos2.x=250, pos2.dx=50, value: 1234, values:[datos]}, ...]
			this.nodespsuquintil = this.layoutXPSUQuintil(this.psunodesdata, xOrigin, width, total, left, right, quintiles);

			// Escala y para ubicar nodos de distintos quintiles
			// "0" Corresponde a todos los quintiles
			this.yScale = d3.scale.ordinal()
				.range([10,10,50,90,130,170])
				.domain(["0", "1", "2", "3", "4", "5"])

			// Ancho (altura) de cada nodo
			this.barHeight = 40,

			this.mainDiv = d3.select(this.el).append("div")
					.style("position", "relative")
			    	.style("height", self.height + "px")
			    	.style("width", self.width + "px")

			// Detecta click en el body para realizar un cambio de modo (Agrupado vs desagrupado por quintil)
			d3.select(this.el)
				.on("click", this.toggle)

			// Muestra nodos agrupados por PSU
			this.showpsunodes(this.psunodesdata);
			this.showetiquetas();

			// Recuerda estado actual para poder alternar entre visible y no visible
			this.visiblePorQuintiles = false;
		},

		/**
		* Alterna entre vista desagrupada por quintil y no desagrupada por quintil
		*/
		toggle : function() {
			var self = this;
				this.visiblePorQuintiles = !this.visiblePorQuintiles;

				if (this.visiblePorQuintiles) {
					// Muestra nodos de resultados por quintil
					this.showquintilnodes(this.nodespsuquintil);

										
				} else {
					// Oculta nodos con resultados por quintiles
					this.showquintilnodes([]);
					
					// Oculta etiquetas de quintiles
					this.quintillabels
						.transition()
						.duration(2000)
						.style("opacity", "0")
				}
				// Ocultar tooltip en caso que esté visible
				this.tooltip.hide();

			},

		/**
		* Muestar etiquetas de Quintiles
		*/
		showetiquetas : function() {
			var self = this;

			// Genera etiquetas de quintiles (oculta)
			this.quintillabels = this.mainDiv.selectAll(".node.etiqueta")
				.data([	{label:"Quintil 1", quintil:1},
						{label:"Quintil 2", quintil:2},
						{label:"Quintil 3", quintil:3},
						{label:"Quintil 4", quintil:4},
						{label:"Quintil 5", quintil:5}
						]
						)
				.enter()
					.append("div")	
			  		.attr("class", "node etiqueta")
					.style("position", "absolute")
					.style("opacity", "0")
					.style("left", function(d) { return 50 + "px"; })
					.style("top", function(d) { return self.yScale(d.quintil) + "px"; })
					.text(function(d) {return d.label}) 
		},


		/**
		* Depsliega los nodos correspondientes a las agrupaciones de resultados PSU 
		* para el universi total de datos
		*/
		showpsunodes : function(psunodesdata) {
			var self = this;

			this.psunodes = this.mainDiv.selectAll(".node.psu")
				.data(psunodesdata)

			this.psunodes.exit()
				.transition()
				.style("opacity", "0")
				.remove()


			this.psunodes.enter()
				.append("div")	
		  		.attr("class", "node psu")
		  		.style("opacity", "0")
		  		.style("position", "absolute")
		  		.style("text-align", "center")
		  		.call(position0)
				.style("background", function(d) { return self.colorPSU(d.psukey) })
				.style("color", function(d) {
					// Estima la claridad del color de fondo para elegit el color del texto
					bgcolor = self.colorPSU(d.psukey);
					a = 1 - ( 0.299 * bgcolor.r + 0.587 * bgcolor.g + 0.114 * bgcolor.b)/255;
					return a < 0.5 ? "black" : "white"; 
				})
				.text(function(d) { return d.psukey; })
				.on("mouseenter", function(d) {
					self.tooltip.show(d);
				})
				.on("mouseout", function(d) {
					self.tooltip.hide();
				})		  		
				.transition()
				.style("opacity", "1")


			function position0() {
			  this.style("left", function(d) { return d.pos1.x + "px"; })
			      .style("top", function(d) { return self.yScale(d.quintilkey) + "px"; })
			      .style("width", function(d) { return d.pos1.dx + "px"; })
			      .style("height", function(d) { return 30 + "px"; });
			}

		},


		/**
		* Depsliega los nodos correspondientes a las agrupaciones de resultados PSU 
		* según el quintil de ingreso
		*/
		showquintilnodes : function(quintilnodes) {
			var self = this;

			this.quintilnodes = this.mainDiv.selectAll(".node.psuquintil")
				.data(quintilnodes)

			this.quintilnodes.exit()
				.transition()
				.duration(2000)
				.call(position1)
				.each("end",function() {self.showpsunodes(self.psunodesdata);})
				.transition()
				.duration(1000)
				.style("opacity", "0")
				.remove()

			
			this.quintilnodes.enter()
					.append("div")	
			  		.attr("class", "node psuquintil")
					.style("position", "absolute")
					.style("opacity", "0")
					.call(position1)
					//.text(function(d) { return d.psukey; })
					.style("background", function(d) { return self.colorPSU(d.psukey) })
					//.text(function(d) { return d.psukey; })
					.on("mouseenter", function(d) {
						self.tooltip.show(d);
					})
					.on("mouseout", function(d) {
						self.tooltip.hide();
					})

			this.quintilnodes
				.transition()
				.duration(1000)
				.style("opacity", "1")
				.each("end",function() {self.showpsunodes([]);})
				.transition()
				.duration(2000)
				.call(position2)
				.each("end", function() {
					self.quintillabels
						.transition()
						.duration(1000)
						.style("opacity", "1")
				})



			function position1() {
			  this.style("left", function(d) { return d.pos1.x + "px"; })
		      	.style("top", function(d) { return self.yScale("0") + "px"; })
				.style("width", function(d) { return d.pos1.dx + "px"; })
			    .style("height", function(d) { return 30 + "px"; });
			}
		
			function position2() {
			  this.style("left", function(d) { return d.pos2.x + "px"; })
			      .style("top", function(d) { return self.yScale(d.quintilkey) + "px"; })
			      .style("width", function(d) { return d.pos2.dx + "px"; })
			      .style("height", function(d) { return 30 + "px"; });
			}


		}


	});
  
  return Visualizador;
});

