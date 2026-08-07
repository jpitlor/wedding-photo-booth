from django import forms

class PrintImageForm(forms.Form):
    image = forms.CharField()
    email_to_me = forms.BooleanField(required=False, initial=False)
    email = forms.EmailField(required=False)

class AdminForm(forms.Form):
    tile = forms.IntegerField(required=True)