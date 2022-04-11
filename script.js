// ~~~~~~~~~~~~~~~~~~~~~~~~~ SVG ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const editIcon = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z">
                    </path>
                </svg>`

const deleteIcon = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" aria-label="fontSize small">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z">
                    </path>
                </svg>`

const arrowLeftIcon = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowBackIcon" aria-label="fontSize small">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z">
                    </path>
                </svg>`

const arrowRightIcon = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIcon" aria-label="fontSize small">
                    <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z">
                    </path>
                </svg>`

// ~~~~~~~~~~~~~~~~~~~~~~~~~ API ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Api = (() => {

    const baseUrl = "http://localhost:3000/todos";

    const getTodo = () =>
        fetch(baseUrl)
            .then((response) => response.json());

    const deleteTodo = id => 
        fetch([baseUrl, id].join("/"), {
            method: 'DELETE',
        });
    
    const addTodo = (todo) =>
        fetch(baseUrl, {
            method: 'POST',
            body: JSON.stringify(todo),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json())

    const updateTodo = (id, todo) =>
        fetch([baseUrl, id].join("/"), {
            method: "PUT",
            body: JSON.stringify(todo),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        }).then((response) => response.json());

    return {
        getTodo,
        deleteTodo,
        addTodo,
        updateTodo
    }
})();
// ~~~~~~~~~~~~~~~~~~~~~~~~~ View ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const View = (() => {

    const domstr = {
        todolistgroup: ".todo__task--list",
        pendingtodolist: '#todo__task--leftContainer',
        completetodolist: '#todo__task--rightContainer',
        submitButton: '.todo__submit--submitBtn',
        deletebtn: '.deletbtn',
        inputbox: '.todo__submit--inputText',
        editbtn: '.editbtn'
    };
    const render = (ele, tmp) => {
        ele.innerHTML = tmp;
    }
    const createTmp = (arr,status) => {
        let tmp = "";
        arr.forEach(todo => {
            if (todo.isCompleted === status && status === true) {
                tmp += `
                <li>
                    <div class="todo__task--leftBtns">
                        <button class="completebtn" id=${todo.id}>
                            ${arrowLeftIcon}
                        </button>
                    </div>
                    <div id=${todo.id} class="todo__task--content">
                        <span id=${todo.id}>${todo.content}</span>
                    </div>
                    <div class="todo__task--rightBtns">
                        <button class="editbtn" id=${todo.id}>
                            ${editIcon}
                        </button>
                        <button class="deletbtn" id=${todo.id}>
                            ${deleteIcon}
                        </button>
                    </div>    
                </li>
                `
            } else if (todo.isCompleted === status && status === false) {
                tmp += `
                    <li>
                        <div id=${todo.id} class="todo__task--content">
                            <span id=${todo.id}>${todo.content}</span>
                        </div>
                        <div class="todo__task--btns">
                            <button class="editbtn" id=${todo.id}>
                                ${editIcon}
                            </button>
                            <button class="deletbtnClass" id=${todo.id}>
                                ${deleteIcon}
                            </button>
                            <button class="completebtn" id=${todo.id}>
                                ${arrowRightIcon}
                            </button>
                        </div>    
                    </li>
                `
            }
        })
        return tmp;
    }

    return { 
        render,
        createTmp,
        domstr
    };
})();
// ~~~~~~~~~~~~~~~~~~~~~~~~~ View ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Model = ((api, view) => {
    
    class Todo {
        constructor(content) {
            this.content = content;
            this.isCompleted = false;
        }
    }

    class State {
        #todolist = [];

        get todolist() {
            return this.#todolist;
        }
        set todolist(newtodos) {
            this.#todolist = [...newtodos];

            //
            const pendingContainer = document.querySelector(view.domstr.pendingtodolist);
            const completeContainer = document.querySelector(view.domstr.completetodolist);
            const pendingTmp = view.createTmp(this.#todolist, false);
            const completeTmp = view.createTmp(this.#todolist, true);

            // everytimes when click the delete button, the view.render will render the page
            view.render(pendingContainer, pendingTmp);
            view.render(completeContainer, completeTmp);

        }
    }

    const getTodo = api.getTodo;
    const deleteTodo = api.deleteTodo;
    const addTodo = api.addTodo;
    const updateTodo = api.updateTodo;

    return { 
        getTodo, 
        deleteTodo,
        addTodo,
        updateTodo,
        Todo,
        State 
    }
})(Api, View);
// ~~~~~~~~~~~~~~~~~~~~~~~~~ Controller ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Controller = ((model, view) => {
    const state = new model.State();

    const addTodo = () => {
        const inputbox = document.querySelector(view.domstr.inputbox);
        const submitBtn = document.querySelector(view.domstr.submitButton);
        // const todoItem = "";

        submitBtn.addEventListener("click", (event) => {
            const newtodo = new model.Todo(inputbox.value);
            model.addTodo(newtodo).then(todo => {
                state.todolist = [todo, ...state.todolist];
            })
            console.log("New added Item Result: ", state.todolist);
        })
    }

    const deleteTodo = () => {
        const pendingContainer = document.querySelector(view.domstr.pendingtodolist);
        const completeContainer = document.querySelector(view.domstr.completetodolist);
        pendingContainer.addEventListener('click', (event) => {
            if (event.target.className === "deletbtnClass") {
                state.todolist = state.todolist.filter(
                    (todo) => +todo.id !== +event.target.id
                );
                model.deleteTodo(parseInt(event.target.id));
                model.getTodo().then(todos => {
                    state.todolist = todos
                    console.log("New deleted Items: ", state.todolist);
                })
            }
        });
        completeContainer.addEventListener('click', (event) => {
            if (event.target.className === "deletbtn") {
                state.todolist = state.todolist.filter(
                    (todo) => +todo.id !== +event.target.id
                );
                model.deleteTodo(event.target.id);
                model.getTodo().then(todos => {
                    state.todolist = todos
                    console.log("New deleted Items: ", state.todolist);
                })
            }
        });
    }

    const editTodo = () => {
        const container = document.querySelector(view.domstr.todolistgroup);
        container.addEventListener('click', (event) => {
            if (event.target.className === "editbtn") {
                const spanText = container.querySelectorAll(`span[id='${event.target.id}']`)[0];
                const inputText =container.querySelectorAll(`input[id='${event.target.id}']`)[0];
                const divText = container.querySelectorAll(`div[id='${event.target.id}']`)[0];
                if (spanText === undefined) {

                    var newObj = [];
                    state.todolist.forEach((ele) => {
                        if (+ele.id === +event.target.id) {
                            ele.content = inputText.value;
                            model.updateTodo(event.target.id, ele);
                        }
                        newObj.push(ele)
                    })
                    state.todolist = newObj;
                    
                    divText.innerHTML = `<span id=${event.target.id}>${inputText.value}</span>`
                } else if (spanText.tagName === "SPAN") {
                    divText.innerHTML = `<input id="${event.target.id}" type="text" />`
                }
            }
        })
    }

    const changeStatus = () => {
        const container = document.querySelector(view.domstr.todolistgroup);
        container.addEventListener('click', (event) => {
            if (event.target.className === "completebtn") {
                var newObj = [];
                state.todolist.forEach((ele) => {
                    if (+ele.id === +event.target.id) {
                        if (ele.isCompleted === true) {
                            ele.isCompleted = false;
                        } else if (ele.isCompleted === false) {
                            ele.isCompleted = true;
                            // console.log(ele)
                        }
                        model.updateTodo(event.target.id, ele);
                    }
                    newObj.push(ele)
                })
                state.todolist = newObj;
            }
        })
    }

    const init = () => {
        // model.getTodo() returns a list of To Dos from API get method
        model.getTodo().then(todos => {
            console.log(todos)
            state.todolist = todos;
        });
    };

    const bootstrap = () => {
        init();
        editTodo();
        deleteTodo();
        addTodo();
        changeStatus();
    }

    return { bootstrap };
})(Model, View);

Controller.bootstrap();