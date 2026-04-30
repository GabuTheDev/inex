import {D2} from "../utils/d2";
import "../../css/ui/error.css"
export class ErrorUI {
    constructor(message, description = "", trace = null, retry = null, buttons = []) {
        this.el = D2.Div("errorui-area", () => {
            D2.Icon("triangle-alert")
            D2.Text("h1", message);
            D2.Text("p", description);
            D2.Div("button-row", () => {
                if(retry) {
                    let button = D2.Button("Retry", "cta");
                    button.addEventListener("click", retry);
                }

                if(trace) {
                    let box = D2.Div("trace-box hidden", () => {
                        D2.Text("pre", trace);
                    })
                    let button = D2.Button("Show trace")
                    button.addEventListener("click", () => {
                        box.classList.toggle("hidden");
                    })
                }

                for(let button of buttons) {
                    if(button.href) {
                        let _b = D2.CustomPlus("a", "button", {"href": button.href}, () => [
                            D2.Text("p", button.text)
                        ])
                    } else {
                        let _b = D2.Button(button.text, button.type ?? "");
                        _b.addEventListener("click", button.callback);
                    }
                }
            })
        })
    }
}
export class ContentError extends ErrorUI {
    constructor(message, description = "", trace = null, retry = null, buttons = []) {
        super(message, description, trace, retry, buttons);
        document.getElementById("main").innerHTML = "";
        document.getElementById("main").appendChild(this.el);
    }
}