import {colors, getColor} from './app.js'

let toggle = document.querySelector('.toggle-switch>input');

if (localStorage.theme){
    toggle.checked = (localStorage.theme == 'dark')? true : false;
}

setTheme();

toggle.addEventListener('click', setTheme)

function setTheme(){
    document.querySelector('.list').style.transition = '0s';
    if (toggle.checked) {
        document.querySelector('body').style.backgroundColor = '#434582';
        document.querySelector('.toggle-switch').style.backgroundPosition = "5% 100%";
        document.querySelector('.toggle-switch').style.boxShadow = "0 0 15px 10px rgba(0,0,0,0.1) inset";

        document.querySelector('.list').classList.add('list_dark-mode');
        document.querySelector('.pop-up').classList.add('pop-up_dark-mode');
        document.querySelector('.copyright').classList.add('copyright_dark');


        chengeColorTheme (colors.light, colors.dark);
        localStorage.setItem('theme', 'dark');
    } else {
        document.querySelector('body').style.backgroundColor = '#F2F8FB';

        document.querySelector('.toggle-switch').style.backgroundPosition = "100% 100%";
        document.querySelector('.toggle-switch').style.boxShadow = "0 0 15px 10px rgba(0,0,0,0.1) inset";

        document.querySelector('.list').classList.remove('list_dark-mode');
        document.querySelector('.pop-up').classList.remove('pop-up_dark-mode');
        document.querySelector('.copyright').classList.remove('copyright_dark');

        chengeColorTheme (colors.dark, colors.light);
        localStorage.setItem('theme', 'light');
    }
}

//изменение цвета item'ов
function chengeColorTheme (oldTheme, newTheme){
    let items = document.querySelectorAll('.drag-item');

    for (let item of items){
        item.style.transition = 'none';

        for (let color of Object.entries(oldTheme)){
            if (getColor(item).toLowerCase() == color[1].toLowerCase()) {
                item.style.backgroundColor = newTheme[color[0]];
                break;
            }
        }

    }
}