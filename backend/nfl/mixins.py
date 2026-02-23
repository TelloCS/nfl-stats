from django.core.cache import cache


class KeyBasedCacheMixin:
    cache_timeout = 60 * 60

    def get_cache_key(self, request):
        raise NotImplementedError("View must implement get_cache_key(request)")

    def retrieve_from_cache(self, request):
        key = self.get_cache_key(request)
        return cache.get(key)

    def store_in_cache(self, request, data):
        key = self.get_cache_key(request)
        cache.set(key, data, self.cache_timeout)
