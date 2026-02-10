from rest_framework.pagination import PageNumberPagination

# need rename
class PlayerGameStatsMatchupsPagination(PageNumberPagination):
    page_size = 50