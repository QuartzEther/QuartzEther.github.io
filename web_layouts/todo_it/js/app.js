import {calendarInit, dateToInner} from './classes/calendar.js'
import {Item} from './classes/item.js'

//-----------------INIT----------------
setTimeout(()=>{
    let list = document.querySelector('.list');
    list.style.transition = '1s ease';
    list.style.opacity = 1;
},1000)

let data = localStorage.items ? JSON.parse(localStorage.items) : [];

let itemList = [];

const todoBlock = document.querySelector('.block_todo');
const completeBlock = document.querySelector('.block_complete');

const addBtn = document.querySelector('.header__btn');

//colors
export let colors = {
    light : {
        red: '#f22a2a',
        orange: '#f2711c',
        yellow: '#fbbd08',
        green: '#B5CC18',
        blue: '#00bcd4',
        violet: '#cd5dde',
        base: '#ffffff'
    },
    dark : {
        red: '#ae1616',
        orange: '#e17014',
        yellow: '#dea90a',
        green: '#539412',
        blue: '#2a3d9c',
        violet: '#6435C9',
        base: '#46466d'
    }
}

let colorTheme = document.querySelector('.list').classList.contains('list_dark-mode') ? colors.dark : colors.light;

//---------Заполнение данных из LocalStorage
console.log(data);

for (let item of data){
    itemList.push(new Item(item.text, item.isComplete, item.date, item.color));

    //create html text
    let el = itemList.at(-1);
    el.createHTML(item.id)

    //add items in DOM
    el.isComplete ? completeBlock.insertAdjacentHTML("beforeend", el.itemHtml)
        : todoBlock.insertAdjacentHTML("beforeend", el.itemHtml);
}

//calendar, checkbox, drug&drop and color init
for (let item of document.querySelectorAll('.drag-item')){
    let el = itemList[item.id];

    //checkbox
    item.querySelector('.checkbox').addEventListener('click', checkboxTouch)

    //date
    item.querySelector('.calendar > input').value = el.date;

    calendarInit(item.querySelector('.calendar'));
    item.querySelector('.calendar> input').addEventListener('change', ()=>{
        changeItemList(item, 'date', item.querySelector('.calendar > input').value)
        saveToLocalStorage();
    })

    //color
    for (let color of Object.entries(colorTheme)){
        if (el.color == color[0]) {
            item.style.backgroundColor = color[1];
        }
    }

    //drag&drop
    dragItem(item);

}

//-----------------ADD NEW ITEM----------------

let input = document.querySelector('.header__input');

addBtn.addEventListener('click', ()=>{
    if (input.value){
        itemList.push(new Item(input.value));

        todoBlock.insertAdjacentHTML("beforeend", itemList[itemList.length-1].createHTML(itemList.length-1));

        let item = todoBlock.querySelectorAll('.item')[todoBlock.querySelectorAll('.item').length - 1]

        calendarInit(item.querySelector('.calendar'));

        item.querySelector('.calendar> input').addEventListener('change', ()=>{
            changeItemList(item, 'date', item.querySelector('.calendar > input').value)
            saveToLocalStorage();
        })


        item.querySelector('.checkbox').addEventListener('click', checkboxTouch)

        dragItem(item)

        input.value = '';
        saveToLocalStorage();

    }

})
//----------------Moving Items-------------------

//move width checkbox
function checkboxTouch(e){
    //выборка именно input checkbox т.е один элемент
    if (e.target.id) {
        let checkbox = e.target;
        let item = e.target.parentNode.parentNode.parentElement;

        if (checkbox.checked){
            item.classList.replace('item_todo', 'item_complete');
            item.querySelector('.text').classList.add('text-line');

            completeBlock.appendChild(item)

            changeItemList(item, 'isComplete', true);
        } else {
            item.classList.replace('item_complete','item_todo')
            item.querySelector('.text').classList.remove('text-line');



            todoBlock.appendChild(item)
            changeItemList(item, 'isComplete', false);
        }

        saveToLocalStorage();

    }
}

