import os
import json
from Votes import Votes

party_names = ['rep','dem']


class GeoJsonOrganizer(object):
    def __init__(self, configuration, path, relevant_districts):
        self.configuration = configuration
        self.path = path
        self.relevant_districts = relevant_districts
        self.input_file = os.path.abspath(os.pardir) + os.path.join(path, configuration.get('ORGANIZE_DATA', 'input'))
        self.output_file = os.path.abspath(os.pardir) + os.path.join(path,configuration.get('ORGANIZE_DATA', 'output'))
        self.district_field_in = configuration.get('ORGANIZE_DATA', 'district_field_in')
        self.county_field_in = configuration.get('ORGANIZE_DATA', 'county_field_in')
        self.county_code_field_in = configuration.get('ORGANIZE_DATA', 'county_code_field_in')
        self.precinct_name_field_in = configuration.get('ORGANIZE_DATA', 'precinct_name_field_in')
        self.precinct_id_field_in = configuration.get('ORGANIZE_DATA', 'precinct_id_field_in')
        self.rep_candidate_votes_field_in = configuration.get('ORGANIZE_DATA', 'rep_candidate_votes_field_in')
        self.dem_candidate_votes_field_in = configuration.get('ORGANIZE_DATA', 'dem_candidate_votes_field_in')
        self.votes_field_in = configuration.get('ORGANIZE_DATA', 'votes_field_in')
        self.__data = []

    def organize(self):
        input_format = self.configuration.get('ORGANIZE_DATA', 'format')
        if input_format == 'json':
            data = self.parse_as_json(self.input_file)
        for dist in self.relevant_districts:
            dist_date = [elem for elem in data['features'] if elem['properties']['uscong_dis'] == dist]
            print('Dist '+str(dist)+' has' + str(len(dist_date)) + ' precincts')
        data['features'] = [elem for elem in data['features'] if elem['properties']['uscong_dis'] in self.relevant_districts]
        data['features'][:] = [GeoJsonOrganizer.add_id(elem, index) for index, elem in enumerate(data['features'])]
        with open(self.output_file, 'w') as fp:
            json.dump(data, fp, sort_keys=True, default=toJSON, indent=4, separators=(',', ': '))
        self.__data = data

    @staticmethod
    def add_id(elem, index):
        if elem and elem['properties']:
            elem['properties'].update({'entryId': index})
        else:
            print('Wrong element supplied to add_id()')
            print(str(elem) + ' '+str(index))
        return elem

    @property
    def data(self):
        return self.__data

    def get_value_of_attr(self, header, row, attr_name):
        try:
            attr = self.configuration.get('ORGANIZE_DATA', attr_name)
            index = header.index(attr)
            return row[index]
        except Exception:
            return -1

    def parse_as_json(self, file_name):
        json_file = open(file_name)
        json_str = json_file.read()
        data = json.loads(json_str)
        for feature in data['features']:
            self.update_record(feature)
        return data

    def update_record(self, record):
        record['properties']['NAME10'] = str(record['properties'][self.county_code_field_in]) + ' County Precinct '+ str(record['properties'][self.precinct_name_field_in])
        rep_data = Votes('rep', '', int(record['properties'][self.rep_candidate_votes_field_in]))
        dem_data = Votes('dem', '', int(record['properties'][self.dem_candidate_votes_field_in]))
        record['properties']['all'] = {'rep': rep_data, 'dem': dem_data}
        record['properties']['rep'] = rep_data
        record['properties']['dem'] = dem_data
        record['properties']['uscong_dis'] = int(record['properties'][self.district_field_in])
        record['properties']['total'] = int(record['properties'][self.votes_field_in])
