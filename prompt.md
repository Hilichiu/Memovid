Client-side video creator


You'll be building a client-side video creator. This is a single-page web application that runs entirely in the user's web browser. It will allow my grandfather to select photos, reorder them, add background music, set timings, and export a final MP4 video file directly from the webpage. The entire application will be hosted for free on GitHub Pages. The interface should be as simple as possible to lower the learning curve for my grandpa.

Technology Stack 
HTML, Tailwind CSS, JavaScript, Web Audio API( handle the audio, including trimming or looping it to fit the video's length.), FFmpeg.wasm(Combining the images and audio into a single MP4 video file)

Core Features to Build

1. UI Controls: Simple and clear buttons and inputs.
    * "Select Photos" button.
    * "Upload Music" button.
    * Input field to set the duration for each photo (e.g., "3 seconds").
    * Checkboxes for effects "Fade In/Out". And the option to make it only appears at the beginning/ end of the video or throughout the entire video.
    * Image Preview & Reordering Area: A section on the page where thumbnails of the selected photos appear. The user can drag and drop these thumbnails to change their order.
    * A "Create Video" button.
2. Video Processing Logic: JavaScript code that activates when "Create Video" is clicked.
    * It calculates the total video duration.
    * It prepares the audio (trims it if it is too long; loops it if it is too short)
    * It sends the images, audio, and settings to FFmpeg.wasm to be encoded.
3. Progress & Download: A loading indicator or progress bar that shows the video is being created. Once complete, a download link for the finished MP4 file will appear.



On top of the web app, I want to be able to toggle between dark mode and light mode, and second, I want to toggle between ZHTW and English version of the app, add
a json file to translate everything to zhtw 

ake the image bigger, this image thumbnail bigger and display it with grid mode instead of the list. So, the grid mode should go left to right and top to bottom, showing the image clearly and also still able to drag it to reorder them.
