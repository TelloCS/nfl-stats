from django.core.cache import cache
from django.utils.cache import patch_cache_control


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

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)

        if request.method == 'GET' and response.status_code == 200:
            patch_cache_control(response, public=True, max_age=self.cache_timeout)
        return response
