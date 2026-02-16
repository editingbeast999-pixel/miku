import requests

def debug_miku():
    url = "http://localhost:8000/chat"
    try:
        print("Sending request to Miku...")
        res = requests.post(url, json={"text": "Hello"})
        print(f"Status Code: {res.status_code}")
        print(f"Response Body: {res.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    debug_miku()
