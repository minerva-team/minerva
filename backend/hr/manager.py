from django.db import models

class ActiveEmployeeManager(models.manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)