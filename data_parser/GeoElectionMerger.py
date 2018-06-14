
import os
import json
import ijson

party_names = ['rep','dem']


class GeoElectionMerger(object):
    def __init__(self, configuration, path, relevant_districts, data):
        self.relevant_districts = relevant_districts
        self.inputElectionFile = os.path.abspath(os.pardir) + os.path.join(path,configuration.get('GEO_DATA', 'election_input'))
        self.inputGeoFile = os.path.abspath(os.pardir) + os.path.join(path,configuration.get('GEO_DATA', 'geo_input'))
        self.electionData = data
        self.number_merge_attrs = json.loads(configuration.get('GEO_DATA', 'number_merge_attrs'))
        if not self.electionData:
            json_file = open(self.inputElectionFile)
            json_str = json_file.read()
            self.electionData = json.loads(json_str)
        self.outputFile = os.path.abspath(os.pardir) + os.path.join(path,configuration.get('GEO_DATA', 'geo_output'))
        self.__data = []
        self.configuration = configuration
        self.is_to_save_in_memory = True

    def merge(self):
        if self.is_to_save_in_memory:
            self.merge_in_memory()
        else:
            # Not implemented
            self.merge_as_stream()
        with open(self.outputFile, 'w') as fp:
            json.dump(self.__data, fp)

    @property
    def data(self):
        return self.__data

    def is_the_same_precinct(self, geo_feature, election_elem):
        is_the_same = True
        for and_index in range(0, self.number_merge_attrs):
            geo_attrs = self.configuration.get('GEO_DATA', 'merge_attr'+str(and_index)+'_geo').split(',')
            data_attrs = self.configuration.get('GEO_DATA', 'merge_attr'+str(and_index)+'_election').split(',')
            is_the_same_clause = False
            # print(len(geo_attrs))
            # print(geo_attrs)
            # print(data_attrs)
            for index in range(0, len(geo_attrs)):
                geo_attr = geo_attrs[index]
                data_attr = data_attrs[index]
                is_the_same_clause = (is_the_same_clause or str(geo_feature[geo_attr]).lower() == str(election_elem[data_attr]).lower())
            is_the_same = (is_the_same and is_the_same_clause)
        return is_the_same

    def election_contains(self, feature):
        election_elements = [electionElem for electionElem in self.electionData if
                             self.is_the_same_precinct(feature['properties'], electionElem)
                            ]
        if len(election_elements) > 0:
            feature['properties'].update(election_elements[0])
        return len(election_elements) > 0

    @staticmethod
    def add_id(elem, index):
        if elem and elem['properties']:
            elem['properties'].update({'entryId': index})
        else:
            print('Wrong element supplied to add_id()')
            print(str(elem) + ' ' + str(index))
        return elem

    def merge_in_memory(self):
        json_file = open(self.inputGeoFile)
        json_str = json_file.read()
        geo_json = json.loads(json_str)
        print('There were '+str(len(geo_json['features']))+' features')
        geo_json['features'][:] = [feature for feature in geo_json['features'] if self.election_contains(feature)]
        geo_json['features'][:] = [GeoElectionMerger.add_id(elem, index) for index, elem in enumerate(geo_json['features'])]
        print('Now there are '+str(len(geo_json['features']))+' features')
        print('There should be ' + str(len(self.electionData)) + ' features')
        self.__data = geo_json

    @staticmethod
    def get_feature(elem, features):
        features_match = [feature for feature in features if
                         (((feature['properties']['PRECNAME'] and elem['name'].lower() ==
                            feature['properties']['PRECNAME'].lower())
                             or (feature['properties']['PRECCODE'] and (elem['id'] ==
                                                                        str(feature['properties']['PRECCODE'])))
                             )
                             and
                             elem['county'] == feature['properties']['COUNTYCODE'])
                             and 'NAME10' not in feature['properties'].keys()
                         ]
        if len(features_match) == 1:
            features_match[0]['properties'].update(elem)
            return features_match[0]
        elif len(features_match) == 0:
            print('Missing feature for '+str(elem))
        else:
            print('Unexpectable behaviour')

    def inverse_merge(self):
        json_file = open(self.inputGeoFile)
        json_str = json_file.read()
        geo_json = json.loads(json_str)
        features = [GeoElectionMerger.get_feature(elem, geo_json['features']) for elem in self.electionData]
        print('There were '+str(len(geo_json['features']))+' features')
        geo_json['features'][:] = features
        geo_json['features'][:] = [GeoElectionMerger.add_id(elem, index) for index, elem in enumerate(geo_json['features'])]
        print('Now there are '+str(len(geo_json['features']))+' features')
        print('There should be ' + str(len(self.electionData)) + ' features')
        self.__data = geo_json

    def merge_as_stream(self):
        # Not implemented
        geojson_file = open(self.inputGeoFile)
        features = ijson.items(geojson_file, 'features.item')
        cur_features = (feature for feature in features if feature['properties']['PRECNAME'].lower() == 'sauk')
        for cur_feature in cur_features:
            print(cur_feature['properties'])

    @property
    def data(self):
        return self.__data


