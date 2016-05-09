// https://github.com/veltman/principles


var matList = Object.keys(refractiveIndicesData);

// Initialize the film object:
// specifies film materials, thickness (nm) and order
var sample = {
	matI: "Air",
	matF: "Silicon",
	films: [
	{
		mat: "SiO2",
		d: 0.5
	}]
};

// theta control
var theta = 0;
d3.select("#thetaDisplay").data(theta).text(function(){ return theta; });


// Initialize the film control
var columnNames = ["Order", "Material", "Thickness (nm)", "Slide Me!", "Remove"];

var table, thead, tbody, rows, cells;



// -- append the first and last material controllers  --------------------------------------------------
d3.select("#matIselect")
	.selectAll("option").data(matList)
	.enter().append("option")
		.each(function(v){
			console.log(v);
			if (v === sample.matI) {
				d3.select(this).attr("selected", "selected");
			}
		}).text(function(v){return v;});

d3.select("#matFselect")
	.selectAll("option").data(matList)
	.enter().append("option")
		.each(function(v){
			console.log(v);
			if (v === sample.matF) {
				d3.select(this).attr("selected", "selected");
			}
		}).text(function(v){return v;});

// -- append the table of films --------------------------------------------------
table = d3.select("#filmControl").append("table");

thead = table.append("thead");
tbody = table.append("tbody").attr("id", "tbody");

//headers - we just need one 'tr' so we don't have to bother with data binding.
thead.append("tr").selectAll("th")
	.data(columnNames)
	.enter().append("th").text(function(column){ return column;});

// Plot everything -----------------------------------------------------------------
var R = [];
var T = [];
var lambda = [];
var lambdaBounds = {
	start: 0.45,
	end: 0.8
};

// define dimensions of graph
var m = [80, 80, 80, 80]; // margins
var w = 480 - m[1] - m[3]; // width
var h = 400 - m[0] - m[2]; // height

// X scale will fit all values from data[] within pixels 0-w
var xDomain = [lambdaBounds.start, lambdaBounds.end];
var x = d3.scale.linear().domain(xDomain).range([0,w]); 

// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
var y = d3.scale.linear().domain([0, 1]).range([h, 0]);
	// automatically determining max range can work something like this
	// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

// create a line function that can convert data[] into x and y points
var Rline = d3.svg.line()
	.x(function(d,i) {
		return x(lambda[i]);
	})
	.y(function(d) {
		return y(d);
	});

// Add an SVG element with the desired dimensions and margin.
var graph = d3.select("#graph").append("svg")
	.attr("width", w + m[1] + m[3])
	.attr("height", h + m[0] + m[2])
    .append("g")
	.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

// xAxis
var xAxis = d3.svg.axis().scale(x).ticks(4).orient("down");
// Add the x-axis.
graph.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + h + ")")
	.call(xAxis);

// yAxis
var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
// Add the y-axis to the left
graph.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(-25,0)")
	.call(yAxisLeft);

// create x-axis label
graph.append("text")
	.attr("class", "axis-title")
	.attr("x", x( (lambdaBounds.end-lambdaBounds.start)/2 + lambdaBounds.start ) )
	.attr("dx", "-5em")
	.attr("y", y(-0.2))
	.text("Wavelength, microns");

// y-axis label
graph.append("text")
	.attr("class", "axis-title")
	.attr("y", y(1))
	.attr("dy", ".71em")
	.text("Reflectivity")
	.attr("id", "refLabel");


// the data line itself
graph.append("path")
	.attr("class", "line")
	.attr("clip-path","url(#clip)")
	.attr("d", Rline(R));


// updaters -----------------------------------------------------------

function update(){
	
	// calculate the reflectivity
	data = measureFilm(sample, theta*2*Math.PI/180, lambdaBounds.start, lambdaBounds.end);
	lambda = data.lambda;
	R = data.R;

	// update the graph
	graph.select(".line").attr("d", Rline(R));

	// update the displayed thicknesses in the filmctrl
	var filmctrl = d3.selectAll(".filmCtrl").select(".dDisplay")
		.text(function(film){ return film.d*1000; });

	// update the row data
	var rows = d3.select("#tbody").selectAll("tr").data(sample.films);
	// add new rows
	var newRows = rows.enter().append("tr")
		.attr("class", "filmCtrl")
		.attr("id", function(row) {
			return "r" + sample.films.indexOf(row);
		});
	// add the material ordinal
	newRows.append("td")
		.text(function(row){
			console.log(row);
			return sample.films.indexOf(row)+1;
		});
	// add the material selector
	newRows.append("td").append("select")
		.attr("class","matSelect")
		.selectAll("option").data(matList)
			.enter().append("option")
				.each(function (v){
					if (d3.select(this).node().parentNode.__data__.mat === v){
						d3.select(this).attr("selected", "selected");
					}
				})
				.text(function(v){return v;});
	// add the text thickness indicator
	newRows.append("td")
		.attr("class", "dDisplay")
		.text(function(row){
			return row.d*1000;
		});
	// add the range thingy
	newRows.append("td")
		.append("input")
			.attr("type","range")
			.attr("min", "0")
			.attr("max", "1000")
			.attr("class", "filmSlider")
			.attr("id", function(row){
				return "slider" + sample.films.indexOf(row);
			})
			.attr("value", function(row){
				return row.d*1000;
			});
	// add the delete button
	newRows.append("td")
	.append("button")
		.attr("class","rmFilm")
		.text("✖");
	
	// remove extra rows
	rows.exit().remove();

	// update theta display
	d3.select("#thetaDisplay").text(function(){ return theta; });


	// update the listeners
	d3.selectAll(".filmSlider").on("input", function() {
		// make the sample object
		console.log("Sliding!");
		sample.films[this.id.slice(-1)].d = this.value/1000;
		update();
	});
	d3.select("#thetaSlider").on("input", function() {
		// update theta
		theta = this.value;
		update();
	});

	d3.selectAll(".matSelect").on("change", function(){
		//which film am I
		var myIdx = sample.films.indexOf(d3.select(this).node().parentNode.__data__);
		// use that to find the selected value. Ugh. 
		var mySelection = d3.select(this).property('selectedIndex');
		sample.films[myIdx].mat = matList[mySelection];
		update();
	});

	d3.selectAll(".rmFilm").on("click", function(){
		var myIdx = sample.films.indexOf(d3.select(this).node().parentNode.__data__);
		sample.films.splice(myIdx,1);
		update();
	});

	d3.selectAll(".bulkSelector").on("change", function(){
		var mySelection = d3.select(this).property("selectedIndex");
		sample.matI = matList[mySelection];
		update();
	});

	d3.select("#addFilm").on("click", function(){
		sample.films.push({
			mat: matList[0],
			d: 0.5
		});
		update();
	});


}

update();
// Schematic -----------------------------------------------------------
var schem = d3.select("#schematic").append("svg");
