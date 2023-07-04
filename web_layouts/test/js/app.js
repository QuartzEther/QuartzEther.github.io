window.onload = startPreloadChain;

const imgArr = [];
let data = null;

//------------------------------------------------
const container = document.querySelector('.container');

//--------------Load Data & sources---------------
function startPreloadChain(){
    //.log('startPreloadChain');
    loadData();
}

function loadData(){
    //console.log('loadData');

    fetch('../data/symbols.json')
        .then(response=>response.json())
        .then(result=>{
            data = result;
            return onDataPreloaded();
        })
        .catch(error=>{
            console.log(error);
        })
}

function onDataPreloaded(){
    //console.log('onDataPreloaded');

    findPict(data);
    preloadPictures(data['srcImg'], imgArr, init);

}

function findPict(array){
    for (let key in array){
        if (key.includes('img')) {
            if (typeof array[key] === 'object'){
                for (let temp of array[key]) imgArr.push(temp);
            } else {
                imgArr.push(array[key]);
            }
        }
        else if (typeof array[key] === 'object') {
            findPict(array[key])
        }
    }
}

function preloadPictures(path ,sources, callback) {
    const images = [];
    let loadedImagesCounter = 0;
    for(let i = 0; i < sources.length; i++)
    {
        const srcName = sources[i];
        images[srcName] = new Image();
        images[srcName].onload = ()=>{
            if(++loadedImagesCounter >= sources.length)
                callback(images);
        }
        images[srcName].src = path + srcName;
    }
}

//----------------------INIT------------------------
function init()
{
    //console.log("init")

    startTest(data);

    //для замыкания
    //let test = startTest(data);
    //test();
    //test();
}


