import requests

def test_update():
    # first create
    res = requests.post('http://127.0.0.1:8000/categories/', data={"name": "Test Category XYZ 2"})
    cat = res.json()
    cat_id = cat.get("id")
    if not cat_id:
        print("Create failed:", res.text)
        return
    
    print("Created:", cat)
    
    res2 = requests.put(f'http://127.0.0.1:8000/categories/{cat_id}', data={"name": "Updated Category XYZ 2"})
    print("Update status:", res2.status_code)
    print("Update response:", res2.text)

if __name__ == "__main__":
    test_update()
