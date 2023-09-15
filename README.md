# Unobtrusive Search Behaviour Analysis
Project by IAM x UHH

## Installation
1. Please open (preferably) a new Google Chrome or Microsoft Edge window
2. Click `Load unpacked` extension in the browsers extension settings
3. Navigate to the directory with the code and select the `build` folder
4. The extension should be loaded and visible in the browser's extensions tab in the top-right corner

## How To Record a Session
1. Start the recorder by clicking the play button
2. After the screen-sharing dialog has opened, please click `share` as it is suggested by default
3. Keep the tab open and do not redirect. Simply create a new tabs as "working tabs" for your further interaction
4. Please be aware that the already open tabs, which are not tabs where the extension was started from, will only startu recording once refreshed
5. Search for your literature needs
6. Once finished, either open the extension and click on the `Stop` icon, or simply use the screen capturing overlay and click on `Stop sharing``
7. Click on the appropriate feedback opton poping up in the extension`s UI and your generated files get downloaded automatically (3 files will be created and downloaded)


## Troubleshooting
- The screen capture did not start (no overlay opened for permission to share screen)
Simply reload your current tab and try again
- There is still a screen recording sign in my tab and a UI element after stopping on my screen
That is a weird bug by the screen capturing API of MDN. If you finished the recording and your data has been downloaded already, simply click on `Stop sharing`, close or refresh the window.
- The browser only downloaded one or two files
Sometimes, especially in a fresh setup, the browser asks for your consent to download mutliple files from the webpage. Simply click `Allow` once the prompt pops up on the top-left corner of your browser window


## Project Structure
There are a couple of important scripts and components divided by their function.
1. `UI.js`: The extensions UI. The UI sets initial states and triggers the required recording scripts based on the users selection.
2. `service-worker.js`runs in the browser background and listens to events like starting and stopping navigation and click scriptsm, temporarely saving the collected data and lastly, processing the collected data to a uniform JSON file which gets saved to the local storage and then processed by another component.
3. `FileProcessing.js` covers the transformation of the set timestamps and creating a webVTT file that reduces all events to their core and adjusts the timestamps collected to a form usable for video subtitles. To achieve that, a reference timestamp set at the start of the recording is used. Finally, `FileProcessing.js` orchestrates the downloads of the different files. A JSON with all raw data, a ready-to-use webVTT file and the recording itself. Due to required libraries, it is processed within a `ReactJS`component rather than inside the `service-worker`of the extension.


## Known issues
Disclaimer: The provided tool is a first prototype to show possibilities of tracking via a simple web plugin. Since I am not a very skilled extension developer, I had my struggles. Additionally, as mentioned in the paper, there are certain limitations set by the browser what on the one hand ensures security and privacy, but on the other limits the developers freedom.
- The screen recording session is only active, as long as the original tab is not being refreshed or redirected. Unfortunatelly, that is a security thing by manifestV3 and I did not find any solution to bypass it.
- Sometimes, before navigation and click tracking is logging items, the current tab needs to be refreshed (unfortunate combination with the first mentioned issue).
- The screen recording is only saved temprarely and available for download if the session is terminated from the same tab as it was started.
- The output screen recording has no metadata on the duration of the recording. Multiple debugging session did not lead to a solution. This issue causes the embedded subtitles file to have a short timely delay