function startTest(data){

    let sectArr = [];
    let sectionProgress = 0;

    let resultArr = null; //массив/объект со значениями


    //список секций, для переключения
    sectArr.push([data.description, "description"]);
    for (let section of data.questions){
        sectArr.push([section, "question"]);
    }
    sectArr.push([data.answer, "answer"]);


    function addElement(){

        if (!sectArr[sectionProgress]) return;

        let sectionData = sectArr[sectionProgress][0];
        let sectionType = sectArr[sectionProgress][1];

        let sectionStruct = [];
        let sectionText = [];
        let sectionImg = [];
        let sectionAnswers = [];

        let sectionTittle = null;
        let sectionBtn = null;


        //structure of section & init text and img

        //description & question
        if (sectionType === "description" || sectionType === "question"){

            //text split for txt&img
            if (sectionData.text) sectionText = sectionData.text.split(/[|{}]/);

            for (let i in sectionText){
                if (sectionText[i].includes('img')){
                    sectionStruct.push('img');
                    sectionImg.push(sectionData[sectionText[i]]);
                    sectionText[i] = "";
                }else {
                    if (sectionText[i])
                        sectionStruct.push('text');
                }
            }
            sectionText = sectionText.filter((n) => {return n != ""});

            //init progress-bar answers
            if (sectionData.answers){
                sectionStruct.unshift("progress")

                for (let ans of sectionData.answers){
                    sectionAnswers.push(ans)
                    //sectionAnswers.push(ans.img ? [ans.text, ans.value, ans.img] : [ans.text, ans.value])
                    sectionStruct.push('ans');
                }
            }
            //init btn
            if (sectionData.btn){
                sectionBtn = sectionData.btn;
                sectionStruct.push('btn');
            }
        }

        //answer
        if (sectionType === "answer"){
            if(sectionData.tittle){
                sectionTittle = sectionData.tittle;
                sectionStruct.push('tittle');
            }
            if(sectionData.answers && typeof sectionData.answers === "object"){

                //----------AnsPerQuest-----------
                if(data.answerType === "AnsPerQuest"){
                    for (let ans of sectionData.answers){
                        sectionStruct.push('block');
                        if (ans.tittle){
                            sectionText.push(ans.tittle);
                            sectionStruct.push('text');
                        }
                        if (ans.values && typeof ans.values === "object"){

                            let tempTxt = ans.values[resultArr.shift()].split(/[|]/);

                            for (let i in tempTxt){
                                sectionText.push(tempTxt[i])
                                sectionStruct.push('text');
                            }
                            sectionText = sectionText.filter((n) => {return n != ""});
                        }

                    }
                }

                //------CounteSymbols---------------
                if(data.answerType === "unique1"){
                    let positiveArr = [...resultArr["M+"],...resultArr["F+"],...resultArr["I+"]];
                    let negativeArr = [...resultArr["M-"],...resultArr["F-"],...resultArr["I-"]];

                    let result = {gender: resultArr["Gender"], male: 0, female:0, sam:0, undef: [0,0]}

                    // запись в result
                    for(let el of positiveArr) {
                        if (el === "sam") result.sam += 1;
                        else if (el === "yang") result.male += 1;
                        else if (el === "yin") result.female += 1;
                        else if (el === "undef") result.undef[0] += 1;
                    }

                    for(let el of negativeArr) {
                        if (el === "sam") result.sam += 1;
                        else if (el === "yang") result.male -= 1;
                        else if (el === "yin") result.female -= 1;
                        else if (el === "undef") result.undef[1] += 1;
                    }

                    // просчет коэфициента
                    result.sam /= positiveArr.length + negativeArr.length;
                    result.male /= result.male < 0 ? negativeArr.length : positiveArr.length;
                    result.female /= result.female < 0 ? negativeArr.length : positiveArr.length;
                    result.undef = result.undef[0] && result.undef[1] ? 'o' + (result.undef[0] + result.undef[1]) / (positiveArr.length + negativeArr.length) :
                                    result.undef[0] ? result.undef[0] / positiveArr.length :
                                    result.undef[1] ? -result.undef[1] / negativeArr.length : 0;

                    // 100%
                    const allResults = result.sam +
                                        Math.abs(result.male) +
                                        Math.abs(result.female) +
                                        (typeof result.undef === "string" ? parseFloat(result.undef.split('o')[1]) : Math.abs(result.undef));

                    //приводим к нормальному процентному соотношению если allResults > 0;
                    if (allResults){
                        result.sam /= allResults;
                        result.male /= allResults;
                        result.female /= allResults;
                        result.undef = typeof result.undef === "string" ? 'o' + parseFloat(result.undef.split('o')[1]) / allResults : result.undef / allResults;
                    }

                    console.log(result);

                    //поиск нужного и Вывод
                    for (let ans of sectionData.answers){
                        sectionStruct.push('block');
                        if (ans.tittle){
                            sectionText.push(ans.tittle);
                            sectionStruct.push('text');
                        }


                        let ansValues = null;

                        if (ans.type === "about"){
                            let q = ["sam", "undef", "female", "male"];

                            for (let i of q) {
                                ansValues = Object.keys(ans.values[i]).map(el => parseFloat(el)).sort((a, b) => a-b);
                                ansValues.push(1);

                                let numV = typeof result[i] === "string" ? parseFloat(result[i].split('o')[1]) : null;
                                ansValues = ansValues.filter((el,ind) => (numV ? numV : result[i]) >=  ansValues[ind] && (numV ? numV : result[i]) < ansValues[ind+1]);

                                addAnsDOM(ans.values[i][ansValues[0]]);
                            }
                            continue;
                        }
                        
                        if (ans.type === "sam")
                            ansValues = Object.keys(ans.values).map(el => parseFloat(el)).sort((a, b) => a-b);
                        else if (ans.type === "male" || ans.type === "female")
                            ansValues = Object.keys(ans.values[result.gender]).map(el => parseFloat(el)).sort((a, b) => a-b);
                        else
                            ansValues = Object.keys(ans.values[typeof result.undef === "number" ? "oneValue" : "twoValues"]).map(el => parseFloat(el)).sort((a, b) => a-b);

                        ansValues.push(1);

                        //console.log(ansValues)

                        let numV = typeof result[ans.type] === "string" ? parseFloat(result[ans.type].split('o')[1]) : null;
                        for (let i = 0; i < ansValues.length; i++){
                            if (numV ? numV : result[ans.type] >= ansValues[i] && numV ? numV : result[ans.type] < ansValues[i+1]){
                                if (ans.type === "sam") addAnsDOM(ans.values[ansValues[i]]);
                                else if (ans.type === "undef") addAnsDOM(ans.values[!numV ? "oneValue" : "twoValues"][ansValues[i]]);
                                else addAnsDOM(ans.values[result.gender][ansValues[i]]);
                                break;
                            }
                        }


                        //добавить данные для создания блока в Dom
                        function addAnsDOM(value){
                            if (!value) return;

                            let tempTxt = value.split(/[|]/);

                            for (let i in tempTxt){
                                sectionText.push(tempTxt[i])
                                sectionStruct.push('text');
                            }
                            sectionText = sectionText.filter((n) => {return n != ""});
                        }

                    }


                }

                if(data.answerType === "unique2"){
                    let positiveArr = [...resultArr["M+"],...resultArr["F+"],...resultArr["I+"]];
                    let negativeArr = [...resultArr["M-"],...resultArr["F-"],...resultArr["I-"]];

                    const COEF = (positiveArr.length + negativeArr.length)/24;
                    const persentSymb = 1/24;

                    let result = {gender: resultArr["Gender"], male: 0, female:0, sam:0, undef: [0,0]}

                    for(let el of positiveArr) {
                        if (el === "sam") result.sam += 1;
                        else if (el === "yang") result.male += 1;
                        else if (el === "yin") result.female += 1;
                        else if (el === "undef") result.undef[0] += 1;
                    }

                    for(let el of negativeArr) {
                        if (el === "sam") result.sam += 1;
                        else if (el === "yang") result.male -= 1;
                        else if (el === "yin") result.female -= 1;
                        else if (el === "undef") result.undef[1] += 1;
                    }

                    result.sam = result.sam / COEF * persentSymb;
                    result.male = result.male / COEF * persentSymb * 2;
                    result.female = result.female / COEF * persentSymb * 2;

                    result.undef = result.undef[0] && result.undef[1] ? (result.undef[0] + result.undef[1]) / COEF * persentSymb + 'o' :
                        result.undef[0] ? result.undef[0] / COEF * persentSymb * 2 :
                            result.undef[1] ? -result.undef[1] / COEF * persentSymb * 2 : 0;

                    console.log(result)
                }
            }
        }

        //-----------Create DOM section element-------------

        let section = document.createElement('div')
        container.append(section);

        //tittle
        let temp = document.createElement('h1');
        temp.innerHTML = data.name;
        temp.classList.add('tittle');
        section.append(temp);

        //inner
        let inner = document.createElement('div');
        inner.classList.add('inner');
        section.append(inner);

        let ansCounter = 0;
        let block = null;

        for (let el of sectionStruct){
            if (el === 'block') {
                block = document.createElement('div');
                block.classList.add("inner__text-block");

                inner.append(block);

            }else if (el === 'text'){

                temp = document.createElement('p');

                temp.classList.add("inner__text", "text");
                //console.log(sectionText)
                temp.innerHTML = sectionText.shift();

                block ? block.append(temp): inner.append(temp);

            }else if (el === 'img'){

                let tempSrc = data["srcImg"]+sectionImg.shift();

                temp = document.createElement('div');

                temp.classList.add("inner__img", "img");
                temp.style.backgroundImage = `url("${tempSrc}")`;
                temp.style.height = Math.floor(getImgParam(tempSrc, 'height')*0.75) + 'px'


                inner.append(temp);

            }else if (el === 'ans'){

                //блок ответов
                if (!inner.querySelector('.inner__option')){
                    temp = document.createElement('div');
                    temp.classList.add("inner__option", "options");

                    inner.append(temp);
                }

                //сам ответ
                temp = document.createElement('div');

                let tempAns = sectionAnswers.shift();


                //sectionAnswers.push(ans.img ? [ans.text, ans.value, ans.img] : [ans.text, ans.value])

                //разделение на текст и картинки
                if (tempAns.text.includes('img')){
                    if (!inner.querySelector('.inner__option').classList.contains("options_img"))inner.querySelector('.inner__option').classList.add("options_img");

                    temp.classList.add("options__item", "item", "item_img");
                    temp.innerHTML = `<input type="radio" id="item_${ansCounter}" name="options" value="${tempAns.value}">
                        <label htmlFor="item_${ansCounter}"><img src="${data.srcImg + tempAns.img}"></label>`
                }else {
                    temp.classList.add("options__item", "item");
                    temp.innerHTML = `<input type="radio" id="item_${ansCounter}" name="options" value="${tempAns.value}">
                        <label for="item_${ansCounter}">${tempAns.text}</label>`
                }

                ansCounter++;
                inner.querySelector('.inner__option').append(temp);

            }else if (el === 'btn'){
                temp = document.createElement('button');

                temp.classList.add("btn")
                temp.innerHTML = sectionBtn;

                section.append(temp);

            }else if (el === 'progress'){
                temp = document.createElement('div');

                temp.classList.add("progress__bar");

                let progress = Math.ceil(sectionProgress/data.questions.length*100);
                temp.innerHTML = `<span data-progress="${progress}%">
                                    ${data.progressPercent?progress+"%":sectionProgress+" из "+data.questions.length}</span>`
                temp.querySelector("span").style.width = progress+"%";

                section.insertBefore(temp, section.querySelector('.inner'));

            }else if (el === 'tittle'){
                let temp = document.createElement('h2');
                temp.innerHTML = sectionTittle;
                temp.classList.add('inner__tittle', 'tittle');
                inner.append(temp);
            }
        }

        if (sectionType == 'description'){
            section.classList.add('description-section');
            inner.classList.add('description-section__inner')

            temp = section.querySelector('.tittle');
            if (temp) temp.classList.add('description-section__tittle')

            temp = section.querySelector('.btn');
            if (temp) temp.classList.add('description-section__btn')

        } else if (sectionType == 'question'){
            section.classList.add('question-section');
            inner.classList.add('question-section__inner')

            temp = section.querySelector('.tittle');
            if (temp) temp.classList.add('question-section__tittle')

            temp = section.querySelector('.progress__bar');
            if (temp) temp.classList.add('question-section__progress__bar')

            temp = section.querySelector('.text');
            if (temp){
                temp.classList.remove('inner__text', 'text');
                temp.classList.add('inner__question', 'question');
            }

        } else if (sectionType == 'answer') {
            section.classList.add('answer-section');
            inner.classList.add('answer-section__inner')

            temp = section.querySelector('.tittle');
            if (temp) temp.classList.add('answer-section__tittle')
        }


        //------------Listeners-------------
        let buttons = [];
        let items = [];

        let tempItem = null;


        //заполнение
        for (let btn of section.querySelectorAll('.btn'))
            buttons.push(btn);

        if (buttons.length){
            for (let item of section.querySelectorAll('.item')){
                items.push(item);
            }
        } else {
            for (let item of section.querySelectorAll('.item')){
                buttons.push(item);
            }
        }

        if(items.length){
            for (let btn of buttons){
                btn.disabled = true;
            }
        }


        //---------слушатель кнопок-----------

        //заполнение resultArr
        function initResultArr (type, value){
            if (!resultArr) resultArr = type ? {} : [];
            value = value.split(',');

            if (type) {
                if (!resultArr[type]) resultArr[type] = [];
                resultArr[type].push(...value);
            } else {
                try {
                    resultArr.push(...value);
                } catch (e) {
                    console.log("Если один вопрос имеет тип, то и другие вопросы должны его иметь!")
                }
            }

            //console.log(resultArr);
        }

        function handler(e) {

            if (this.querySelector("input")){
                initResultArr(sectionData.type, this.querySelector("input").value);
            } else if (tempItem) {
                initResultArr(sectionData.type, tempItem.value);
            }

            for (let btn of buttons){
                btn.removeEventListener("click", handler);
            }
            //Удаление секции
            container.innerHTML = "";
            addElement();
        }

        for (let btn of buttons){
            btn.addEventListener("click", handler);
        }

        //слушатель items (анимации и input)
        function handlerI(e) {
            e.preventDefault();

            tempItem = this.querySelector("input");

            if(tempItem.checked){
                tempItem.checked = false;

                for (let btn of buttons){
                    btn.disabled = true;
                }

                this.classList.remove('options__item_big')
                for (let item of items){
                    if (item != this) item.classList.remove('options__item_small')
                }
            } else {
                tempItem.checked = true;

                for (let btn of buttons){
                    btn.disabled = false;
                }

                if (this.classList.contains('options__item_small')) this.classList.remove('options__item_small');
                this.classList.add('options__item_big')

                for (let item of items){
                    if (item != this){
                        if (item.classList.contains('options__item_big')) item.classList.remove('options__item_big');
                        item.classList.add('options__item_small')
                    }
                }

            }
        }

        for (let item of items){
            item.addEventListener("click", handlerI);
        }
        //----------------------------------
        return sectionProgress++;
    }


    return addElement();
    //return addElement; //для замыкания
}

//----------Get imgWidth-----------
function getImgParam(src, param){
    let tempImg = document.createElement('img');
    tempImg.src = src;

    return tempImg[param];
}

