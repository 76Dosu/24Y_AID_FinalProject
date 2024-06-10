let px, py;     // 정규화되지 않은 초기 텐서
let xs, ys;     // 정규화 시킨 텐서 

fetch('./data.json') // data.json의 내용 불러오기
    .then((response) => {
        return response.json()
    })
    .then((json) => {
        let loadedX = [];
        let loadedY = [];

        for(let i in json){
            loadedX.push(json[i].BreakHoursRatio) // csv의 헤더 값(json의 키 값)
            loadedY.push(json[i].Productivity) // csv의 헤더 값(json의 키 값)
        }

        px = tf.tensor1d(loadedX) // X값 텐서 생성
        py = tf.tensor1d(loadedY) // Y값 텐서 생성 

        // 정규화 (0~1로 만들기)
        xs = px.sub(px.min()).div(px.max().sub(px.min()))
        ys = py.sub(py.min()).div(py.max().sub(py.min()))

        run(); // 최적화 실행
    })


// 2차 회귀 함수 기준
const w0 = tf.scalar(-2).variable();
const w1 = tf.scalar(5).variable();
const w2 = tf.scalar(-10).variable();
const w3 = tf.scalar(-5).variable();
const w4 = tf.scalar(10).variable();

const f_x = (x) => {
    return  w4.mul(x).mul(x).mul(x).mul(x)
            .add(w3.mul(x).mul(x).mul(x))
            .add(w2.mul(x).mul(x))
            .add(w1.mul(x))
            .add(w0);
}

// 손실 함수 및 옵티마이저 설정
const loss = (predict, real) => {
    return predict.sub(real).square().mean();
}

const alpha = 0.05;
const optimizer = tf.train.adam(alpha);

let iter = [];
let losses = [];

// 최적화 실행 함수
function run(){
    for(let i=0; i<100; i++){
        const l = optimizer.minimize(() => loss(f_x(xs), ys), true);
        iter.push(i);
        losses.push(l.dataSync()[0]);
    }

    // console.log(`가중치 최적화 결과:`)
    // console.log(`w0: ${w0.dataSync()}`)
    // console.log(`w1: ${w1.dataSync()}`)
    // console.log(`w2: ${w2.dataSync()}`)
    // console.log(`w3: ${w3.dataSync()}`)
    // console.log(`w4: ${w4.dataSync()}`)

    // const ctxData = document.getElementById('data');
    // new Chart(ctxData, {
    //     type: 'scatter',
    //     data: {
    //         labels: xs.dataSync(),
    //         datasets: [{    
    //             label: '생산률 데이터 그래프',
    //             data: ys.dataSync(),
    //             order: 1
    //         },
    //         {
    //             label: '피팅 라인',
    //             data: f_x(xs).dataSync(),
    //             order: 0
    //         }]
    //     }
    // });

    // const ctxLoss = document.getElementById('loss');
    // new Chart(ctxLoss, {
    //     type: 'line',
    //     data: {
    //         labels: iter,
    //         datasets: [{
    //             label: '손실 함수',
    //             data: losses,
    //         }]
    //     }
    // });
}

// 결과 계산 부분
// let inputBox = document.getElementById('input');
// let calcButton = document.getElementById('calc');
// let resultText = document.getElementById('result');

// calcButton.addEventListener('click', ()=>{
//     let normalizedInput = tf.scalar(Number(inputBox.value)).sub(px.min()).div(px.max().sub(px.min()));     // 입력값을 정규화하기
//     let predictValue = f_x(normalizedInput).mul(py.max().sub(py.min())).add(py.min()).dataSync()[0];       // 출력값의 정규화 풀기

//     resultText.innerText = `근무시간과 휴게시간의 비율은 ${inputBox.value}로 예측생산률은 ${predictValue.toFixed(2)}% 입니다.`;
// })

// 결과 계산 부분
$('.productivity-button').click(function() {

    let BreakHoursRatio = restingCount / workingCount;

    let normalizedInput = tf.scalar(Number(BreakHoursRatio)).sub(px.min()).div(px.max().sub(px.min()));     // 입력값을 정규화하기
    let predictValue = f_x(normalizedInput).mul(py.max().sub(py.min())).add(py.min()).dataSync()[0];       // 출력값의 정규화 풀기

    $('.productivity').text(`현재 근무시간과 휴게시간의 비율은${BreakHoursRatio.toFixed(3)}로 예측생산률은${predictValue.toFixed(2)}% 입니다.`);

    if (restingCount < 1 || workingCount < 1) {
        $('.productivity').text(`예측 생산률을 판단하기에 데이터가 부족합니다.`);
    }
    
    // Display
    $('.contents .productivity-frame').css('transform','translateX(0%)');

    setTimeout(() => {
        $('.contents .productivity-frame').css('transform','translateX(100%)')
    }, 8000);
});