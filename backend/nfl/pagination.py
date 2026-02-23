from rest_framework.pagination import PageNumberPagination


class PlayerGameStatsMatchupsPagination(PageNumberPagination):
    page_size = 50
