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

			// Binding de this (esta vista) al contexto de las funciones indicadas
			_.bindAll(this,"render", "tootipMessage", "toggle")

			// Alias a this para ser utilizado en callback functions
			var self = this; 
			
			// Configuración de espacio de despliegue de contenido en pantalla
			this.margin = {top: 20, right: 20, bottom: 30, left: 20},
	    	this.width = 1000 - this.margin.left - this.margin.right,
	    	this.height = 400 - this.margin.top - this.margin.bottom;

	   		this.color = d3.scale.category10();
	   		this.colorIEs =  d3.scale.category20();

			this.tooltip = new VistaTooltip();
	  		// Reescribe función generadora del mensaje en tooltip
			this.tooltip.message = this.tootipMessage;

			// Limpia Data
			// ===========
			// Limpia datos de entrada (P.Ej. Cambiar duración de semestres a años)
			this.data = _.filter(this.data, function(d) {return d.año_egreso == 2012})
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

			var sortvalueRangoPSU = function(d) {
				switch(d.key)
					{
					case "Bajo 475":
					  return 20;
					  break;
					case "475 a 550":
					  return 30;
					  break;
					case "Sobre 550":
					  return 40 ;
					  break;
					case "Sin PSU":
					  return 10 ;
					  break;
					default:
					  return 10;
					}
			}

			// Calcula el valor total de estudiantes
			var grantotal =  _.reduce(this.data, function(memo,d) {
					return memo+parseInt(d.estudiantes)
				},0);

			// Genera nodos para gráfico de barras con distribución de estudiantes según categorías
			var nodesRangoPSU = BarLayout()
				.size([this.width-100,40])
				.grantotal(grantotal)
				.sortvalue(sortvalueRangoPSU)
				.category("rangopsu")
				.nodes(this.data);

			// Genera nodos para gráfico de barras con distribución de estudiantes según categorías
			var nodesRangoPSUQ1 = BarLayout()
				.size([this.width-100,40])
				.grantotal(grantotal)
				.sortvalue(sortvalueRangoPSU)
				.category("rangopsu")
				.nodes(_.filter(this.data, function(d) {return d.QUINTIL == "1"}));

			// Genera nodos para gráfico de barras con distribución de estudiantes según categorías
			var nodesRangoPSUQ2 = BarLayout()
				.size([this.width-100,40])
				.grantotal(grantotal)
				.sortvalue(sortvalueRangoPSU)
				.category("rangopsu")
				.nodes(_.filter(this.data, function(d) {return d.QUINTIL == "2"}));

			// Genera nodos para gráfico de barras con distribución de estudiantes según categorías
			var nodesRangoPSUQ3 = BarLayout()
				.size([this.width-100,40])
				.grantotal(grantotal)
				.sortvalue(sortvalueRangoPSU)
				.category("rangopsu")
				.nodes(_.filter(this.data, function(d) {return d.QUINTIL == "3"}));

			// Genera nodos para gráfico de barras con distribución de estudiantes según categorías
			var nodesRangoPSUQ3 = BarLayout()
				.size([this.width-100,40])
				.grantotal(grantotal)
				.sortvalue(sortvalueRangoPSU)
				.category("rangopsu")
				.nodes(_.filter(this.data, function(d) {return d.QUINTIL == "3"}));

			// Genera nodos para gráfico de barras con distribución de estudiantes según categorías
			var nodesRangoPSUQ4 = BarLayout()
				.size([this.width-100,40])
				.grantotal(grantotal)
				.sortvalue(sortvalueRangoPSU)
				.category("rangopsu")
				.nodes(_.filter(this.data, function(d) {return d.QUINTIL == "4"}));

			// Genera nodos para gráfico de barras con distribución de estudiantes según categorías
			var nodesRangoPSUQ5 = BarLayout()
				.size([this.width-100,40])
				.grantotal(grantotal)
				.sortvalue(sortvalueRangoPSU)
				.category("rangopsu")
				.nodes(_.filter(this.data, function(d) {return d.QUINTIL == "5"}));


			var nodesDependencia = BarLayout()
				.size([this.width,50])
				.category("dependencia")
				.nodes(this.data);

			var nodesPSU = BarLayout()
				.size([this.width,50])
				.category("psu")
				.nodes(this.data);

			var nodesNEM = BarLayout()
				.size([this.width,50])
				.category("nem")
				.nodes(this.data);

			var nodesTipoIE = BarLayout()
				.size([this.width,50])
				.category("tipo_ie")
				.nodes(this.data);

			var nodesRanking10 = BarLayout()
				.size([this.width,50])
				.category("ranking_10")
				.nodes(this.data);

			var nodesRanking75 = BarLayout()
				.size([this.width,50])
				.category("ranking_75")
				.nodes(this.data);

			var nodesQuintil = BarLayout()
				.size([this.width,50])
				.category("QUINTIL")
				.nodes(this.data);

			this.groups = [
				{titulo: "Puntaje PSU", nodes : nodesRangoPSU },
				{titulo: "Q1", nodes : nodesRangoPSUQ1 },
				{titulo: "Q2", nodes : nodesRangoPSUQ2 },
				{titulo: "Q3", nodes : nodesRangoPSUQ3 },
				{titulo: "Q4", nodes : nodesRangoPSUQ4 },
				{titulo: "Q5", nodes : nodesRangoPSUQ5 },
				{titulo: "Nota Educación Media", nodes : nodesNEM },
				{titulo: "Tipo de Institución Superior en que se matricula", nodes : nodesTipoIE },
				{titulo: "Pertenece al 10% de mejores egresados", nodes : nodesRanking10 },
				{titulo: "Pertenece al 7.5% de mejores egresados", nodes : nodesRanking75 },
				{titulo: "Quintil Socioeconómico", nodes : nodesQuintil }
			];



			//ranking_10	ranking_75	QUINTIL

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

			msg = "<strong>"+d.psukey+" - Quintil : "+d.quintilkey+"</strong>";
			msg += "<br>"+formatMiles(d.value)+" estudiantes";

			// Crea tabla condatos por universidades
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
			
			return msg;
		}, 

		layout1 : function(nodes, xOrigin, width, total, left, right) {
			var map = {};

			_.each(left, function(d,i) {
				map[d] = {};
				map[d].order = -(i+1);
				map[d].nodeIndex = null;
			});

			_.each(right, function(d,i) {
				map[d] = {};
				map[d].order = i;
				map[d].nodeIndex = null;
			});

			_.map(nodes, function(d) {
				d.values = d.value;
				d.value = _.reduce(d.values, function(memo,d) {return +memo+parseInt(d.estudiantes)}, 0);
				d.dx = width*d.value/total;
			});

			_.each(nodes, function(d,i) {
				map[d.key].nodeIndex=i;
				map[d.key].dx = d.dx;
			});

			_.each(right, function(key,i) {
				if (i == 0) {
					x = xOrigin
				} else {
					prevIndex = map[right[i-1]].nodeIndex;
					prevNode = nodes[prevIndex];
					x = prevNode.x + prevNode.dx
				}
				nodes[map[key].nodeIndex].x = x;
			})

			_.each(left, function(key,i) {
				// Verificar que exista un nodo para esta categorría y calcular psoición
				//if (map[left[i]].nodeIndex) {
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
				//}
			})


			return nodes;
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

			var total = _.reduce(this.data, function(memo,d) {return +memo+parseInt(d.estudiantes)}, 0)


			var left = ["Bajo 475"];
			var right = ["475 a 550", "Sobre 550"];
			var quintiles = ["1","2","3","4","5"];

			var xOrigin = 400;
			var width = 800;

			var psuGroupedData = _.groupBy(this.data, function(d) {return d.rangopsu});
			psuGroupedData = d3.entries(psuGroupedData);
			
			// PSUNODES
			this.psunodesdata = this.layout1(psuGroupedData, xOrigin, width, total, left, right);

			_.map(this.psunodesdata, function(d) {
				d.psukey = d.key;
				d.quintilkey = "Todos";
				d.pos1 = {};
				d.pos1.x = d.x;
				d.pos1.dx = d.dx
			})

			// Genera mapa con subnodos nodeMapPSUQuintil["Bajo 475"]["1"] = arreglo con nodos de Bajo 475 Q1
			var nodeMapPSUQuintil = {};
			_.each(this.psunodesdata, function(psunode) {
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

				var quintilnodes = self.layout1(subdata,localxOrigin,width, total, left, right );


				// Almacena datos de posición en objeto pos1 y registra claves de psu & quintil
				_.map(quintilnodes, function(node) {
					node.pos1 = {}
					node.pos1.x = node.x;
					node.pos1.dx = node.dx;
					node.psukey = psukey;
					node.quintilkey = node.key;
				})

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

			//NODESPSUQUINTIL
			this.nodespsuquintil = [];

			_.each(d3.entries(nodeMapPSUQuintil), function(subnodePSU) {
				_.each(d3.entries(subnodePSU.value), function(subnodeQuintil) {
					self.nodespsuquintil = _.union(self.nodespsuquintil, subnodeQuintil.value);
				})
			})


			

			//mynodes = nodespsuquintil;
			mynodes = this.psunodesdata;

			this.PosY = {
				"0" : 50,
				"1" : 50,
				"2" : 100,
				"3" : 150,
				"4" : 200,
				"5" : 250
			}

			this.DY = 40,


			this.mainDiv = d3.select(this.el).append("div")
					.style("position", "relative")
			    	.style("height", self.height + "px")
			    	.style("width", self.width + "px")

			d3.select("body")
				.on("click", this.toggle)


			this.showpsunodes(this.psunodesdata);

			//this.showquintilnodes(nodespsuquintil);


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
					.style("left", function(d) { return 0 + "px"; })
					.style("top", function(d) { return self.PosY[d.quintil] + "px"; })
					.text(function(d) {return d.label}) 




			this.visiblePorQuintiles = false;




		},

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
		  		.call(position0)
				.style("background", function(d) { return self.color(d.psukey) })
				.text(function(d) { return d.key; })
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
			      .style("top", function(d) { return self.PosY[0] + "px"; })
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
					.style("background", function(d) { return self.color(d.psukey) })
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
			      .style("top", function(d) { return self.PosY[0] + "px"; })
			      .style("width", function(d) { return d.pos1.dx + "px"; })
			      .style("height", function(d) { return 30 + "px"; });
			}
		
			function position2() {
			  this.style("left", function(d) { return d.pos2.x + "px"; })
			      .style("top", function(d) { return self.PosY[d.quintilkey] + "px"; })
			      .style("width", function(d) { return d.pos2.dx + "px"; })
			      .style("height", function(d) { return 30 + "px"; });
			}


		}


	});
  
  return Visualizador;
});

