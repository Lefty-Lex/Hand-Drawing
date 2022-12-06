import HandPair from "./HandPair.js";

class HandDrawing{

    constructor(){
        this.videoElement = document.getElementsByClassName('input_video')[0];
        this.canvasElement = document.getElementsByClassName('output_canvas')[0];
        this.canvasCtx = this.canvasElement.getContext('2d');
        this.canvasCtx.font = '48px serif';
        this.brushColor = "#FF0000";
        this.brushSize = 5;
        this.canvasCtx.textAlign = "center"; 
        this.canvasCtx.fillText('Loading ...', this.canvasElement.width/2, this.canvasElement.height/2); // we do this cause takes a minute to actually load the webcam :shrug
        this.handPair = new HandPair();
        this.hands = new Hands({locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }});
  
        this.hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
  
        this.hands.onResults(this.renderResults.bind(this)); // allowing the callback to access `this` (handdrawing)
  
        this.camera = new Camera(this.videoElement, {
          onFrame: async () => {
            await this.hands.send({image: this.videoElement});
          },
          width: 1280,
          height: 720
        });
        
        this.camera.start();

        const colorPicker = document.getElementsByClassName("brush-color")[0];
        colorPicker.addEventListener("change", (event) => {
          this.brushColor = event.target.value;
          console.log(this.brushColor);});
        
        const brushSizeElm = document.getElementsByClassName("brush-size")[0];
        brushSizeElm.addEventListener("input", (result) => this.brushSize = result.target.value);
    }

    renderHands(landMarks){
        drawConnectors(this.canvasCtx, landMarks, HAND_CONNECTIONS,
            {color: '#00FF00', lineWidth: 5});
        drawLandmarks(this.canvasCtx, landMarks, {color: '#FF0000', lineWidth: 2});
    }

    renderResults(results) {
      this.handPair.clearHands();
      this.canvasCtx.save();

      this.canvasCtx.translate(this.canvasElement.width, 0); // flip the image
      this.canvasCtx.scale(-1, 1);

      this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);
  
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          const currentHandIndex = results.multiHandLandmarks.indexOf(landmarks);
          const currentHandLabel = results.multiHandedness[currentHandIndex].label
  
          for (const [landmark, value] of Object.entries(landmarks))
            this.handPair.hand[currentHandLabel]["landMarks"].push({x : value.x, y : value.y});
  
            this.renderHands(landmarks);
        }
      }
      this.handPair.setVisibleFingers();
      if (this.handPair.getVisibleFingers("Right").length === 5){
        this.handPair.previousIndexPositions = []; // if we show our right (left because its flipped, we clear our previous positions)
      }
      const fingerPos = this.handPair.getFingerPosition(this.canvasElement, "Left", "Index");
      if (fingerPos){
        if (this.handPair.previousIndexPositions.length == 0){// if we have no previous positions we wont draw because, there will be no destination
          this.handPair.previousIndexPositions.push({x: fingerPos.x, y: fingerPos.y});
        }
        else{
          this.handPair.previousIndexPositions.push({x: fingerPos.x, y: fingerPos.y});
        }
      }
      for (let i = 0; i < this.handPair.previousIndexPositions.length - 2; i++){ // we do length - 2 because we also check +1
        const pointA = this.handPair.previousIndexPositions[i].x - this.handPair.previousIndexPositions[i+1].x;
        const pointB = this.handPair.previousIndexPositions[i].y - this.handPair.previousIndexPositions[i+1].y
        const distanceBetweenTwoPoints = Math.sqrt( pointA*pointA + pointB*pointB );
        if (distanceBetweenTwoPoints > 50)
          continue;

        this.canvasCtx.beginPath(); // begin
        this.canvasCtx.stroke(); // draw it!
        this.canvasCtx.lineWidth = this.brushSize;
        this.canvasCtx.lineCap = 'round';
        this.canvasCtx.strokeStyle = this.brushColor;
        this.canvasCtx.moveTo(this.handPair.previousIndexPositions[i].x, this.handPair.previousIndexPositions[i].y); // from
        this.canvasCtx.lineTo(this.handPair.previousIndexPositions[i+1].x, this.handPair.previousIndexPositions[i+1].y); // to
        this.canvasCtx.stroke(); // draw it!
      }
      this.canvasCtx.restore();
      
    }
}

export default HandDrawing;

