# Social Choice Lab

**Consists from 3 projects:**
1. [Data Parser](data_parser/)
2. [Neighbours Finder + Algorithm](algorithm/)
3. [Web application](web_app)

If you want to generate data from some new state/set of districts:
1. Find geo json and election data of the desired state
   - the best place to look from geojson is [elections repo](https://github.com/nvkelso/election-geodata)
   - election results by precincts can be found in site of th state
   - sometimes you will find geojson with the election data inside in this case the only thing you should do is organize the data inside geojson
2. Merge geojson and election data or organize the geojson to contain the following attributes:
	For each precinct (for every i in geojson.features[i].properties)
	* field uscong_dis - district
	* field NAME10 - name of the precinct in format '<County name> County Precinct <Precinct name>'
	* field rep - contains the [election object](#election_object)
	* field dem - contains the [election object](#election_object)
	* field total - total number of votes in precinct
	* field entryId - is an identification number of precinct in the features array (i.e ``` geoJson.features[j].entryId = j``` )
   - The result of this step is redy geojson with election data
2. For each feature in geojson (precinct) find the list of it's neighboring precincts - with [Neighbours Finder + Algorithm](algorithm/).
3. Exectute an algorithm - with with [Neighbours Fainder + Algorithm](algorithm/) project.
4. Visualize your results with [Web application](web_app)

<a id="election_object"></a>
``` 
{
candidate: <candidate name> ,// optional
party_name: <rep or dem>,
votes: <number of votes for this candidate>,
}
```