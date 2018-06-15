# Social Choice Lab: Project 1 
**Data Parser**

## Project description:
- Python project u
- Parse provided election data file
- Merges data file with provided geojson file, one can configure merge attributes.

## Steps:
1. Install python and pip
2. ``` pip install -r requirements.txt ```
3. Change the [config file](defaults.cfg) with your data or create a new one. 
4. Run ```  python main.py config.cfg ``` you can use existing [configuration files](/config) instead of config.cfg
5. For completely new state you may want to define you own python file that will do parsing and merge and then just add it in the config file under ORGANIZE_DATA section with your parameters 
