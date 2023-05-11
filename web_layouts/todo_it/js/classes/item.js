export class Item {
    #itemHTML = '';
    id = null;

    constructor(text = '', isComplete = false, date = '', color = 'base') {
        this.text = text;
        this.date = date;
        this.color = color;
        this.isComplete = isComplete;
    }

    get itemHtml () {
        if (this.#itemHTML){
            return this.#itemHTML;
        }
        return null;
    }

    createHTML(numId = null){
        if (!this.id) this.id = numId.toString();
        if (this.id){
            this.#itemHTML = `<div class="block__item item ${this.isComplete ? 'item_complete' : 'item_todo'} drag-item" id="${this.id}">
                <div class="item__check-text">
                    <div class="item__checkbox checkbox">
                        <input type="checkbox" ${this.isComplete ? 'checked' : ''} id="checkbox_${this.id}" />
                        <label for="checkbox_${this.id}"></label>
                    </div>
                    <p class="item__text text ${this.isComplete ? 'text-line' : ''}">${this.text}</p>
                </div>
                <div class="item__calendar calendar">
                    <input type="date">
                    <div class="calendar__img"></div>
                    <h5 class="calendar__text"></h5>
                </div>
            </div>`;
        }
        return this.#itemHTML
    }

    toComplete(){
        this.isComplete = true;
        return this.createHTML();
    }

    unComplete(){
        this.isComplete = false;
        return this.createHTML();
    }
}