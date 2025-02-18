import os
import requests
from flask import Flask, request, jsonify, render_template
import markdown
import json
import base64
from dotenv import load_dotenv



app = Flask(__name__)

load_dotenv()




# Cloudflare API details
API_BASE_URL = os.getenv('API_BASE_URL')
# API_TOKEN = "sVDsrXpaBNvDePOosv25i1tYr-nXje2fM2632bZb" 
API_TOKEN = os.getenv('API_TOKEN') 
HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json",
}

def run_cloudflare_model_text(model, inputs):
    """Calls Cloudflare's AI API to generate a response."""
    payload = {"messages": inputs, "max_tokens": 2}
    response = requests.post(f"{API_BASE_URL}{model}", headers=HEADERS, json=payload)
    
    if response.status_code == 200:
        return response.json()  
    else:
        return {"error": f"Request failed with status {response.status_code}"}


def run_cloudflare_model_image(model, inputs):
    # Make the API request
        response = requests.post(
            f"{API_BASE_URL}{model}",
            headers=HEADERS,
            json=inputs,
        )
        
        # print("Response status code:", response.status_code)  # Debug print
        # print("Response headers:", response.headers)  # Debug print
        # print("Raw response:", response.text)  # Debug print
        
        if response.status_code == 200:
            # Convert the image data to base64 for sending to frontend
            image_base64 = base64.b64encode(response.content).decode('utf-8')
            return {
                "image": f"data:image/png;base64,{image_base64}",
                "success": True
            }
        else:
            print(f"Request failed with status {response.status_code}")
            print("Error response:", response.text)
            return {
                "success": False,
                "error": f"Request failed with status {response.status_code}"
            }
    # """Calls Cloudflare's AI API to generate a response."""
    # payload = {"messages": inputs}
    # response = requests.post(f"{API_BASE_URL}{model}", headers=HEADERS, json=payload)
    
    # if response.status_code == 200:
    #     return response.json()
    # else:
    #     return {"error": f"Request failed with status {response.status_code}"}

@app.route("/")
def home():
    """Render the homepage."""
    return render_template("index.html")

def generate_recipe_image(recipe):
    """Generates an image for the recipe using Cloudflare's Image Generation."""
    try:
        # recipe = "pasta"
        # Create a prompt for the image generation
        image_prompt = f"A professional food photography style image of the following dish: {recipe}. The image should be well-lit, styled like a high-end restaurant cookbook, with garnishes and appropriate plating."
        
        # Set up the image generation request - note the simpler payload structure
        payload = {
            "prompt": image_prompt
        }
        
        print("Sending request with payload:", payload)  # Debug print

        return run_cloudflare_model_image("@cf/stabilityai/stable-diffusion-xl-base-1.0", payload)


        
        # # Make the API request
        # response = requests.post(
        #     f"{API_BASE_URL}@cf/stabilityai/stable-diffusion-xl-base-1.0",
        #     headers=HEADERS,
        #     json=payload,
        # )
        
        # print("Response status code:", response.status_code)  # Debug print
        # print("Response headers:", response.headers)  # Debug print
        # # print("Raw response:", response.text)  # Debug print
        
        # if response.status_code == 200:
        #     # Convert the image data to base64 for sending to frontend
        #     image_base64 = base64.b64encode(response.content).decode('utf-8')
        #     return {
        #         "image": f"data:image/png;base64,{image_base64}",
        #         "success": True
        #     }
        # else:
        #     print(f"Request failed with status {response.status_code}")
        #     print("Error response:", response.text)
        #     return {
        #         "success": False,
        #         "error": f"Request failed with status {response.status_code}"
        #     }
            
    except requests.exceptions.RequestException as e:
        print(f"Request error: {str(e)}")
        return None
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return None

@app.route("/generate", methods=["POST"])
def generate_fusion_recipe():
    """Accepts two cuisines and returns a fusion recipe."""
    data = request.json
    cuisine1 = data.get("cuisine1")
    cuisine2 = data.get("cuisine2")
    
    servings = data.get("servings", 1)
    dietary = data.get("dietary", [])
    ingredients = data.get("ingredients", [])
    
    if not cuisine1 or not cuisine2:
        return jsonify({"error": "Both cuisine1 and cuisine2 are required"}), 400
    
    # Build dietary restrictions string
    dietary_str = ""
    if dietary:
        dietary_str = f"The recipe must be {' and '.join(dietary)}. "
    
    # Build ingredients string
    ingredients_str = ""
    if ingredients:
        ingredients_str = f"Please incorporate these ingredients if possible: {', '.join(ingredients)}. "
    
    # Create the main prompt
    prompt = (
        f"Create a unique fusion recipe that serves {servings} people by combining {cuisine1} "
        f"and {cuisine2} cuisines. {dietary_str}{ingredients_str}"
        f"The recipe should blend the authentic flavors and cooking techniques from both {cuisine1} "
        f"and {cuisine2} traditions."
    )
    
    inputs = [
        {"role": "system", "content": "You are a polite and helpful assistant. Your job is to create an amazing fusion of two different types of cuisines from around the world into a single recipe. Keep the recipe simple and keep the ingredient list concise, no need to provide separate ingredient list for each part of the recipe. Incorporate the different flavor profiles and spices of the given cuisines. Be sure to follow the diet constraints if mentioned. Your output should contain a concise ingredient list and the recipe. Always structure your response in this exact format: [RECIPE_TITLE] {Recipe name in title case} [RECIPE_DESCRIPTION] {One paragraph describing the fusion concept} [RECIPE_INFO] Servings: {number} Cook Time: {minutes} minutes [INGREDIENTS] {List each ingredient on a new line with exact measurements: - quantity unit ingredient (extra details)} [INSTRUCTIONS] {Numbered list of steps, each on a new line: 1. Step one 2. Step two} [NOTES] {Optional cooking tips, substitutions, or serving suggestions} Example: [RECIPE_TITLE] Thai-Mexican Street Tacos [RECIPE_DESCRIPTION] A vibrant fusion that combines the bold flavors of Thai curry with traditional Mexican street tacos. [RECIPE_INFO] Servings: 4 Cook Time: 30 minutes [INGREDIENTS] - 12 corn tortillas - 500g chicken thigh, diced - 2 tbsp red curry paste - 1 cup coconut milk [INSTRUCTIONS] 1. Heat oil in a large pan over medium heat 2. Add curry paste and fry for 1 minute [NOTES] For extra heat, add Thai bird's eye chilies or jalapeños. Maintain this exact structure and formatting. Each section must start with the section header in square brackets. Keep ingredients and instructions clear and concise."},
        {"role": "user", "content": prompt},
    ]
    
    output = run_cloudflare_model_text("@cf/meta/llama-3-8b-instruct", inputs)
    
    markdown_content = output["result"]["response"]
    print(markdown_content)
    output = markdown.markdown(markdown_content)
    
    recipe_image = generate_recipe_image(markdown_content)
    # print("Image Generated")

    # return jsonify({
    #     "recipe": output,
    #     "image": recipe_image
    # })
    response_data = {
        "recipe": output,
    }

    if recipe_image.get("success"):
        response_data["image"] = recipe_image["image"]
    else:
        response_data["image_error"] = recipe_image.get("error", "Failed to generate image")
    
    return jsonify(response_data)



if __name__ == "__main__":
    app.run(debug=True)
