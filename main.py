from transformers import pipeline
from diffusers import StableDiffusionPipeline
import torch
import os
from IPython.display import Image, display

# Load the Whisper model using a pipeline
whisper_pipeline = pipeline("automatic-speech-recognition", model="openai/whisper-base")

model_id = "runwayml/stable-diffusion-v1-5"
text_to_image_pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
text_to_image_pipe = text_to_image_pipe.to("cpu")

summarization_pipeline = pipeline("summarization", model="t5-small", tokenizer="t5-small")


# Function to transcribe audio
def transcribe_audio(audio_path):
    # Transcribe the audio using the Whisper pipeline
    transcribed_text = whisper_pipeline(audio_path)
    return transcribed_text


# Example usage
audio_path = "/Users/simarjeetss529/Desktop/Washington State University.m4a"  # Replace with your audio file path
transcribed_text = transcribe_audio(audio_path)
print("Transcribed Text:", transcribed_text)


# Function to summarize text
def summarize_text(text):
    # Adjust max_length based on input text length
    max_length = min(len(text) + 10, 15)  # Add a buffer of 10 tokens and cap at 15
    summary = summarization_pipeline(text, max_length=max_length, min_length=5, do_sample=False)[0]['summary_text']
    return summary


summarized_text = summarize_text(transcribed_text)
print("Summarized Text:", summarized_text)

# Generate image from summarized text
generated_image = text_to_image_pipe(summarized_text).images[0]
# Display or save the generated image as needed
generated_image.save("generated_image.png")
#Display the generated image
display(generated_image)
