# Unobtrusive Search Behaviour Analysis
## Project Structure
There are a couple of important scripts and components divided by their function.
1. `UI.js`: The extensions UI. The UI sets initial states and triggers the required recording scripts based on the users selection.
2. `service-worker.js`runs in the browser background and listens to events like starting and stopping navigation and click scriptsm, temporarely saving the collected data and lastly, processing the collected data to a uniform JSON file which gets saved to the local storage and then processed by another component.
3. `FileProcessing.js` covers the transformation of the set timestamps and creating a webVTT file that reduces all events to their core and adjusts the timestamps collected to a form usable for video subtitles. To achieve that, a reference timestamp set at the start of the recording is used. Finally, `FileProcessing.js` orchestrates the downloads of the different files. A JSON with all raw data, a ready-to-use webVTT file and the recording itself. Due to required libraries, it is processed within a `ReactJS`component rather than inside the `service-worker`of the extension.


## Add Extension to Browser (Google Chrome)
1. Run `yarn build` to create a build folder
2. Enter your Chrome browser (procedure for edge quite similar) and open the `manage extensions` window when clicking on the little puzzle symbol in the top-right corner of the browser
3. Click on `load unpacked` and select your `build` folder
Now the extension is available in your local Chrome installation.