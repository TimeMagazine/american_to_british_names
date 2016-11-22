var d3 = require("d3");
var fs = require("fs");
var dsv = require("d3-dsv");

var roster_american = [],
	roster_british = [];

var americans = require("./percentages/americans_percent.json");
var american_men = {};
var american_women = {};

// eliminate uncommon names -- those that appeared fewer than 25 times in 2015

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

//http://mathworld.wolfram.com/Variance.html
function variance(arr) {
	var total = 0;
	arr.forEach(val => {
		total += val;
	});
	var mean = total / arr.length;
	var v = 0;
	arr.forEach(val => {
		v += Math.pow(val - mean, 2)
	});
	return v / arr.length;
}

// see how common two names are, looking for low variance in the differences -- an alternative approach
function similarityVariance(nameA, nameB, gender) {
	if (gender == "F") {
		dataA = american_women[nameA + "_F"];
		dataB = british_women[nameB + "_F"];
	} else {
		dataA = american_men[nameA + "_M"];
		dataB = british_men[nameB + "_M"];
	}

	var diffs = [], squares = 0, percents = 0;

	for (var y = 1996; y <= 2015; y += 1) {
		var diff = dataA[y].percent - dataB[y].percent;
		diffs.push(diff);
		squares += Math.pow(diff, 2);
		var percent = Math.abs(100 - 100 * dataB[y].percent / dataA[y].percent);
		percents += percent;
	}

	percents /= (2016-1996);

	var v = variance(diffs);

	return {
		variance: v,
		least_squares: squares,
		percentage: percents
	};
}

// for an American name, find the closest British name
function findClosestBrit(name, gender) {
	var minimum = 1000,
		variances = [],
		closest;

	if (gender == "M") {
		var comparison = british_men;
	} else {
		var comparison = british_women;
	}

	Object.keys(comparison).forEach(function(british_name) {
		var diff = similarityVariance(name, british_name.split("_")[0], gender);
		diff.name = british_name;
		console.log(diff.name, diff.variance, diff.least_squares, diff.percentage);
		variances.push(diff);
		var t = diff.least_squares;
		if (t < minimum) {
			minimum = t;
			closest = british_name;
		} 
	});

	variances.sort(function(a, b) {
		return a.variance - b.variance;
	});

	variances = variances.slice(0, 50);

	variances.sort(function(a, b) {
		return a.least_squares - b.least_squares;
	});

	return {
		variance: variances[0].name,
		least_squares: closest
	}
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
		if (diff_type == "variance") {
			var t = similarityVariance(american_name.split("_")[0], name, gender);
		} else {
			var t = similarity(american_name.split("_")[0], name, gender);
		}
		if (t < minimum) {
			minimum = t;
			closest = american_name;
		} 
	});

	return closest;
}

function AmericanToBritish() {
	var csv = [];

	// AMERICANS
	roster_american.forEach(function(name_gender, count) {
		var name = name_gender.split("_")[0];
		var gender = name_gender.split("_")[1];

		var match = findClosestBrit(name, gender);
		console.log("American", name_gender, match);

		var data = {
			american: americans[name_gender],
			british: british[match.least_squares],
			british_name: match.least_squares
		};

		fs.writeFileSync("names/American_variance/" + name_gender + ".json", JSON.stringify(data, null, 2));
		csv.push({
			American: name_gender,
			British: match.least_squares
		});
	});

	fs.writeFileSync("roster_american.json", JSON.stringify(roster_american, null, 2));
	fs.writeFileSync("results_american.csv", dsv.csvFormat(csv));
}

function BritishToAmerican(diff_type) {
	var csv = [];

	// BRITISH
	roster_british.forEach(function(name_gender, count) {
		var name = name_gender.split("_")[0];
		var gender = name_gender.split("_")[1];

		var closest = findClosestAmerican(name, gender, diff_type);
		console.log("Brit", name_gender, closest, count);

		var data = {
			american: americans[closest],
			british: british[name_gender],
			american_name: closest
		};

		fs.writeFileSync("names/British/" + name_gender + "_British.json", JSON.stringify(data, null, 2));
		csv.push({
			British: name_gender,
			American: closest
		});		
	});

	fs.writeFileSync("roster_british.json", JSON.stringify(roster_british, null, 2));
	fs.writeFileSync("results_british.csv", dsv.csvFormat(csv));	
}

AmericanToBritish();
BritishToAmerican();

// test variance using http://www.mathsisfun.com/data/standard-deviation.html
// var example = [600, 470, 170, 430, 300];
// console.log(variance(example));

// console.log(findClosestBrit("Lon", "M"));
