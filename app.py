import speech_recognition as sr
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import threading

# Initialize Flask and SocketIO
app = Flask(__name__)
socketio = SocketIO(app)

# Initialize recognizer
recognizer = sr.Recognizer()

# Global variable to track if recording is active
is_recording = False

def record_and_recognize():
    global is_recording
    with sr.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source)
        while is_recording:
            print("Listening...")
            audio = recognizer.listen(source)
            print("Recognizing...")
            try:
                # Use Google Web Speech API for transcription
                recognized_text = recognizer.recognize_google(audio)
                print("You said: " + recognized_text)
                # Emit recognized text to the frontend
                socketio.emit('recognized_text', {'text': recognized_text})
            except sr.UnknownValueError:
                socketio.emit('recognized_text', {'text': "Sorry, I could not understand the audio"})
            except sr.RequestError as e:
                socketio.emit('recognized_text', {'text': f"Error with the service; {e}"})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start_recording', methods=['POST'])
def start_recording():
    global is_recording
    if not is_recording:
        is_recording = True
        # Start recording in a separate thread
        threading.Thread(target=record_and_recognize, daemon=True).start()
        return {"status": "Recording started"}
    return {"status": "Already recording"}

@app.route('/stop_recording', methods=['POST'])
def stop_recording():
    global is_recording
    if is_recording:
        is_recording = False
        return {"status": "Recording stopped"}
    return {"status": "No recording in progress"}

# Start the Flask app with SocketIO
if __name__ == "__main__":
    socketio.run(app, debug=True)

