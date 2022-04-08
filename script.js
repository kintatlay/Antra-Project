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
            // .then((json) => console.log(json));

    const updataTodo = id =>
        fetch([baseUrl, id].join("/"), {
            method: "PUT",
        });

    return {
        getTodo,
        deleteTodo,
        addTodo,
        updataTodo
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
            if (todo.isCompleted === status) {
                tmp += `
                <li>
                    <span>${todo.content}</span>
                    <button class="editbtn id=${todo.id}">Edit</button>
                    <button class="deletbtn" id=${todo.id}>Trash</button>
                    <button class="completebtn" id=${todo.id}>-></button>
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

    return { 
        getTodo, 
        deleteTodo,
        addTodo,
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

    // const editTodo = () => {
    //     const container = document.querySelector(view.domstr.todolistgroup);
    //     container.addEventListener('click', (event) => {
    //         if (event.target.className === "editbtn") {
    //             state.todolist = state.todolist.forEach((ele) => {
    //                 if (+ele.id === +event.target.id) {
                       
    //                 }
    //             })
    //         }
    //     })
    // }

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
                    }
                    newObj.push(ele)
                })
                state.todolist = newObj;
                model.updataTodo(event.target.id);
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
        // editTodo();
        deleteTodo();
        addTodo();
        changeStatus();
    }

    return { bootstrap };
})(Model, View);

Controller.bootstrap();