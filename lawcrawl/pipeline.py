
def save_profile(backend, user, response, *args, **kwargs):
    if backend.name == 'twitter':
        # replace with the field names used by your User model
        user.profile_image_url = response.get('profile_image_url', '')
        user.save()
