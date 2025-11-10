from django import forms

class PrintImageForm(forms.Form):
    personal_image = forms.CharField()
    mosaic_image = forms.CharField()
    email_to_me = forms.BooleanField(required=False, initial=False)
    email = forms.EmailField(required=False)
    print = forms.BooleanField(required=False, initial=False)
    print_in_mosaic = forms.BooleanField(required=False, initial=False)