//move with drug&drop
function dragItem(item){

    let containers = document.querySelectorAll(".drag-list");
    let container = item.parentElement;

    let prevContainer = null;
    let nextContainer = null;

    if (containers.length > 1){
        if (container.nextElementSibling && container.nextElementSibling.classList.contains('drag-list')){
            nextContainer = container.nextElementSibling;
        }
        if (container.previousElementSibling && container.previousElementSibling.classList.contains('drag-list')){
            prevContainer = container.previousElementSibling;
        }
    }

    let margin = item.getBoundingClientRect().y; //закрепление позиции item сверху

    let click1 = null;
    let click2 = null;

    item.addEventListener('touchstart', touchStart, {passive: false});
    item.addEventListener('mousedown', touchStart);

    function touchStart (event){

        //if checkbox click & item container != reel container
        if (container != item.parentElement){

            container = item.parentElement;
            nextContainer = null;
            prevContainer = null;

            if (containers.length > 1){
                if (container.nextElementSibling && container.nextElementSibling.classList.contains('drag-list')){
                    nextContainer = container.nextElementSibling;
                }
                if (container.previousElementSibling && container.previousElementSibling.classList.contains('drag-list')){
                    prevContainer = container.previousElementSibling;
                }
            }
        }

        //---------Отслеживание нажатия на checkbox или календарь
        if (event.target.tagName.toLowerCase() == 'label'
            || event.target.tagName.toLowerCase() == 'input'){
            return;
        }

        //отключение прокрутки страницы
        if (event.cancelable) event.preventDefault();

        //--------Double click/tap
        click2 = Date.now();

        if (click1 && click2 - click1 < 200){
            popUp(item);
            return;
        }
        click1 = click2;

        //----------Начало драг&дроп
        margin =  item.getBoundingClientRect().y; //закрепление позиции item сверху
        item.style.transition = 'none'

        item.style.position = 'relative';
        item.style.zIndex = '10';

        if (event.targetTouches){
            let touch = event.targetTouches[0];
            item.style.top = touch.clientY - margin - item.offsetHeight / 2 + 'px';

            document.addEventListener('touchmove', touchMove, {passive: false});
            document.addEventListener('touchend', touchEnd);
            document.addEventListener('touchcancel', touchEnd);
        } else {
            item.style.top = event.clientY - margin - item.offsetHeight / 2 + 'px';

            document.addEventListener('mousemove', touchMove);
            document.addEventListener('mouseup', touchEnd);
        }
    }


    function touchMove(event) {
        if (event.cancelable) event.preventDefault();

        let touch = event.targetTouches? event.targetTouches[0]:event;
        item.style.top = touch.clientY - margin - item.offsetHeight / 2 + 'px';

        let thisEl = item;
        let prevEl = thisEl.previousElementSibling;
        let nextEl = thisEl.nextElementSibling;

        //перемещение item

        //перемещение вниз
        if (nextEl && item.getBoundingClientRect().y > nextEl.getBoundingClientRect().y
            && !nextEl.classList.contains('block__tittle')
            && !nextEl.classList.contains('animation-down')){
            container.insertBefore(nextEl, thisEl);

            nextEl.classList.add('animation-up');
            nextEl.addEventListener("animationend", () =>{
                nextEl.classList.remove('animation-up')
            }, false);

            item.style.top = 0;
            margin = item.getBoundingClientRect().y;

            saveToLocalStorage();

        } else if (prevEl && item.getBoundingClientRect().y < prevEl.getBoundingClientRect().y
            && !prevEl.classList.contains('block__tittle')
            && !prevEl.classList.contains('animation-up')){ //вверх
            container.insertBefore(thisEl, prevEl);

            prevEl.classList.add('animation-down')
            prevEl.addEventListener("animationend", () =>{
                prevEl.classList.remove('animation-down')
            }, false);

            item.style.top = 0;
            margin = item.getBoundingClientRect().y;

            saveToLocalStorage();

        } else if (nextContainer
            && (item.getBoundingClientRect().bottom) > nextContainer.querySelector('.block__tittle').getBoundingClientRect().bottom + 10){ //в нижний контейнер

            let textEl = nextContainer.querySelector('.block__tittle');

            nextContainer.prepend(item);
            nextContainer.insertBefore(textEl, item)

            textEl.classList.add('animation-up')
            textEl.addEventListener("animationend", () =>{
                textEl.classList.remove('animation-up')
            }, false);

            prevContainer = container;
            container = nextContainer;
            nextContainer = (container.nextElementSibling && container.nextElementSibling.classList.contains('drag-list')) ?
                container.nextElementSibling : null;

            item.style.top = 0;
            margin = item.getBoundingClientRect().y;

            item.querySelector('.checkbox > input').checked = true;
            item.classList.replace('item_todo', 'item_complete');
            item.querySelector('.text').classList.add('text-line');

            changeItemList(item, 'isComplete', true);

            saveToLocalStorage();

        } else if (prevContainer
            && item.getBoundingClientRect().y < prevContainer.getBoundingClientRect().bottom){ //в верхний контейнер

            let textEl = container.querySelector('.block__tittle');
            prevContainer.appendChild(item);

            textEl.classList.add('animation-down')
            textEl.addEventListener("animationend", () =>{
                textEl.classList.remove('animation-down')
            }, false);

            nextContainer = container;
            container = prevContainer;
            prevContainer = (container.previousElementSibling && container.previousElementSibling.classList.contains('drag-list')) ?
                container.previousElementSibling : null;

            item.style.top = 0;
            margin = item.getBoundingClientRect().y;

            item.querySelector('.checkbox > input').checked = false;
            item.classList.replace('item_complete', 'item_todo');
            item.querySelector('.text').classList.remove('text-line');


            changeItemList(item, 'isComplete', false);
            saveToLocalStorage();
        }

    }

    function touchEnd (){
        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('mousemove', touchMove);

        item.ontouchend = null;
        item.style.transition = 'all .3s ease'
        item.style.top = 0;

        item.style.zIndex = '1';
    }
}

