import requests


API_BASE_URL = "https://api.cloudflare.com/client/v4/accounts/a41c307ccbbda2088dfa01260a21bd83/ai/run/"
headers = {"Authorization": "Bearer sVDsrXpaBNvDePOosv25i1tYr-nXje2fM2632bZb"}


def run(model, inputs):
    input = { "messages": inputs,
                # "stream": True,
                "max_tokens": 758,
 }
    response = requests.post(
        f"{API_BASE_URL}{model}",
         headers=headers,
        json=inputs)

    return response.json()

system_message = "You are a polite and helpful assitant. Your job is to create an amazing fusion of two different types of cuisines from around the world into a single recipe. Keep the recipe simple and keep the ingredient list concise, no need to provide separate ingredient list for each part of the recipe. Incorporate the different flavor profiles and spices of the given cousines. Be sure to follow the diet constraints if mentioned. Your output should contain a concise ingredient list and the recipe."

user_message = "I want a main course for 1 person mixing influences from Italy and Jamaican"

inputs = [
    { "role": "system", "content": system_message },
    { "role": "user", "content": user_message}
];


output = run("@cf/meta/llama-3-8b-instruct", inputs)
# output = run("@cf/bytedance/stable-diffusion-xl-lightning", inputs)
print(output)