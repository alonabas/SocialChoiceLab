import sys
import ConfigParser
import json
import importlib


def main():
    config_file = None
    if len(sys.argv) > 1:
        config_file = sys.argv[1]
    config = ConfigParser.ConfigParser()
    config.read(config_file)
    path = config.get('DEFAULT', 'default_path')
    relevant_districts = map(int, config.get('DEFAULT', 'relevant_districts').split(','))
    is_parse_election_data = json.loads(config.get('ELECTION_DATA', 'is_parse_election_data'))
    data = None
    if is_parse_election_data:
        module_name = config.get('ELECTION_DATA', 'python_file')
        module = importlib.import_module(module_name, package=None)
        class_from_module = getattr(module, 'ElectionDataParser')
        parser = class_from_module(config, path, relevant_districts)
        parser.parse_all()

    is_merge_election_geo = json.loads(config.get('GEO_DATA', 'is_merge_election_geo'))
    if is_merge_election_geo:
        module_name = config.get('GEO_DATA', 'python_file')
        module = importlib.import_module(module_name, package=None)
        class_from_module = getattr(module, 'GeoElectionMerger')
        merger = class_from_module(config, path, relevant_districts, data)
        merger.merge()

    is_to_organize_geo_json = json.loads(config.get('ORGANIZE_DATA', 'is_to_organize_geo_json'))
    if is_to_organize_geo_json:
        module_name = config.get('GEO_DATA', 'python_file')
        module = importlib.import_module(module_name, package=None)
        class_from_module = getattr(module, 'GeoJsonOrganizer')
        organizer = class_from_module(config, path, relevant_districts)
        organizer.organize()


if __name__ == "__main__": main()
