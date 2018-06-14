

class Precinct(object):
    def __init__(self, district, precinct_id, name, county, total, unique_key):
        """ This is a constructor"""
        self.unique_key = unique_key
        self.name = name
        self.NAME10 = county + ' County Precinct '+ str(precinct_id)
        self.id = precinct_id
        self.county = county
        self.rep = {}
        self.dem = {}
        self.all = {}
        self.total = total
        self.district = district
        self.uscong_dis = district

    def finish(self):
        temp1 = [self.all[key] for key in self.all if key == 'rep']
        if len(temp1) > 0:
            self.rep = temp1[0]
        temp1 = [self.all[key] for key in self.all if key == 'dem']
        if len(temp1) > 0:
            self.dem = temp1[0]
        if hasattr(self, 'unique_key'):
            delattr(self, 'unique_key')
