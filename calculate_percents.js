var fs = require("fs");
var d3 = require("d3");

// AMERICANS

american_totals_by_year = {};

d3.csvParse(fs.readFileSync("./data/american_totals.csv", "UTF-8")).forEach(total => {
	american_totals_by_year[total.year] = total;
});

// total number of names by year
var americans = d3.csvParse(fs.readFileSync("./data/american.csv", "UTF-8"));

var american_percents = {};
var american_F = "name,gender,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015\n";
var american_M = "name,gender,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015\n";

americans.forEach(name => {
	var slug = name.name + "_" + name.gender;
	if (slug == "_") {
		console.log("ERROR");
		return;
	}
	american_percents[slug] = {};

	var csv = name.name + "," + (name.gender == "F"? "Female" : "Male");

	for (let year = 1996; year <= 2015; year += 1) {
		var total = name.gender === "F"? american_totals_by_year[year].female : american_totals_by_year[year].male;
		total = parseInt(total);
		//console.log(year, name.name, name.gender, name[year]);
		american_percents[slug][year] = { total: parseInt(name[year]), percent: 100 * parseInt(name[year]) / total };
		csv += "," + american_percents[slug][year].percent
	}

	csv += "\n";

	if (name.gender == "F") {
		american_F += csv;
	} else {
		american_M += csv;
	}
});

fs.writeFileSync("percentages/americans_percent.json", JSON.stringify(american_percents, null, 2));
fs.writeFileSync("percentages/americans_F.csv", american_F);
fs.writeFileSync("percentages/americans_M.csv", american_M);

// British

british_totals_by_year = {};

d3.csvParse(fs.readFileSync("./data/british_totals.csv", "UTF-8")).forEach(total => {
	british_totals_by_year[total.year] = total;
});

// total number of names by year
var british = d3.csvParse(fs.readFileSync("./data/british.csv", "UTF-8"));

var british_percents = {};
var british_F = "name,gender,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015\n";
var british_M = "name,gender,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015\n";

british.forEach(name => {
	var slug = name.name + "_" + name.gender;
	british_percents[slug] = {};

	var csv = name.name + "," + (name.gender == "F"? "Female" : "Male");

	for (let year = 1996; year <= 2015; year += 1) {
		var total = name.gender === "F"? british_totals_by_year[year].female : british_totals_by_year[year].male;
		total = parseInt(total);
		//console.log(year, name.name, name.gender, name[year]);
		british_percents[slug][year] = { total: parseInt(name[year]), percent: 100 * parseInt(name[year]) / total };
		csv += "," + british_percents[slug][year].percent
	}

	csv += "\n";

	if (name.gender == "F") {
		british_F += csv;
	} else {
		british_M += csv;
	}
});

fs.writeFileSync("percentages/british_percent.json", JSON.stringify(british_percents, null, 2));
fs.writeFileSync("percentages/british_F.csv", british_F);
fs.writeFileSync("percentages/british_M.csv", british_M);
