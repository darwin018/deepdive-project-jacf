import urllib.request
try:
    print(urllib.request.urlopen('http://127.0.0.1:8000/categories/').read())
except Exception as e:
    import traceback
    traceback.print_exc()
