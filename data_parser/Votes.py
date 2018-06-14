
class Votes(object):

    def __init__(self, party_name, candidate, votes):
        """ This is a constructor"""
        self.party_name = party_name
        self.candidate = candidate
        self.votes = votes

    def update_entry(self, votes):
        self.votes += votes
