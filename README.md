# What's Your British Name?

The code and methodology for determining the across-the-pond equivalent of American and British names.

## Percents

First, we need the percentage for each name for each year. The file `calculate_percents.js` does this by reading the raw name data and the data on the total number of babies born per year and running these calculations, which are written to `percentages/American_F.csv`, etc. The values are spot-checked for accuracy.