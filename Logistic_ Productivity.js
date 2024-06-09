// =================================================================
//                          데이터 생성 파트
// =================================================================
let c1, c2, l1, l2;
let xs, ys, input;

fetch('./data.json') // data.json의 내용 불러오기
    .then((response) => {
        return response.json()
    })
    .then((json) => {
        let loadedC1 = [];
        let loadedC2 = [];
        let loadedL1 = [];
        let loadedL2 = [];

        for(let i in json){
            if(json[i].DIS <= 2){
                loadedC1.push( json[i].AGE )
                loadedC1.push( json[i].BMI )
                loadedL1.push(1)
            }else{
                loadedC2.push( json[i].AGE )
                loadedC2.push( json[i].BMI )
                loadedL2.push(0)
            }
        }

        // 같은 사이즈로 바꿔주기 (갯수가 다르면 학습에 지장을 준다)
        if(loadedC1.length > loadedC2.length){
            loadedC1 = loadedC1.slice(0, loadedC2.length)
            loadedL1 = loadedL1.slice(0, loadedL2.length)
        }else{
            loadedC2 = loadedC2.slice(0, loadedC1.length)
            loadedL2 = loadedL2.slice(0, loadedL1.length)
        }

        c1 = tf.tensor2d(loadedC1, [loadedC1.length/2, 2]);
        c2 = tf.tensor2d(loadedC2, [loadedC2.length/2, 2]);
        l1 = tf.tensor2d(loadedL1, [loadedL1.length, 1]);
        l2 = tf.tensor2d(loadedL2, [loadedL2.length, 1]);

        xs = c1.concat(c2);
        ys = l1.concat(l2);

        training(); // 최적화 실행
    })

// =================================================================
//                      Layers API - 모델 설정
// =================================================================
const productivityModel = tf.sequential();

productivityModel.add( tf.layers.dense({units: 1, batchInputShape: [null, 2]}) ) // 2개 요소로 이루어진 입력 벡터


// =================================================================
//                          최적화 파트
// =================================================================
// 손실 함수 (그대로 사용)
const loss = (predict, real) => {
    return tf.losses.sigmoidCrossEntropy(predict, real).asScalar();
}

// 모델 최적화 정의 (compile)
productivityModel.compile({
    loss: loss,
    optimizer: 'adam',
    metrics: ['accuracy']
});

// 학습: 비동기식 함수 (맨 마지막에 실행)
let history;
async function training(){
    console.log('학습 시작!');
    history = await productivityModel.fit(xs, ys, {epochs: 100}); // epochs: 학습 반복 횟수
    console.log('학습 완료!');
    console.log(productivityModel.summary());

    console.log('정확도: ' + history.history.acc[history.history.acc.length-1]);

    // drawGraphs();
}

// =================================================================
//                          차트 그리는 파트
// =================================================================

// 데이터 처리를 위한 함수
// function getXYfromTensor2D(t){
//     let array = t.dataSync();
//     let returnArray = [];
//     for(let i=0; i<array.length; i+=2){
//         returnArray.push({x: array[i], y: array[i+1]}) // 짝수: x값, 홀수: y값
//     }
//     return returnArray;
// } 

// function classify(t){
//     let array = t.dataSync();
//     let returnC1 = [];
//     let returnC2 = [];

//     for(let i=0; i<array.length; i+=2){
//         let c = productivityModel.predict(t).dataSync()[i/2] // 모델의 계산은 productivityModel.predict(tensor)

//         if(c>=0.5){
//             returnC1.push({x: array[i], y: array[i+1]});
//         }else{
//             returnC2.push({x: array[i], y: array[i+1]});
//         }
        
//     }

//     return {c1: returnC1, c2: returnC2};
// } 

// function drawGraphs(){
//     // 입력 데이터 차트
//     const ctxData = document.getElementById('data');
//     new Chart(ctxData, {
//         type: 'scatter',
//         data: {
//             datasets: [{
//                 label: 'Class 1',
//                 data: getXYfromTensor2D(c1),
//             },
//             {
//                 label: 'Class 2',
//                 data: getXYfromTensor2D(c2),
//             }
//             ]
//         }
//     });

//     //분류 결과 차트
//     const ctxResult = document.getElementById('result');
//     new Chart(ctxResult, {
//         type: 'scatter',
//         data: {
//             datasets: [{
//                 label: 'Class 1',
//                 data: classify(xs).c1,
//             },
//             {
//                 label: 'Class 2',
//                 data: classify(xs).c2,
//             }
//             ]
//         }
//     });

//     // 손실 함수 차트
//     const ctxLoss = document.getElementById('loss');
//     new Chart(ctxLoss, {
//         type: 'line',
//         data: {
//             labels: history.epoch,
//             datasets: [{
//                 label: '손실 함수',
//                 data: history.history.loss,
//             }]
//         }
//     });

// }

// =================================================================
//                          결과 추정 파트
// =================================================================
let prediction = document.getElementById('prediction');

$('.productivity-button').click(function() {
    let currentWorkingTime = 5;
    let currentRestingTIme = 1;

    const input = tf.tensor2d([currentWorkingTime, currentRestingTIme], [1, 2]);

    let p = productivityModel.predict(input).dataSync()[0];
    
    if(p >= 0.5){
        prediction.innerText = `현재 근무시간 ${currentWorkingTime}과 현재 휴식시간 ${currentRestingTIme}은 좋은 생산성입니다. (p=${p})`;
    }else{
        prediction.innerText = `현재 근무시간 ${currentWorkingTime}과 현재 휴식시간 ${currentRestingTIme}은 좋지않은 생산성입니다. (p=${p})`;
    }
})