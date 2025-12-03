# Generated manually for adding staff role

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('patient', 'Patient'),
                    ('reception', 'Reception'),
                    ('doctor', 'Doctor'),
                    ('laboratory', 'Laboratory'),
                    ('staff', 'Staff'),
                ],
                default='patient',
                max_length=20
            ),
        ),
    ]