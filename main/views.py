from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from .models import Case, UploadedFile

@csrf_exempt
def upload_file(request):
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

    return JsonResponse({"error": "Bad request"}, status=400)
