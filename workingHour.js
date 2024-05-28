// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image
    
// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/NuIqQdHtp/";

let model, webcam, labelContainer, maxPredictions;

let workingCount = 0, restingCount = 0;
let workingHour_Bool, restingHour_Bool;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

    // ############### Start AID Custom ################
    setInterval(AID_Custom,1000);
}
    
async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);    
}


// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

// ############### AID Custom ################
async function AID_Custom() {
    let workingHours_Text = $('#label-container > div:first-child').text()
    let workingHours = Number(workingHours_Text.substr(6,9));

    if (0.5 <= workingHours) {
        workingHour_Bool = true;
        IncreaseCount()
        
    } else {
        workingHour_Bool = false;
        DecreaseCount();
    }

    // let test = moment(workingCount).format('h:mm:ss');
    // console.log(test)
    $('#time-container > p:nth-child(1)').text("근무시간 : " + workingCount + "초");
    $('#time-container > p:nth-child(2)').text("휴식시간 : " + restingCount + "초");
}