# What's Your British Name?

The code and methodology for determining the across-the-pond equivalent of American and British names.

## Percents

First, we need the percentage for each name for each year, using `calculate_percents.js`:

	node calculate_percents.js

The script does this by reading the raw name data and the data on the total number of babies born per year and running these calculations, which are written to `percentages/American_F.csv`, etc. The values are spot-checked for accuracy. The raw data comes from the [babynames repo](https://github.com/TimeMagazine/babynames).

## Matching names

To generate the matches, run `match_names.js` with a flag for which nationality you want to translate:

	node match_names.js --American
	node match_names.js --British

## How it works

Each name from one country is compared to every name from the other country. Names are compared with the function `similarity` by taking the sum of the square of the difference in percentage for each year. The winning name is the name from the other country that results in the lowest value for this similarity metric, meaning the two names have the smallest difference in percentages from year to year.