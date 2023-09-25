
def load_extra_data(backend, details, response, uid, user, *args, **kwargs):
    # Get data from social response
    profile_pic = response.get("profile_image_url", None)

    # Save to user model
    user.profile_pic = profile_pic
    user.save()