import google.generativeai as genai
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app) #enables Cross origin resource sharing, a security feature for browsers

@app.route('/')
def home():
    return render_template('index.html')


genai.configure(api_key = os.getenv('API_KEY'))

with open('instruction.txt', 'r') as instruction_file:
    instructions = instruction_file.read().strip()

chat_history = [] #empty list to store chat history, before pushing it to storage, for chat history retreival



with open('history.txt','a+') as history1_file: #opens history file
    for line in history1_file:
        chat_history= json.loads(history1_file)

@app.route('/chat', methods = ['POST'])

def model_out():
    global chat_history

    user_in = request.json.get("message")

    model = genai.GenerativeModel(model_name ='gemini-2.0-flash', system_instruction = {'parts' : instructions})  #model info
    chat = model.start_chat(history = chat_history)  #tarts chat with previous history
    response = chat.send_message(user_in, stream = True)  #sends message to API call
    response.resolve()  #response buffer

    '''Lines 22-25, store messages in dict format, and then append to temp var, chat_history
       which is then pushed to storage.
    '''

    user_msg = {'role' : 'user', 'parts' : user_in}   
    bot_msg = {'role' : 'model', 'parts' : response.text}
    chat_history.append(user_msg)
    chat_history.append(bot_msg)


    with open('history.txt', 'w') as history2_file:  # Opening in 'w' will overwrite with correct JSON structure
        json.dump(chat_history, history2_file)

    return jsonify({'parts' : response.text})

if __name__ == '__main__':
    app.run(debug = True)

