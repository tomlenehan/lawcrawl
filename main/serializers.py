from rest_framework import serializers
from .models import Case

class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = ['uid', 'name', 'user', 'uploaded_at', 'state']
        read_only_fields = ['uid', 'uploaded_at']
