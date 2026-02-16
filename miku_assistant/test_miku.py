import requests
import json
import base64

def test_miku_chat():
    print("Miku se baat test kar raha hoon Hinglish mein...")
    url = "http://localhost:8000/chat"
    
    # 1. Pehli baat (Introduction)
    msg1 = "Hello Miku! Main tumhara dost hoon. Mera naam Rahul hai."
    print(f"\nUser: {msg1}")
    res1 = requests.post(url, json={"text": msg1})
    
    if res1.status_code == 200:
        data1 = res1.json()
        print(f"Miku: {data1.get('reply')}")
        if data1.get('audio'):
            print("🔊 Audio received! (Saving as reply1.mp3)")
            with open("reply1.mp3", "wb") as f:
                f.write(base64.b64decode(data1['audio']))
        else:
            print("🔇 No audio received.")
    else:
        print(f"Error: {res1.text}")
        return

    # 2. Dusri baat (Memory Check)
    msg2 = "Batao mera naam kya hai?"
    print(f"\nUser: {msg2}")
    res2 = requests.post(url, json={"text": msg2})
    
    if res2.status_code == 200:
        data2 = res2.json()
        print(f"Miku: {data2.get('reply')}")
        if "Rahul" in data2.get('reply', ""):
            print("✅ Memory Test Passed! Miku ko naam yaad hai.")
        else:
            print("❌ Memory Test Failed! Miku bhool gayi.")
            
        if data2.get('audio'):
            print("🔊 Audio received! (Saving as reply2.mp3)")
            with open("reply2.mp3", "wb") as f:
                f.write(base64.b64decode(data2['audio']))
    else:
        print(f"Error: {res2.text}")

if __name__ == "__main__":
    try:
        test_miku_chat()
    except Exception as e:
        print(f"Connection failed. Is the server running? Error: {e}")
