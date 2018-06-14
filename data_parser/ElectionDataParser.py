
import os
import csv
import json
import re
from Precinct import Precinct
from Votes import Votes

party_names = ['rep','dem']


def to_json(obj):
    return obj.__dict__


class ElectionDataParser(object):
    def __init__(self, configuration, path, relevant_districts):
        self.configuration = configuration
        self.path = path
        self.relevant_districts = relevant_districts
        self.outputFile = os.path.abspath(os.pardir) + os.path.join(path,configuration.get('DATA_OUT', 'output_file'))
        self.district_field_in = 'district_field_in'
        self.county_field_in = 'county_field_in'
        self.precinct_name_field_in = 'precinct_name_field_in'
        self.precinct_id_field_in = 'precinct_id_field_in'
        self.candidate_field_in = 'candidate_field_in'
        self.party_field_in = 'party_field_in'
        self.votes_field_in = 'votes_field_in'
        candidate_to_party_mapping_file = os.path.abspath(os.pardir) + os.path.join(path, configuration.get('ELECTION_DATA', 'candidate_party_map'))
        fp = open(candidate_to_party_mapping_file)
        self.candidate_to_party_map = dict((rows[0], rows[1]) for rows in csv.reader(fp.read().splitlines()))
        self.__data = []

    def parse_all(self):
        is_multiple_data_files = json.loads(self.configuration.get('ELECTION_DATA', 'is_multiple_data_files'))
        if is_multiple_data_files:
            count = json.loads(self.configuration.get('ELECTION_DATA', 'count'))
            for i in range(count):
                data_format = self.configuration.get('DATA_IN_'+str(i), 'format')
                if data_format == 'csv':
                    self.parse_as_csv(i)
                else:
                    pass
        for dist in self.relevant_districts:
            dist_date = [elem for elem in self.data if elem.district == dist]
            print('Dist '+str(dist)+' has' + str(len(dist_date)) + ' precincts')

        with open(self.outputFile, 'w') as fp:
            json.dump(self.data, fp, sort_keys=True, default=to_json, indent=4, separators=(',', ': '))
        return self.data

    @property
    def data(self):
        return self.__data

    def get_value_of_attr(self, header, row, attr_name, id):
        try:
            attr = self.configuration.get('DATA_IN_' + str(id), attr_name)
            index = header.index(attr)
            return row[index]
        except Exception:
            return -1

    def get_party_by_candidate_name(self, candidate_name):
        if candidate_name in self.candidate_to_party_map:
            party = self.candidate_to_party_map[candidate_name]
        else:
            party = 'none'
        return party.lower()

    def filter(self, data, id, attribute):
        try:
            match = self.configuration.get('DATA_IN_' + str(id), attribute + '_match')
            if match:
                if str(data).startswith(match):
                    return True
                else:
                    return False
        except Exception:
            pass
        try:
            attr_val_avoid = self.configuration.get('DATA_IN_' + str(id), attribute + '_filter_negative')
            if attr_val_avoid:
                attr_val_avoid = attr_val_avoid.split(',')
                if str(data) in attr_val_avoid:
                    return False
                else:
                    return True
        except Exception:
            pass
        try:
            attr_val_match = self.configuration.get('DATA_IN_' + str(id), attribute + '_filter').split(',')
            if attr_val_match:
                attr_val_match = attr_val_match.split(',')
                if str(data) in attr_val_match:
                    return False
                else:
                    return False
            return True
        except Exception:
            pass
        return True

    @staticmethod
    def get_unique_key(county, precinct_id, district):
        return county + '_' + str(precinct_id) + '_' + str(district)

    def parse_as_csv(self, id):
        try:
            file_name = os.path.abspath(os.pardir) + os.path.join(self.path, self.configuration.get('DATA_IN_'+str(id), 'file_name'))
            fp = open(file_name)
            reader = csv.reader(fp, delimiter=',')
            header = reader.next()
            precinct_cur = 0
            count = 0
            for row in reader:
                district = self.get_value_of_attr(header, row, self.district_field_in, id)
                if not self.filter(district, id, self.district_field_in):
                    continue
                district = re.findall(r'\d+', district)
                if len(district) == 0:
                    continue
                district = int(district[0])
                if len(self.relevant_districts) > 0 and district not in self.relevant_districts:
                    continue
                precinct_id = self.get_value_of_attr(header, row, self.precinct_id_field_in, id)
                if not self.filter(precinct_id, id, self.precinct_id_field_in):
                    continue
                if precinct_id != precinct_cur:
                    precinct_cur = precinct_id
                    count += 1
                county = self.get_value_of_attr(header, row, self.county_field_in, id)
                if county == -1:
                    county = self.configuration.get('DATA_IN_' + str(id), 'county_code')
                if not self.filter(county, id, self.county_field_in):
                    continue
                precinct_name = self.get_value_of_attr(header, row, self.precinct_name_field_in, id)
                if not self.filter(precinct_name, id, self.precinct_name_field_in):
                    continue
                if precinct_name == -1:
                    precinct_name = precinct_id
                unique_key = ElectionDataParser.get_unique_key(county, precinct_id, district)
                candidate = self.get_value_of_attr(header, row, self.candidate_field_in, id)
                if not self.filter(candidate, id, self.candidate_field_in):
                    continue
                party = self.get_value_of_attr(header, row, self.party_field_in, id)
                if party == -1:
                    party = self.get_party_by_candidate_name(candidate)
                if not self.filter(party, id, self.party_field_in):
                    continue
                party = party.lower()
                votes = int(self.get_value_of_attr(header, row, self.votes_field_in, id))
                if party in party_names:
                    self.create_record(district, precinct_id, precinct_name, votes, party, county, candidate, unique_key)
                self.update_all_record(district, precinct_id, precinct_name, votes, county, unique_key)

        finally:
            [elem.finish() for elem in self.data]
            fp.close()

    def finish_precinct(self, unique_key):
        [(precinct_data.finish()) for precinct_data in self.data if hasattr(precinct_data, 'unique_key') and precinct_data.unique_key == unique_key]

    def create_record(self, district, precinct_id, precinct_name, votes, party,county, candidate, unique_key):
        data = Votes(party, candidate, votes)
        if unique_key and any((hasattr(precinct_data, 'unique_key') and precinct_data.unique_key == unique_key) for precinct_data in self.data):
            [(precinct_data.all.update({party:data}) if party not in precinct_data.all.keys() else precinct_data.all[party].update_entry(votes)) for precinct_data in self.data if (hasattr(precinct_data, 'unique_key') and precinct_data.unique_key == unique_key)]
        else:
            precinct_data = Precinct(district, precinct_id, precinct_name, county, 0,unique_key)
            precinct_data.all[party] = data
            self.data.append(precinct_data)
        return unique_key

    def update_all_record(self, district, precinct_id, precinct_name, votes, county, unique_key):
        if unique_key and any((hasattr(precinct_data, 'unique_key') and precinct_data.unique_key == unique_key) for precinct_data in self.data):
            [setattr(precinct_data, 'total', precinct_data.total + votes) for precinct_data in self.data if (hasattr(precinct_data, 'unique_key') and precinct_data.unique_key == unique_key)]
        else:
            precinct_data = Precinct(district, precinct_id, precinct_name, county, votes, unique_key)
            self.data.append(precinct_data)
        return unique_key
