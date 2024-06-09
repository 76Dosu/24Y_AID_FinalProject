// 근무시간 증가함수
function workingCount_Increase() {
    workingCount++;

    let Hour_workingCount = parseInt(workingCount / 60 / 60);
    let Minute_workingCount = parseInt((workingCount % 3600) / 60);
    let Second_workingCount = workingCount % 60;
    
    $('.working-time-frame .working').text(Hour_workingCount + "시 " + Minute_workingCount + "분 " + Second_workingCount + "초");
}

//휴식시간 증가함수
function restingCount_Increase() {
    restingCount++;

    let Hour_restingCount = parseInt(restingCount / 60 / 60);
    let Minute_restingCount = parseInt((restingCount % 3600) / 60);
    let Second_restingCount = restingCount % 60;
    
    $('.resting-time-frame .resting').text(Hour_restingCount + "시 " + Minute_restingCount + "분 " + Second_restingCount + "초");
}

//물 섭취 증가 함수
function drinkCount_Increase() {
    drinkCount++;
    $('.drinking-time-frame .drinking').text(drinkCount + "회");
}

//텍스트 받아오기
function timeJudgment() {

    // 근무 시간 판단
    let workingHours_Text = $('#label-container > div:first-child').text()
    let workingHours = Number(workingHours_Text.substr(6, 9));
    workingTime_Per = workingHours;

    if (0.4 <= workingTime_Per) {
        isWorking = true;
        isResting = false;
        isDrinking = false;
    }

    let restingHours_Text = $('#label-container > div:nth-child(2)').text()
    let restingHours = Number(restingHours_Text.substr(6, 9));
    restingTime_Per = restingHours;

    if (0.4 <= restingTime_Per) {
        isResting = true;
        isWorking = false;
        isDrinking = false;
    }

    // 물 섭취
    let waterDrink_Text = $('#label-container > div:last-child').text()
    let waterDrink = Number(waterDrink_Text.substr(6, 9));
    drinkTime_Per = waterDrink;

    if (drinkTime_Per >= 0.99 && isDrinking == false) {
        isDrinking = true;
        drinkCount_Increase();

        console.log(isDrinking)
    }
}