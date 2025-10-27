from django import forms

class PrintImageForm(forms.Form):
    image = forms.FileField()
    email_to_me = forms.BooleanField()
    email = forms.EmailField()
    print = forms.BooleanField()
    print_in_mosaic = forms.BooleanField()