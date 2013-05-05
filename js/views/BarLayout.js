define([
  'underscore',
  'd3',
	], function(_, d3){

		var BarLayout = function() {
			var layout = {};
			var size = [1,1];
			var width = 0;
			var category = "";
			var valueAttribute = "estudiantes";
			var nodes = [];
			var grantotal = null;
	

			layout.size = function(_) {
				if (!arguments.length) return size;
				size = _;
				return layout;
			}

			layout.grantotal = function(_) {
				if (!arguments.length) return grantotal;
				grantotal = _;
				return layout;
			}

			layout.category = function(_) {
				if (!arguments.length) return category;
				category = _;
				return layout;
			}

			layout.sortvalue = function(_) {
				sortvalue = _
				return layout;
			}

			sortvalue = function(d) {
				return d.key
			}

			layout.nodes = function(_arg_) {
				if (!arguments.length) return nodes;
				data = _arg_;

				var width = size[0];
				var height = size[1];

				var groupedObject = groupData(data);
				var groupedArray = d3.entries(groupedObject);
				var sortedArray = _.sortBy(groupedArray, function(d) {return sortvalue(d)});

				// total size se utiliza para calcular la proporcion de los tamaños en base
				// al calor de cada nodo.  
				// Si no se define grantotal, se utiliza la suma de los valores de los nodos (totalize) como universo
				var totalsize = grantotal ? grantotal : totalize(data);

				var nextX = 0; //valor de posición X del siguiente nodo
				nodes = sortedArray.map(function(d) {
						d.value = totalize(d.value);
						d.dx=width*d.value/totalsize;
						d.dy=height;
						d.x=nextX;
						d.y=0;
						nextX=d.x+d.dx;
						return d}
					);

				

				return nodes;
			}

			totalize = function(data) {
				var result = _.reduce(data, function(memo,d) {
					return memo+parseInt(d[valueAttribute])
				},0);	
				return result;
			}

			groupData = function(data) {
				var result = _.groupBy(data, function(d) {
					return d[category]}
				);

				return result;
			}

			return layout;
		};
  
  return BarLayout;
});