//pop-up
function popUp(item){
    //init
    let popUp = document.querySelector('.pop-up');
    popUp.style.visibility = 'visible'

    let btnOk = popUp.querySelector('.pop-btn_ok');
    let btnDel = popUp.querySelector('.pop-btn_del');

    calendarInit(document.querySelector('.pop-up__calendar'), true);

    let colorBar = popUp.querySelectorAll('.color-bar > input');
    let itemColor = getColor(item).toLowerCase();
    colorTheme = document.querySelector('.list').classList.contains('list_dark-mode') ? colors.dark : colors.light;

    //заполнение исходя из item
    //text
    popUp.querySelector('.form > textarea').value = item.querySelector('.text').innerHTML;

    //calendar
    dateToInner(popUp.querySelector('.calendar'), item.querySelector('.calendar > input'), true);

    //color
    for (let color of Object.entries(colorTheme)){
        if (itemColor == color[1].toLowerCase()) {
            for (let colorItem of colorBar){
                colorItem.checked = (colorItem.id == color[0]) ? true : false;
            }
        }
    }


    btnOk.addEventListener('click', changeItem);
    btnDel.addEventListener('click', deleteItem);

    function changeItem() {
        //text
        let text = popUp.querySelector('.form > textarea').value;
        if (!text){
            deleteItem();
            return;
        }

        item.querySelector('.text').innerHTML = text;

        changeItemList(item, 'text', text);

        //calendar
        dateToInner(item.querySelector('.calendar'), popUp.querySelector('.calendar > input'));
        changeItemList(item, 'date', popUp.querySelector('.calendar > input').value);

        //color
        for (let colorItem of colorBar){
            if (colorItem.checked){
                item.style.backgroundColor = colorTheme[colorItem.id];
                changeItemList(item, 'color', colorItem.id);
            }
        }
        closePopUp()
    }

    function deleteItem() {
        changeItemList(item, 'text', '');
        item.remove();

        closePopUp()
    }

    function closePopUp(){
        popUp.style.visibility = 'hidden';

        btnOk.removeEventListener('click', changeItem);
        btnDel.removeEventListener('click', deleteItem);

        saveToLocalStorage();
    }
}

export function getColor(tag) {
    let toHex = function(color) {
        let hex = function(str) {
            let result = parseInt(str).toString(16);
            if (result.length < 2)
                result = '0' + result;
            return result;
        }

        let rgb = color.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/);
        if (!rgb)
            return color;
        return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    let style = window.getComputedStyle(tag);
    return toHex(style.backgroundColor);
}


function changeItemList(item, key, newValue){
    let id = item.id;
    let tempItem = null;

    for (let i of itemList){
        if (i.id == id) tempItem = i;
    }
    if (tempItem){
        tempItem[key] = newValue;
    }
}

function saveToLocalStorage(){
    let dataToStorage = [];
    let items = document.querySelectorAll('.item');

    for (let item of items){
        dataToStorage.push({});

        let dataItem = dataToStorage[dataToStorage.length-1];
        let thisItem = null;

        for (thisItem of itemList){
            if (item.id == thisItem.id) break;
        }

        dataItem.id = dataToStorage.length-1;
        dataItem.text = thisItem.text;
        dataItem.isComplete = thisItem.isComplete;
        dataItem.date = thisItem.date;
        dataItem.color = thisItem.color;
    }

    localStorage.setItem('items', JSON.stringify(dataToStorage))
}