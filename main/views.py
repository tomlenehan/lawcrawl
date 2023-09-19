from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.contrib.auth import get_user_model
from lawcrawl import settings
from .models import Case, UploadedFile
import jwt
import json
from functools import wraps


def access_token_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        access_token = request.META.get('HTTP_AUTHORIZATION')  # Get the 'Authorization' header
        if not access_token or not access_token.startswith("Bearer "):
            return JsonResponse({"error": "Access token required"}, status=401)

        access_token = access_token[7:]  # Remove the 'Bearer '

        # fix
        try:
            decoded_token = jwt.decode(access_token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_token["user_id"]
            User = get_user_model()
            user = User.objects.get(pk=user_id)
            request.user = user
        except (jwt.InvalidTokenError, User.DoesNotExist):
            return JsonResponse({"error": "Invalid access token"}, status=401)

        return view_func(request, *args, **kwargs)

    return _wrapped_view


@access_token_required
def upload_file(request):

    decoded_token = jwt.decode(request.access_token, settings.SECRET_KEY, algorithms=["HS256"])
    user_id = decoded_token["user_id"]

    if request.method == "POST" and request.user.is_authenticated:
        file = request.FILES['file']
        case_name = request.POST.get('case_name', None)

        # Handle case creation
        case, created = Case.objects.get_or_create(name=case_name, user=request.user)

        file_name = default_storage.save(file.name, file)  # This will upload the file to S3
        file_url = default_storage.url(file_name)

        # Save the URL in the database
        uploaded_file = UploadedFile(case=case, file_url=file_url)
        uploaded_file.save()

        return JsonResponse({"message": "Success", "file_url": file_url}, status=201)

    return JsonResponse({"error": "Bad request or not authenticated"}, status=400)

