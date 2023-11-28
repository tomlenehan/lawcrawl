from django.db import models
from users.models import User
from uuid import uuid4


class Case(models.Model):
    STATES = (
        ("AL", "Alabama"),
        ("AK", "Alaska"),
        ("AZ", "Arizona"),
        ("AR", "Arkansas"),
        ("CA", "California"),
        ("CO", "Colorado"),
        ("CT", "Connecticut"),
        ("DE", "Delaware"),
        ("FL", "Florida"),
        ("GA", "Georgia"),
        ("HI", "Hawaii"),
        ("ID", "Idaho"),
        ("IL", "Illinois"),
        ("IN", "Indiana"),
        ("IA", "Iowa"),
        ("KS", "Kansas"),
        ("KY", "Kentucky"),
        ("LA", "Louisiana"),
        ("ME", "Maine"),
        ("MD", "Maryland"),
        ("MA", "Massachusetts"),
        ("MI", "Michigan"),
        ("MN", "Minnesota"),
        ("MS", "Mississippi"),
        ("MO", "Missouri"),
        ("MT", "Montana"),
        ("NE", "Nebraska"),
        ("NV", "Nevada"),
        ("NH", "New Hampshire"),
        ("NJ", "New Jersey"),
        ("NM", "New Mexico"),
        ("NY", "New York"),
        ("NC", "North Carolina"),
        ("ND", "North Dakota"),
        ("OH", "Ohio"),
        ("OK", "Oklahoma"),
        ("OR", "Oregon"),
        ("PA", "Pennsylvania"),
        ("RI", "Rhode Island"),
        ("SC", "South Carolina"),
        ("SD", "South Dakota"),
        ("TN", "Tennessee"),
        ("TX", "Texas"),
        ("UT", "Utah"),
        ("VT", "Vermont"),
        ("VA", "Virginia"),
        ("WA", "Washington"),
        ("WV", "West Virginia"),
        ("WI", "Wisconsin"),
        ("WY", "Wyoming"),
    )

    uid = models.UUIDField(default=uuid4, unique=True, verbose_name="UID")
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    state = models.CharField(max_length=2, choices=STATES, default="NY")


DOCUMENT_TYPES = (
    ("contract", "Contract"),
    ("invoice", "Invoice"),
    ("agreement", "Agreement"),
    ("report", "Report"),
    ("letter", "Letter"),
    ("other", "Other"),
    # Add more document types here as needed
)


class UploadedFile(models.Model):
    case = models.ForeignKey(
        Case, on_delete=models.CASCADE, related_name="uploaded_files"
    )
    object_key = models.CharField(max_length=255)
    document_type = models.CharField(
        max_length=50,
        choices=DOCUMENT_TYPES,
        default="contract",  # Set a default value if you wish
        help_text="Select the type of the document",
    )

    raw_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.case.name}"


class CaseConversation(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    conversation = models.JSONField()
    temp_file = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Ad(models.Model):
    title = models.CharField(max_length=255)
    text = models.TextField()
    url = models.URLField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
