var d3 = require("d3");
var fs = require("fs");
var dsv = require("d3-dsv");
var argv = require('minimist')(process.argv.slice(2));
var ProgressBar = require('progress');

var roster_american = [],
	roster_british = [];

var americans = require("./percentages/americans_percent.json");
var american_men = {};
var american_women = {};

// eliminate uncommon names -- those that appeared fewer than 50 times in 2015 (US) or 20 times (UK)

console.log("Total American names:", Object.keys(americans).length);

Object.keys(americans).forEach(function(name_gender) {
	var max = 0, min = Infinity;
	for (var y = 1996; y <= 2015; y += 1) {
		var v = americans[name_gender][y].total;
		if (v > max) {
			max = v;
		}
		if (v < min) {
			min = v;
		}
	}

	if (max >= 50) {
		roster_american.push(name_gender);
	}
});

// divide by gender
Object.keys(americans).forEach(function(name_gender) {
	if (/_M$/.test(name_gender)) {
		american_men[name_gender] = americans[name_gender];
	} else {
		american_women[name_gender] = americans[name_gender];
	}
});

console.log("Total prominent American names:", roster_american.length);
console.log("Total American male names:", Object.keys(american_men).length);
console.log("Total American female names:", Object.keys(american_women).length);

var british = require("./percentages/british_percent.json");
var british_men = {};
var british_women = {};

console.log("Total British names:", Object.keys(british).length);

Object.keys(british).forEach(function(name_gender) {
	var max = 0, min = Infinity;
	for (var y = 1996; y <= 2015; y += 1) {
		var v = british[name_gender][y].total;
		if (v > max) {
			max = v;
		}
		if (v < min) {
			min = v;
		}
	}

	//console.log(name_gender, min, max);

	if (max >= 20) {
		roster_british.push(name_gender);
	}	
});


// divide by gender
Object.keys(british).forEach(function(name_gender) {
	if (/_M$/.test(name_gender)) {
		british_men[name_gender] = british[name_gender];
	} else {
		british_women[name_gender] = british[name_gender];
	}
});

console.log("Total prominent British names:", roster_british.length);
console.log("Total British male names:", Object.keys(british_men).length);
console.log("Total British female names:", Object.keys(british_women).length);

// see how common two names are: An American name and a British name. This is just a total of the square of each difference by year
function similarity(nameA, nameB, gender) {
	// console.log(nameA, nameB, gender);
	if (gender == "F") {
		dataA = american_women[nameA + "_F"];
		dataB = british_women[nameB + "_F"];
	} else {
		dataA = american_men[nameA + "_M"];
		dataB = british_men[nameB + "_M"];
	}

	var total = 0;

	for (var y = 1996; y <= 2015; y += 1) {
		var diff = dataA[y].percent - dataB[y].percent;
		total += Math.pow(diff, 2);
	}

	return total;
}

// for an American name, find the closest British name
function findClosestBrit(name, gender) {
	var minimum = 1000,
		closest;

	if (gender == "M") {
		var comparison = british_men;
	} else {
		var comparison = british_women;
	}

	Object.keys(comparison).forEach(function(british_name) {
		var t = similarity(name, british_name.split("_")[0], gender);
		if (t < minimum) {
			minimum = t;
			closest = british_name;
		} 
	});

	return closest;
}

// for a British name, find the closest American name
function findClosestAmerican(name, gender, diff_type) {
	var minimum = 1000,
		closest;

	if (gender == "M") {
		var comparison = american_men;
	} else {
		var comparison = american_women;
	}

	Object.keys(comparison).forEach(function(american_name) {
		var t = similarity(american_name.split("_")[0], name, gender);
		if (t < minimum) {
			minimum = t;
			closest = american_name;
		} 
	});

	return closest;
}

function AmericanToBritish() {
	var csv = [];
	var bar = new ProgressBar(':bar :current/:total (:percent %)', { total: roster_american.length, width: 50 });

	// AMERICANS
	roster_american.forEach(function(name_gender, count) {
		var name = name_gender.split("_")[0];
		var gender = name_gender.split("_")[1];

		var closest = findClosestBrit(name, gender);
		//console.log("American", name_gender, closest, count);

		var data = {
			american: americans[name_gender],
			british: british[closest],
			british_name: closest
		};

		fs.writeFileSync("names/American/" + name_gender + ".json", JSON.stringify(data, null, 2));
		csv.push({
			American: name_gender,
			British: closest
		});
		bar.tick();
	});

	fs.writeFileSync("roster_american.json", JSON.stringify(roster_american, null, 2));
	fs.writeFileSync("results_american.csv", dsv.csvFormat(csv));
}

function BritishToAmerican() {
	var csv = [];
	var bar = new ProgressBar(':bar :current/:total (:percent %)', { total: roster_british.length, width: 50 });	

	// BRITISH
	roster_british.forEach(function(name_gender, count) {
		var name = name_gender.split("_")[0];
		var gender = name_gender.split("_")[1];

		var closest = findClosestAmerican(name, gender);
		//console.log("Brit", name_gender, closest, count);

		var data = {
			american: americans[closest],
			british: british[name_gender],
			american_name: closest
		};

		fs.writeFileSync("names/British/" + name_gender + ".json", JSON.stringify(data, null, 2));
		csv.push({
			British: name_gender,
			American: closest
		});
		bar.tick();
	});

	fs.writeFileSync("roster_british.json", JSON.stringify(roster_british, null, 2));
	fs.writeFileSync("results_british.csv", dsv.csvFormat(csv));	
}

if (argv.American) {
	AmericanToBritish();
}

if (argv.British) {
	BritishToAmerican();	
}

