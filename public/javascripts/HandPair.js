const fingerNames = ["Thumb", "Index", "Middle", "Ring", "Pink"];


function _normalized_to_pixel_coordinates(normalized_x, normalized_y, image_width, image_height){

  const is_valid_normalized_value = (value) =>{
    return (value > 0 && value < 1)};

  if (!is_valid_normalized_value(normalized_x) || !is_valid_normalized_value(normalized_y))
    return false

  const x_px = Math.min(Math.floor(normalized_x * image_width), image_width - 1)
  const y_px = Math.min(Math.floor(normalized_y * image_height), image_height - 1)
  return {x: x_px, y: y_px};
}

class HandPair{
  constructor(){
    this.hand = {"Left": {landMarks: [], fingers: {}},
                "Right": {landMarks: [], fingers: {}}};
    this.handLandMarks = [];
    this.previousIndexPositions = [];
    for (const [key, value] of Object.entries(this.hand)) {
      for (const fingerName of fingerNames){
        this.hand[key]["fingers"][fingerName] = false;
      }
    }
  }

  clearHands(){
    for (const [hand , value] of Object.entries(this.hand)){
      this.hand[hand].landMarks = [];
    }
  }

  getVisibleFingers(hand){
    let results = []; // array of finger names that are visible
    for (const [fingerName, value] of Object.entries(this.hand[hand].fingers)){
      if (value){
        results.push(fingerName);
      }
    }
    return results;
  }

  getFingerPosition(canvas, hand, finger){
    const isFingerVisible = this.hand[hand].fingers[finger];
    if (isFingerVisible && this.hand[hand].landMarks.length > 0){
        const fingerIndex = fingerNames.indexOf(finger);
        const tipLandMark = this.hand[hand].landMarks[(fingerIndex + 1) * 4]
        const screenPosition = _normalized_to_pixel_coordinates(tipLandMark.x, tipLandMark.y, canvas.width, canvas.height);
        return (screenPosition);
    }
    return false;
  }

  setVisibleFingers(){
    for (const [hand, value] of Object.entries(this.hand)){
      if (this.hand[hand].landMarks.length <= 0)
        continue;
      // thumb checks
      if (hand === "Left"){
        if (this.hand[hand].landMarks[4].x > this.hand[hand].landMarks[3].x){
          this.hand[hand].fingers.Thumb = true;
        }
        else{
          this.hand[hand].fingers.Thumb = false;
        }
      }else if (hand === "Right"){
        if (this.hand[hand].landMarks[4].x < this.hand[hand].landMarks[3].x){
          this.hand[hand].fingers.Thumb = true;
        }
        else{
          this.hand[hand].fingers.Thumb = false;
        }
      }
      let iterationCount = 0;
      for (let i = 8; i <= 20; i+=4){
        iterationCount++;
        if (this.hand[hand].landMarks[i].y < this.hand[hand].landMarks[i-2].y){
          this.hand[hand].fingers[fingerNames[iterationCount]] = true;
        }
        else{
          this.hand[hand].fingers[fingerNames[iterationCount]] = false;
        }
      }
    }
  }
}

export default HandPair;