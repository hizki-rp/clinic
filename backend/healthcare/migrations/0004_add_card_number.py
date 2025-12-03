# Generated migration for adding card_number to Patient model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('healthcare', '0003_visit_final_findings_visit_lab_completed_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='card_number',
            field=models.CharField(
                blank=True,
                help_text='Physical card number for patient identification',
                max_length=20,
                null=True,
                unique=True
            ),
        ),
        migrations.AddField(
            model_name='patient',
            name='card_number_history',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='History of card number changes'
            ),
        ),
        migrations.AddIndex(
            model_name='patient',
            index=models.Index(fields=['card_number'], name='healthcare_p_card_nu_idx'),
        ),
    ]
