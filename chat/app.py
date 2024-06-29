
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
import uvicorn
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
import google.generativeai as genai
from dotenv import load_dotenv
from io import BytesIO
import faiss

import time
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow import keras
from fastapi.middleware.cors import CORSMiddleware

import shutil

load_dotenv()
os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Add any other origins as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


################################################IMAGE CLASSIFICATION##############################################################################
Xray_MODEL = tf.keras.models.load_model("./Models/ChestXray", compile=False)
# C:\Users\mayan\OneDrive\Desktop\food project\Models\class
Xray_NAMES = ["Covid","Normal","Viral cold"]



def read_file_as_image(data) -> np.ndarray:
    size = (256, 256)
    image = np.array(Image.open(BytesIO(data)).resize(size))
    return image


@app.post("/predict-chest-xray")
async def predict(
        file: UploadFile = File(...)
):
    # bytes = await file.read()
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)

    predictions = Xray_MODEL.predict(img_batch)

    predicted_class = Xray_NAMES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])
    time.sleep(2.5)
    return {
        'status': 200,
        'class': predicted_class,
        'confidence': float(confidence)
    }


Mri_MODEL = tf.keras.models.load_model("./Models/BrainMri", compile=False)
# C:\Users\mayan\OneDrive\Desktop\food project\Models\class
Mri_NAMES = ["Normal", "Brain Tumor"]


@app.post("/predict-brain-mri")
async def predict(
        file: UploadFile = File(...)
):
    # bytes = await file.read()
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)

    predictions = Mri_MODEL.predict(img_batch)

    predicted_class = Mri_NAMES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])
    time.sleep(2.5)
    return {
        'status': 200,
        'class': predicted_class,
        'confidence': float(confidence)
    }

################################################GEMINI#######################################################################################################
from pathlib import Path






def get_pdf_text(pdf_file):
    pdf_reader = PdfReader(pdf_file.file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    chunks = text_splitter.split_text(text)
    return chunks

def get_vector_store(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    vector_store.save_local("faiss_index")

def get_conversational_chain():
    prompt_template = """
    Answer the question as detailed as possible from the provided context, make sure to provide all the details, if the answer is not in
    provided context just say, "answer is not available in the context", don't provide the wrong answer\n\n
    Context:\n {context}?\n
    Question: \n{question}\n

    Answer:
    """
    model = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
    return chain

def user_input(user_question):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    new_db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
    docs = new_db.similarity_search(user_question)
    chain = get_conversational_chain()
    response = chain({"input_documents":docs, "question": user_question}, return_only_outputs=True)
    return response["output_text"]

@app.post("/upload-pdf")
async def upload_pdf(pdf_file: UploadFile = File(...)):

    try:
        shutil.rmtree("faiss_index")
    except FileNotFoundError:
        pass  # No existing directory to delete
    raw_text = get_pdf_text(pdf_file)
    text_chunks = get_text_chunks(raw_text)
    get_vector_store(text_chunks)
    return {"message": "PDF uploaded and processed successfully"}

@app.post("/ask-question")
async def ask_question(user_question: str = Form(...)):
    try:
        response = user_input(user_question)
        return {"Reply": response}
    except Exception as e:
        print(e)

# @app.post("/restart-server")
# async def restart_server():
#     os.execl(sys.executable, sys.executable, *sys.argv)

##################################################################################################################################################
api_key = os.getenv("GOOGLE_API_KEY")
#set up model

# genai.configure(api_key=api_key)
generation_config={
    "temperature":0.4,
    "top_p":1,
    "top_k":32,
    "max_output_tokens":4096,
}

#apply safety settings
safety_settings=[
    {
        "category":"HARM_CATEGORY_HARASSMENT",
        "threshold":"BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category":"HARM_CATEGORY_HATE_SPEECH",
        "threshold":"BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category":"HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold":"BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category":"HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold":"BLOCK_MEDIUM_AND_ABOVE"
    }
]
system_prompt="""

As a highly skilled medical practitioner specializing in image analysis, you are tasked with examining medical images for a renowned hospital. Your expertise is crucial in identifying any anomalies, diseases, or health issues that may be present in the image.

Your responsibilies include:

1. Detailed Analysis: Thoroughly analyze each image, focusing on identifying any abnormal findings.
2. Findings Report: Document all observed anomalies or signs of disease. Clearly articulate these findings in a structured form.
3. Recommendations and Next Steps: Based on your analysis, suggest potential next steps, including further test or treatment as applicable.
4. class: describe the health issue in one word, or tell the disease name.
5. Treatment Suggestions: If appropriate, recommend possible treatment options or interventions.

Important Notes:

1. Scope of Response: Only respont if the image pertains to human health issues.
2. Clarity of Image: In cases where the image quality impedes clear analysis, note that certain aspects are 'Unable to be determined based on the provided iamge.'
3. Disclaimer: Accompany your analysis with the disclaimer: "Consult with a Doctor before making any dicisions.'
4. Your insights are invaluable in guiding clinical decisions. Please proceed with the analysis, adhering to the structured approach outlined above.

Please provide me an output response with these 5 headings Detailed Analysis, Findings Report, Recommendations and Next Steps, Treatment Suggestions


"""
#MODEL CONGIFURATION
model=genai.GenerativeModel(model_name="gemini-pro-vision",
                            generation_config=generation_config,
                            safety_settings=safety_settings)

@app.post("/process_image")
async def process_image(image: UploadFile = File(...)):
    # Process the uploaded image
    image_data = await image.read()

    # Make image ready
    image_parts = [
        {
            "mime_type": image.content_type,
            "data": image_data
        },
    ]

    prompt_parts = [
        image_parts[0],
        system_prompt,
    ]

    # Generate
    response = model.generate_content(prompt_parts)
    
    return {"response": response.text}
###########################################################################################################################################

model2 = genai.GenerativeModel(model_name="gemini-1.0-pro",
                              generation_config=generation_config,
                              safety_settings=safety_settings)
@app.post("/remedies_reply")
async def remedies_reply(text: str = Form(...)):
    
    convo = model2.start_chat(history=[
    ])

    convo.send_message("As a highly skilled medical practitioner specializing in medical report analysis, your expertise is crucial in examining reports for a renowned hospital. Your responsibilities include:Detailed Analysis: Thoroughly analyze the provided medical report, focusing on identifying any abnormal findings.Findings Report: Document all observed anomalies or signs of disease. Clearly articulate these findings in a structured form.Recommendations and Next Steps: Based on your analysis, suggest potential next steps, including further tests or treatment as applicable.Treatment Suggestions: If appropriate, recommend possible treatment options or interventions.. my health report has "+text+" is it normal if not give output with these 4 headings Detailed Analysis, Findings Report, Recommendations and Next Steps, Treatment Suggestions . if it is normal output NORMAL " )
    return {"response": convo.last.text}
    


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

