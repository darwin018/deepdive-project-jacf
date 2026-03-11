import requests
try:
    print("Testing Products:")
    res_p = requests.get('https://demoapp-50039367885.development.catalystappsail.in/products/')
    print(res_p.status_code)
    print(res_p.text[:500])
except Exception as e:
    print("Products Error:", e)

try:
    print("\nTesting Orders:")
    res_o = requests.get('https://demoapp-50039367885.development.catalystappsail.in/orders/')
    print(res_o.status_code)
    print(res_o.text[:500])
except Exception as e:
    print("Orders Error:", e)
